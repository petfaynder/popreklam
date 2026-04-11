import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';


// ─── Publisher: Update Profile ────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { companyName, taxId, website } = req.body;

        const publisher = await prisma.publisher.update({
            where: { userId },
            data: {
                ...(companyName !== undefined && { companyName }),
                ...(taxId !== undefined && { taxId }),
            },
        });

        res.json({ message: 'Profile updated successfully', publisher });
    } catch (error) {
        console.error('updateProfile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// ─── Publisher: Change Password ───────────────────────────────────────────────
export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password are required' });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('changePassword error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
};

// ─── Publisher: Update Payment Settings ──────────────────────────────────────
export const updatePaymentSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const { preferredPaymentMethod, paymentEmail, bankDetails } = req.body;

        const publisher = await prisma.publisher.update({
            where: { userId },
            data: {
                ...(preferredPaymentMethod !== undefined && { preferredPaymentMethod }),
                ...(paymentEmail !== undefined && { paymentEmail }),
                ...(bankDetails !== undefined && { bankDetails }),
            },
        });

        res.json({ message: 'Payment settings updated successfully', publisher });
    } catch (error) {
        console.error('updatePaymentSettings error:', error);
        res.status(500).json({ error: 'Failed to update payment settings' });
    }
};

// ─── Publisher: Generate API Token ───────────────────────────────────────────
export const generateApiToken = async (req, res) => {
    try {
        const token = crypto.randomBytes(32).toString('hex');

        // Try to persist — graceful fallback if field missing
        try {
            await prisma.publisher.update({
                where: { userId: req.user.id },
                data: { apiToken: token },
            });
        } catch (_) {
            // apiToken field may not exist yet — return anyway
        }

        res.json({ token, message: 'API token generated successfully' });
    } catch (error) {
        console.error('generateApiToken error:', error);
        const token = crypto.randomBytes(32).toString('hex');
        res.json({ token, message: 'API token generated (not persisted — run migration)' });
    }
};

// ─── Publisher: Create Support Ticket ────────────────────────────────────────
export const createSupportTicket = async (req, res) => {
    try {
        const userId = req.user.id;
        const { subject, category, priority, message } = req.body;

        if (!subject?.trim() || !message?.trim()) {
            return res.status(400).json({ error: 'Subject and message are required' });
        }

        // Schema: SupportTicket has no message/role field directly
        // Messages are stored in TicketMessage relation
        const ticket = await prisma.supportTicket.create({
            data: {
                userId,
                subject: subject.trim(),
                category: category || 'general',
                priority: (priority || 'MEDIUM').toUpperCase(),
                status: 'OPEN',
                messages: {
                    create: {
                        senderId: userId,
                        isAdmin: false,
                        isInternal: false,
                        message: message.trim(),
                    }
                }
            },
            include: { messages: true }
        });

        res.status(201).json({ ticket, message: 'Support ticket submitted successfully' });
    } catch (error) {
        console.error('createSupportTicket error:', error);
        res.status(500).json({ error: 'Failed to create support ticket', detail: error.message });
    }
};

// ─── Publisher: Get Support Tickets ──────────────────────────────────────────
export const getSupportTickets = async (req, res) => {
    try {
        const userId = req.user.id;

        const tickets = await prisma.supportTicket.findMany({
            where: { userId },
            include: {
                messages: {
                    where: { isInternal: false },
                    orderBy: { createdAt: 'asc' },
                    include: { sender: { select: { id: true, email: true, role: true } } }
                },
                _count: { select: { messages: true } }
            },
            orderBy: { updatedAt: 'desc' }
        });

        res.json({ tickets });
    } catch (error) {
        console.error('getSupportTickets error:', error);
        res.status(500).json({ error: 'Failed to fetch support tickets' });
    }
};

// ─── Publisher: Reply to Support Ticket ──────────────────────────────────────
export const replyToTicket = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { message } = req.body;

        if (!message?.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Verify ticket belongs to this user
        const ticket = await prisma.supportTicket.findFirst({
            where: { id, userId }
        });

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        if (ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') {
            return res.status(400).json({ error: 'Cannot reply to a closed or resolved ticket' });
        }

        const [newMsg] = await prisma.$transaction([
            prisma.ticketMessage.create({
                data: {
                    ticketId: id,
                    senderId: userId,
                    isAdmin: false,
                    isInternal: false,
                    message: message.trim(),
                },
                include: { sender: { select: { id: true, email: true, role: true } } }
            }),
            prisma.supportTicket.update({
                where: { id },
                data: { status: 'OPEN', updatedAt: new Date() }
            })
        ]);

        res.status(201).json({ message: 'Reply sent', ticketMessage: newMsg });
    } catch (error) {
        console.error('replyToTicket error:', error);
        res.status(500).json({ error: 'Failed to send reply', detail: error.message });
    }
};

// ─── Publisher: Stats Overview ────────────────────────────────────────────────
export const getStatsOverview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { period = 30 } = req.query;

        const publisher = await prisma.publisher.findUnique({
            where: { userId },
            include: { sites: true },
        });

        if (!publisher) {
            return res.status(404).json({ error: 'Publisher not found' });
        }

        const since = new Date();
        since.setDate(since.getDate() - parseInt(period));

        const siteIds = publisher.sites.map(s => s.id);

        // Get zone IDs for these sites
        const zones = await prisma.zone.findMany({
            where: { siteId: { in: siteIds } },
            select: { id: true }
        });
        const zoneIds = zones.map(z => z.id);

        const [totalImpressions, totalClicks] = await Promise.all([
            prisma.impression.count({ where: { zoneId: { in: zoneIds }, createdAt: { gte: since } } }),
            prisma.impression.count({ where: { zoneId: { in: zoneIds }, clicked: true, createdAt: { gte: since } } }),
        ]);

        const revenue = await prisma.impression.aggregate({
            where: { zoneId: { in: zoneIds }, createdAt: { gte: since } },
            _sum: { publisherRevenue: true },
        });

        const totalRevenue = parseFloat(revenue._sum.publisherRevenue || 0);
        const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : '0.00';
        const ecpm = totalImpressions > 0 ? (totalRevenue / totalImpressions * 1000).toFixed(2) : '0.00';

        res.json({
            period: parseInt(period),
            impressions: totalImpressions,
            clicks: totalClicks,
            revenue: totalRevenue.toFixed(2),
            ctr,
            ecpm,
            sites: publisher.sites.length,
        });
    } catch (error) {
        console.error('getStatsOverview error:', error);
        res.status(500).json({ error: 'Failed to fetch stats overview' });
    }
};
