import prisma from '../lib/prisma.js';

// Prisma client updated: dueAt + slaSatisfied fields now in DB (migration: add_sla_fields_to_ticket)

const CANNED_RESPONSES = [
    { id: 1, title: 'Will Review', text: 'Thank you for reaching out. Our team will review your request and get back to you within 24 hours.' },
    { id: 2, title: 'Need More Info', text: 'Thank you for contacting us. Could you please provide more details about your issue so we can assist you better?' },
    { id: 3, title: 'Issue Resolved', text: 'We are happy to inform you that your issue has been resolved. Please let us know if you need any further assistance.' },
    { id: 4, title: 'Billing Question', text: 'For billing inquiries, please note that payments are processed within 3-5 business days. If you have further questions, please reply to this message.' },
    { id: 5, title: 'Technical Issue', text: 'We have forwarded your technical issue to our engineering team. You will receive an update within 48 hours.' },
];

/**
 * GET /api/admin/support/canned-responses
 */
export const getCannedResponses = async (req, res) => {
    res.json({ responses: CANNED_RESPONSES });
};

/**
 * GET /api/admin/support/stats
 */
export const getTicketStats = async (req, res) => {
    try {
        const now = new Date();
        const [open, inProgress, resolved, closed, urgent, overdue] = await Promise.all([
            prisma.supportTicket.count({ where: { status: 'OPEN' } }),
            prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
            prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
            prisma.supportTicket.count({ where: { status: 'CLOSED' } }),
            prisma.supportTicket.count({ where: { priority: 'URGENT', status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
            prisma.supportTicket.count({ where: { dueAt: { lt: now }, status: { in: ['OPEN', 'IN_PROGRESS'] }, slaSatisfied: null } }),
        ]);

        res.json({ open, inProgress, resolved, closed, urgent, overdue, total: open + inProgress + resolved + closed });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ticket stats' });
    }
};

/**
 * GET /api/admin/support/tickets
 */
export const getTickets = async (req, res) => {
    try {
        const { status, priority, category, search, page = 1, limit = 20 } = req.query;
        const where = {};
        if (status && status !== 'ALL') where.status = status;
        if (priority) where.priority = priority;
        if (category) where.category = category;
        if (search) {
            where.OR = [
                { subject: { contains: search } },
                { user: { email: { contains: search } } }
            ];
        }

        const [tickets, total] = await Promise.all([
            prisma.supportTicket.findMany({
                where,
                include: {
                    user: { select: { id: true, email: true, role: true, balance: true } },
                    messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                    _count: { select: { messages: true } },
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
                // Null dueAt (no SLA) goes last; closest deadline first, then oldest ticket
                orderBy: [{ dueAt: 'asc' }, { createdAt: 'asc' }]
            }),
            prisma.supportTicket.count({ where })
        ]);

        const now = new Date();
        const ticketsWithSlaInfo = tickets.map(t => ({
            ...t,
            isOverdue: t.dueAt && t.dueAt < now && !['RESOLVED', 'CLOSED'].includes(t.status),
            slaRemainingHours: t.dueAt ? Math.round((t.dueAt.getTime() - now.getTime()) / 3_600_000) : null,
        }));

        res.json({
            tickets: ticketsWithSlaInfo,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
};

/**
 * GET /api/admin/support/tickets/:id
 */
export const getTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const ticket = await prisma.supportTicket.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true, email: true, role: true, status: true,
                        balance: true, createdAt: true,
                        publisher: { select: { companyName: true } },
                        advertiser: { select: { companyName: true } },
                        _count: { select: { supportTickets: true } }
                    }
                },
                messages: {
                    include: { sender: { select: { id: true, email: true, role: true } } },
                    orderBy: { createdAt: 'asc' }
                },
            }
        });

        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
        res.json({ ticket });
    } catch (error) {
        console.error('Get ticket error:', error);
        res.status(500).json({ error: 'Failed to fetch ticket' });
    }
};

/**
 * POST /api/admin/support/tickets/:id/reply
 */
export const replyTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });

        const [newMsg] = await prisma.$transaction([
            prisma.ticketMessage.create({
                data: { ticketId: id, senderId: req.user.id, isAdmin: true, isInternal: false, message: message.trim() }
            }),
            prisma.supportTicket.update({
                where: { id },
                data: { status: 'IN_PROGRESS', updatedAt: new Date() }
            })
        ]);

        const msg = await prisma.ticketMessage.findUnique({
            where: { id: newMsg.id },
            include: { sender: { select: { id: true, email: true, role: true } } }
        });

        res.json({ message: 'Reply sent', ticketMessage: msg });
    } catch (error) {
        console.error('Reply ticket error:', error);
        res.status(500).json({ error: 'Failed to send reply' });
    }
};

/**
 * POST /api/admin/support/tickets/:id/note
 * Internal note — user can't see
 */
export const addInternalNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;
        if (!message?.trim()) return res.status(400).json({ error: 'Note is required' });

        const note = await prisma.ticketMessage.create({
            data: { ticketId: id, senderId: req.user.id, isAdmin: true, isInternal: true, message: message.trim() },
            include: { sender: { select: { id: true, email: true } } }
        });

        res.json({ message: 'Note added', ticketMessage: note });
    } catch (error) {
        console.error('Add note error:', error);
        res.status(500).json({ error: 'Failed to add note' });
    }
};

/**
 * PUT /api/admin/support/tickets/:id/status
 */
export const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
        if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

        const data = { status };
        if (status === 'CLOSED' || status === 'RESOLVED') {
            data.closedAt = new Date();
            // Set SLA satisfied: true if resolved before dueAt
            const ticket = await prisma.supportTicket.findUnique({ where: { id }, select: { dueAt: true } });
            if (ticket?.dueAt) {
                data.slaSatisfied = new Date() <= ticket.dueAt;
            }
        }

        const ticket = await prisma.supportTicket.update({ where: { id }, data });
        res.json({ message: 'Status updated', ticket });
    } catch (error) {
        console.error('Update ticket status error:', error);
        res.status(500).json({ error: 'Failed to update ticket status' });
    }
};

/**
 * PUT /api/admin/support/tickets/:id/priority
 */
export const updateTicketPriority = async (req, res) => {
    try {
        const { id } = req.params;
        const { priority } = req.body;
        const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
        if (!validPriorities.includes(priority)) return res.status(400).json({ error: 'Invalid priority' });

        const ticket = await prisma.supportTicket.update({ where: { id }, data: { priority } });
        res.json({ message: 'Priority updated', ticket });
    } catch (error) {
        console.error('Update ticket priority error:', error);
        res.status(500).json({ error: 'Failed to update priority' });
    }
};

/**
 * POST /api/admin/support/tickets — Create ticket (for publisher/advertiser, delegated here)
 */
export const createTicket = async (req, res) => {
    try {
        const { subject, message, category, priority } = req.body;
        if (!subject || !message) return res.status(400).json({ error: 'Subject and message are required' });

        const ticket = await prisma.supportTicket.create({
            data: {
                userId: req.user.id,
                subject,
                category: category || 'general',
                priority: priority || 'MEDIUM',
                messages: {
                    create: {
                        senderId: req.user.id,
                        isAdmin: false,
                        isInternal: false,
                        message,
                    }
                }
            },
            include: { messages: true }
        });

        res.status(201).json({ message: 'Ticket created', ticket });
    } catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
};

/**
 * GET /api/support/my-tickets — Publisher/Advertiser kendi ticket'larını görür
 */
export const getMyTickets = async (req, res) => {
    try {
        const tickets = await prisma.supportTicket.findMany({
            where: { userId: req.user.id },
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
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
};
