import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role; // ADVERTISER or PUBLISHER
        
        // Find notifications targeting ALL, or the specific role
        const notifications = await prisma.notification.findMany({
            where: {
                status: 'ACTIVE',
                OR: [
                    { targetGroup: 'ALL' },
                    { targetGroup: role }
                ],
                // AND: either expiresAt is null, or > now
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        // Get read statuses for this user
        const notificationIds = notifications.map(n => n.id);
        const reads = await prisma.notificationRead.findMany({
            where: {
                userId,
                notificationId: { in: notificationIds }
            }
        });

        const readSet = new Set(reads.map(r => r.notificationId));

        // Format response
        const formattedNotifications = notifications.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type,
            createdAt: n.createdAt,
            isRead: readSet.has(n.id)
        }));

        res.json(formattedNotifications);
    } catch (error) {
        console.error('[Notifications GET] Error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Check if already read
        const existing = await prisma.notificationRead.findFirst({
            where: { userId, notificationId: id }
        });

        if (!existing) {
            await prisma.notificationRead.create({
                data: {
                    userId,
                    notificationId: id
                }
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('[Notifications Mark Read] Error:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};

// ==============================
// ADMIN CONTROLLERS
// ==============================

export const adminGetNotifications = async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(notifications);
    } catch (error) {
        console.error('[Admin Notifications GET] Error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

export const adminCreateNotification = async (req, res) => {
    try {
        const { title, message, type, targetGroup, expiresAt } = req.body;
        
        if (!title || !message) {
            return res.status(400).json({ error: 'Title and message are required' });
        }

        const notification = await prisma.notification.create({
            data: {
                title,
                message,
                type: type || 'INFO',
                targetGroup: targetGroup || 'ALL',
                status: 'ACTIVE',
                expiresAt: expiresAt ? new Date(expiresAt) : null
            }
        });

        res.status(201).json(notification);
    } catch (error) {
        console.error('[Admin Notifications POST] Error:', error);
        res.status(500).json({ error: 'Failed to create notification' });
    }
};

export const adminUpdateNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, message, type, targetGroup, status, expiresAt } = req.body;

        const notification = await prisma.notification.update({
            where: { id },
            data: {
                title,
                message,
                type,
                targetGroup,
                status,
                expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : undefined
            }
        });

        res.json(notification);
    } catch (error) {
        console.error('[Admin Notifications PUT] Error:', error);
        res.status(500).json({ error: 'Failed to update notification' });
    }
};

export const adminDeleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.notification.delete({
            where: { id }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('[Admin Notifications DELETE] Error:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
};
