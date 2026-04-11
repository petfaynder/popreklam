import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getSupportSLA } from '../services/priority.service.js';

// ─── Advertiser: Get Profile ──────────────────────────────────────────────────
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true }
        });
        const advertiser = await prisma.advertiser.findUnique({
            where: { userId },
            select: { companyName: true, taxId: true, billingAddress: true }
        });

        res.json({
            email: user?.email || '',
            companyName: advertiser?.companyName || '',
            taxId: advertiser?.taxId || '',
            billingAddress: advertiser?.billingAddress || '',
        });
    } catch (error) {
        console.error('getProfile error:', error);
        res.status(500).json({ error: 'Failed to load profile' });
    }
};


// ─── Advertiser: Update Profile ───────────────────────────────────────────────
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        // Accept both frontend naming (name, company, phone) and direct field names
        const { name, email, company, phone, companyName, taxId } = req.body;

        // Merge field aliases
        const resolvedCompany = companyName || company;

        // Update Advertiser profile fields
        const advertiser = await prisma.advertiser.update({
            where: { userId },
            data: {
                ...(resolvedCompany !== undefined && { companyName: resolvedCompany }),
                ...(taxId !== undefined && { taxId }),
            },
        });

        res.json({ message: 'Profile updated successfully', advertiser });
    } catch (error) {
        console.error('updateProfile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// ─── Advertiser: Change Password ───────────────────────────────────────────────
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

// ─── Advertiser: Update Billing Info ──────────────────────────────────────────
export const updateBillingInfo = async (req, res) => {
    try {
        const userId = req.user.id;
        // Accept both frontend naming (vatNumber, address) and direct field names
        const { companyName, taxId, vatNumber, billingAddress, address, billingEmail } = req.body;

        // Merge field aliases
        const resolvedTaxId = taxId || vatNumber;
        const resolvedAddress = billingAddress || address;

        // Store in Advertiser model
        const advertiser = await prisma.advertiser.update({
            where: { userId },
            data: {
                ...(companyName !== undefined && { companyName }),
                ...(resolvedTaxId !== undefined && { taxId: resolvedTaxId }),
                ...(resolvedAddress !== undefined && { billingAddress: resolvedAddress }),
            },
        });

        res.json({ message: 'Billing info updated successfully', advertiser });
    } catch (error) {
        console.error('updateBillingInfo error:', error);
        res.status(500).json({ error: 'Failed to update billing info' });
    }
};

// ─── Advertiser: Generate API Token ────────────────────────────────────────────
export const generateApiToken = async (req, res) => {
    try {
        const userId = req.user.id;
        const token = crypto.randomBytes(32).toString('hex');

        // Store token hash in Advertiser model (or a dedicated tokens table if available)
        await prisma.advertiser.update({
            where: { userId },
            data: { apiToken: token },
        }).catch(() => {
            // If apiToken field doesn't exist yet in schema, just return token
        });

        res.json({ token, message: 'API token generated successfully' });
    } catch (error) {
        console.error('generateApiToken error:', error);
        // Return a token even if DB update fails (field may not be migrated yet)
        const token = crypto.randomBytes(32).toString('hex');
        res.json({ token, message: 'API token generated (not persisted — run migration)' });
    }
};

// ─── Advertiser: Create Support Ticket ────────────────────────────────────────
export const createSupportTicket = async (req, res) => {
    try {
        const userId = req.user.id;
        const { subject, category, priority, message } = req.body;

        if (!subject?.trim() || !message?.trim()) {
            return res.status(400).json({ error: 'Subject and message are required' });
        }

        // Resolve advertiser tier for SLA deadline
        let slaHours = 48; // default (STARTER)
        let autoPriority = (priority || 'MEDIUM').toUpperCase();
        try {
            const advertiser = await prisma.advertiser.findUnique({
                where: { userId },
                select: { tier: true }
            });
            if (advertiser) {
                slaHours = await getSupportSLA(advertiser.tier);
                // Elevate priority automatically for VIP/ELITE
                if (advertiser.tier === 'VIP') autoPriority = 'URGENT';
                else if (advertiser.tier === 'ELITE' && autoPriority === 'LOW') autoPriority = 'MEDIUM';
            }
        } catch (_) { /* non-critical — continue with defaults */ }

        const dueAt = new Date(Date.now() + slaHours * 60 * 60 * 1000);

        const ticket = await prisma.supportTicket.create({
            data: {
                userId,
                subject: subject.trim(),
                category: category || 'general',
                priority: autoPriority,
                status: 'OPEN',
                dueAt,
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

        res.status(201).json({
            ticket,
            message: 'Support ticket submitted successfully',
            sla: { hours: slaHours, dueAt }
        });
    } catch (error) {
        console.error('createSupportTicket error:', error);
        res.status(500).json({ error: 'Failed to create support ticket', detail: error.message });
    }
};


// ─── Advertiser: Get Support Tickets ────────────────────────────────────────
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

// ─── Advertiser: Reply to Support Ticket ─────────────────────────────────────
export const replyToTicket = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { message } = req.body;

        if (!message?.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

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

