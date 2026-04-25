import prisma from '../lib/prisma.js';
import crypto from 'crypto';
import dns from 'dns';

// Get Dashboard Stats
export const getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const publisher = await prisma.publisher.findUnique({
            where: { userId },
            include: {
                sites: true
            }
        });

        if (!publisher) {
            return res.status(404).json({ message: 'Publisher profile not found' });
        }

        // Get today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const todayImpressions = await prisma.impression.count({
            where: {
                zone: {
                    site: {
                        publisherId: publisher.id
                    }
                },
                createdAt: {
                    gte: today
                }
            }
        });

        const yesterdayImpressions = await prisma.impression.count({
            where: {
                zone: {
                    site: {
                        publisherId: publisher.id
                    }
                },
                createdAt: {
                    gte: yesterday,
                    lt: today
                }
            }
        });

        const todayClicks = await prisma.impression.count({
            where: {
                zone: {
                    site: {
                        publisherId: publisher.id
                    }
                },
                clicked: true,
                createdAt: {
                    gte: today
                }
            }
        });

        const todayRevenue = await prisma.impression.aggregate({
            where: {
                zone: {
                    site: {
                        publisherId: publisher.id
                    }
                },
                createdAt: {
                    gte: today
                }
            },
            _sum: {
                publisherRevenue: true
            }
        });

        const yesterdayRevenue = await prisma.impression.aggregate({
            where: {
                zone: {
                    site: {
                        publisherId: publisher.id
                    }
                },
                createdAt: {
                    gte: yesterday,
                    lt: today
                }
            },
            _sum: {
                publisherRevenue: true
            }
        });

        // Calculate total earnings
        const totalEarnings = await prisma.impression.aggregate({
            where: {
                zone: {
                    site: {
                        publisherId: publisher.id
                    }
                }
            },
            _sum: {
                publisherRevenue: true
            }
        });

        const totalImpressions = await prisma.impression.count({
            where: {
                zone: {
                    site: {
                        publisherId: publisher.id
                    }
                }
            }
        });

        const totalClicks = await prisma.impression.count({
            where: {
                zone: {
                    site: {
                        publisherId: publisher.id
                    }
                },
                clicked: true
            }
        });

        // Calculate changes
        const revenueChange = yesterdayRevenue._sum.publisherRevenue > 0
            ? ((Number(todayRevenue._sum.publisherRevenue || 0) - Number(yesterdayRevenue._sum.publisherRevenue)) / Number(yesterdayRevenue._sum.publisherRevenue) * 100).toFixed(1)
            : 0;

        const impressionsChange = yesterdayImpressions > 0
            ? ((todayImpressions - yesterdayImpressions) / yesterdayImpressions * 100).toFixed(1)
            : 0;

        const ctr = todayImpressions > 0
            ? (todayClicks / todayImpressions * 100).toFixed(2)
            : '0.00';

        const averageCTR = totalImpressions > 0
            ? (totalClicks / totalImpressions * 100).toFixed(2)
            : '0.00';

        const averageECPM = totalImpressions > 0
            ? (Number(totalEarnings._sum.publisherRevenue || 0) / totalImpressions * 1000).toFixed(2)
            : '0.00';

        res.json({
            today: {
                revenue: Number(todayRevenue._sum.publisherRevenue || 0),
                revenueChange: Number(revenueChange),
                impressions: todayImpressions,
                impressionsChange: Number(impressionsChange),
                clicks: todayClicks,
                ctr: ctr
            },
            sites: {
                total: publisher.sites.length,
                active: publisher.sites.filter(s => s.status === 'ACTIVE').length
            },
            earnings: {
                total: Number(totalEarnings._sum.publisherRevenue || 0)
            },
            averageECPM: averageECPM,
            averageCTR: averageCTR
        });
    } catch (error) {
        console.error('Error getting dashboard:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Get All Sites
export const getSites = async (req, res) => {
    try {
        const userId = req.user.id;

        const publisher = await prisma.publisher.findUnique({
            where: { userId },
            include: {
                sites: {
                    include: {
                        zones: {
                            include: {
                                impressions: {
                                    where: {
                                        createdAt: {
                                            gte: new Date(new Date().setDate(new Date().getDate() - 30))
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!publisher) {
            return res.status(404).json({ message: 'Publisher not found' });
        }

        // Format sites with stats
        const sites = publisher.sites.map(site => {
            let impressions = 0;
            let revenue = 0;

            site.zones.forEach(zone => {
                impressions += zone.impressions.length;
                zone.impressions.forEach(imp => {
                    revenue += parseFloat(imp.publisherRevenue);
                });
            });

            return {
                id: site.id,
                publisherId: publisher.id,
                name: site.name,
                url: site.url,
                category: site.category,
                status: site.status,
                description: site.description,
                verificationToken: site.verificationToken,
                verifiedAt: site.verifiedAt,
                adsTxtVerifiedAt: site.adsTxtVerifiedAt,
                verificationMethod: site.verificationMethod,
                impressions,
                revenue: revenue.toFixed(2),
                createdAt: site.createdAt
            };
        });

        // Auto-fix missing tokens for older sites
        for (const site of sites) {
            if (!site.verificationToken) {
                const newToken = `pr-${crypto.randomBytes(8).toString('hex')}`;
                await prisma.site.update({
                    where: { id: site.id },
                    data: { verificationToken: newToken }
                });
                site.verificationToken = newToken;
            }
        }

        res.json(sites);
    } catch (error) {
        console.error('Error getting sites:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create Site
export const createSite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, url, category, description } = req.body;

        // Validate required fields
        if (!name || !url) {
            return res.status(400).json({ message: 'Name and URL are required' });
        }

        const publisher = await prisma.publisher.findUnique({
            where: { userId }
        });

        if (!publisher) {
            return res.status(404).json({ message: 'Publisher not found' });
        }

        const site = await prisma.site.create({
            data: {
                publisherId: publisher.id,
                name,
                url,
                category,
                description,
                status: 'PENDING', // Will be reviewed by admin
                verificationToken: `pr-${crypto.randomBytes(8).toString('hex')}`
            }
        });

        res.status(201).json(site);
    } catch (error) {
        console.error('Error creating site:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Verify Site Ownership
export const verifySite = async (req, res) => {
    try {
        const { id } = req.params;
        const { method } = req.body; // 'META', 'FILE', 'DNS'
        const userId = req.user.id;

        const publisher = await prisma.publisher.findUnique({ where: { userId } });
        if (!publisher) return res.status(404).json({ message: 'Publisher not found' });

        const site = await prisma.site.findFirst({
            where: { id, publisherId: publisher.id }
        });

        if (!site) return res.status(404).json({ message: 'Site not found' });
        if (site.verifiedAt) return res.status(400).json({ message: 'Site is already verified' });
        if (!site.verificationToken) return res.status(400).json({ message: 'No verification token generated for this site' });

        const token = site.verificationToken;
        let isVerified = false;

        // Ensure URL has protocol
        let targetUrl = site.url;
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl;
        }

        try {
            if (method === 'META') {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);

                const response = await fetch(targetUrl, {
                    method: 'GET',
                    signal: controller.signal,
                    headers: { 'User-Agent': 'MrPop.io-Verifier/1.0' }
                });
                clearTimeout(timeoutId);

                const html = await response.text();
                // Check multiple variations just in case of formatting differencess
                if (html.includes(token) && html.includes('mrpop-verification')) {
                    isVerified = true;
                }
            } else if (method === 'FILE') {
                const urlObj = new URL(targetUrl);
                const fileUrl = `${urlObj.protocol}//${urlObj.host}/${token}.txt`;

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000);

                const response = await fetch(fileUrl, {
                    method: 'GET',
                    signal: controller.signal,
                    headers: { 'User-Agent': 'MrPop.io-Verifier/1.0' }
                });
                clearTimeout(timeoutId);

                if (response.ok) {
                    const text = await response.text();
                    if (text.includes(token)) isVerified = true;
                }
            } else if (method === 'DNS') {
                const urlObj = new URL(site.url);
                const domain = urlObj.hostname.replace(/^www\./, '');
                const records = await dns.promises.resolveTxt(domain);
                for (const chunk of records) {
                    const recordStr = chunk.join('');
                    if (recordStr === `mrpop-site-verification=${token}`) {
                        isVerified = true;
                        break;
                    }
                }
            } else {
                return res.status(400).json({ message: 'Invalid verification method' });
            }
        } catch (checkError) {
            console.error('Verification Check Error:', checkError.message);
            // Ignore fetch/dns errors and just fail verification
        }

        if (isVerified) {
            const updated = await prisma.site.update({
                where: { id },
                data: {
                    verifiedAt: new Date(),
                    verificationMethod: method
                }
            });
            return res.json({ success: true, site: updated });
        } else {
            return res.status(400).json({ message: `Verification failed using ${method} method. Please ensure the token is correctly placed.` });
        }

    } catch (error) {
        console.error('Error verifying site:', error);
        res.status(500).json({ message: 'Server error during verification' });
    }
};

// Verify Ads.txt
export const verifyAdsTxt = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const publisher = await prisma.publisher.findUnique({ where: { userId } });
        if (!publisher) return res.status(404).json({ message: 'Publisher not found' });

        const site = await prisma.site.findFirst({
            where: { id, publisherId: publisher.id }
        });

        if (!site) return res.status(404).json({ message: 'Site not found' });

        // Ensure URL has protocol
        let targetUrl = site.url;
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl;
        }

        const urlObj = new URL(targetUrl);
        const adsTxtUrl = `${urlObj.protocol}//${urlObj.host}/ads.txt`;
        const expectedLine = `mrpop.io, ${publisher.id}, DIRECT, 1a2b3c4d5e6f7g8h`; // Using a dummy cert ID for now

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
            const response = await fetch(adsTxtUrl, {
                method: 'GET',
                signal: controller.signal,
                headers: { 'User-Agent': 'MrPop.io-Bot/1.0' }
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                return res.status(400).json({ message: `Could not fetch ads.txt from ${adsTxtUrl} (HTTP ${response.status})` });
            }

            // Memory Safety: Check content length if available, or limit buffer
            const contentLength = response.headers.get('content-length');
            if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB limit
                return res.status(400).json({ message: 'ads.txt file is too large (max 1MB)' });
            }

            const text = await response.text();
            if (text.length > 1024 * 1024) {
                return res.status(400).json({ message: 'ads.txt file content exceeds safety limits' });
            }

            // Check if the exact expected line exists (ignoring case and whitespace differences)
            const lines = text.split('\n').filter(l => l.trim().length > 0).map(l => l.trim().toLowerCase());
            const searchLine = expectedLine.toLowerCase().replace(/\s+/g, '');

            const isVerified = lines.some(line => {
                // Remove comments
                const cleanLine = line.split('#')[0].trim();
                return cleanLine.replace(/\s+/g, '') === searchLine;
            });

            if (isVerified) {
                // Update the database to reflect ads.txt verification
                const updatedSite = await prisma.site.update({
                    where: { id },
                    data: { adsTxtVerifiedAt: new Date() }
                });
                return res.json({ success: true, message: 'ads.txt verified successfully!', site: updatedSite });
            } else {
                return res.status(400).json({
                    message: 'Verification failed. The required line was not found in your ads.txt file.',
                    expectedLine
                });
            }

        } catch (fetchErr) {
            clearTimeout(timeoutId);
            return res.status(400).json({ message: `Failed to connect to ${adsTxtUrl}. Error: ${fetchErr.message}` });
        }

    } catch (error) {
        console.error('Error verifying ads.txt:', error);
        res.status(500).json({ message: 'Server error during ads.txt verification' });
    }
};


// Update Site
export const updateSite = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, url, category, description } = req.body;
        const userId = req.user.id;

        const publisher = await prisma.publisher.findUnique({
            where: { userId }
        });

        if (!publisher) {
            return res.status(404).json({ message: 'Publisher not found' });
        }

        // Check if site belongs to publisher
        const site = await prisma.site.findFirst({
            where: {
                id,
                publisherId: publisher.id
            }
        });

        if (!site) {
            return res.status(404).json({ message: 'Site not found' });
        }

        const updatedSite = await prisma.site.update({
            where: { id },
            data: {
                name,
                url,
                category,
                description
            }
        });

        res.json(updatedSite);
    } catch (error) {
        console.error('Error updating site:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Site
export const deleteSite = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const publisher = await prisma.publisher.findUnique({
            where: { userId }
        });

        if (!publisher) {
            return res.status(404).json({ message: 'Publisher not found' });
        }

        // Check if site belongs to publisher
        const site = await prisma.site.findFirst({
            where: {
                id,
                publisherId: publisher.id
            }
        });

        if (!site) {
            return res.status(404).json({ message: 'Site not found' });
        }

        await prisma.site.delete({
            where: { id }
        });

        res.json({ message: 'Site deleted successfully' });
    } catch (error) {
        console.error('Error deleting site:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Payment History
export const getPayments = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        const publisher = await prisma.publisher.findUnique({
            where: { userId }
        });

        const transactions = await prisma.transaction.findMany({
            where: {
                userId,
                type: {
                    in: ['WITHDRAWAL', 'EARNING', 'DEPOSIT', 'BONUS']
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate stats
        const totalEarnings = transactions
            .filter(t => t.type === 'EARNING' && t.status === 'COMPLETED')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const totalWithdrawn = transactions
            .filter(t => t.type === 'WITHDRAWAL' && t.status === 'COMPLETED')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        res.json({
            stats: {
                balance: parseFloat(user.balance),
                totalEarnings,
                totalWithdrawn
            },
            transactions
        });
    } catch (error) {
        console.error('Error getting payments:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Request Withdrawal
export const requestWithdrawal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, method } = req.body;

        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || parsedAmount <= 0) {
            return res.status(400).json({ message: 'Invalid withdrawal amount' });
        }

        // Atomic transaction: balance check + decrement + create record
        // This prevents race condition - two concurrent requests cannot run at the same time
        const transaction = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user) throw new Error('USER_NOT_FOUND');

            const publisher = await tx.publisher.findUnique({ where: { userId } });
            if (!publisher) throw new Error('PUBLISHER_NOT_FOUND');

            // Balance check (inside transaction - race-safe)
            if (parseFloat(user.balance) < parsedAmount) {
                throw new Error('INSUFFICIENT_BALANCE');
            }

            // Minimum payout check
            if (parsedAmount < parseFloat(publisher.minPayout)) {
                throw new Error(`MIN_PAYOUT:${publisher.minPayout}`);
            }

            // Deduct balance FIRST (within same transaction)
            await tx.user.update({
                where: { id: userId },
                data: { balance: { decrement: parsedAmount } }
            });

            // Create withdrawal record
            return tx.transaction.create({
                data: {
                    userId,
                    type: 'WITHDRAWAL',
                    status: 'PENDING',
                    amount: parsedAmount,
                    description: `Withdrawal via ${method}`,
                    metadata: { method }
                }
            });
        });

        res.status(201).json(transaction);
    } catch (error) {
        // Handle known business errors with proper status codes
        if (error.message === 'USER_NOT_FOUND' || error.message === 'PUBLISHER_NOT_FOUND') {
            return res.status(404).json({ message: 'Publisher not found' });
        }
        if (error.message === 'INSUFFICIENT_BALANCE') {
            return res.status(400).json({ message: 'Insufficient balance' });
        }
        if (error.message?.startsWith('MIN_PAYOUT:')) {
            const min = error.message.split(':')[1];
            return res.status(400).json({ message: `Minimum payout is $${min}` });
        }
        console.error('Error requesting withdrawal:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ==================== ZONE MANAGEMENT ====================

/**
 * Get or Create Zone
 * Given a siteId and an AdFormat type, find the existing zone or create a new one.
 * This powers the Ad Codes page — publishers don't manage zones manually.
 */
export const getOrCreateZone = async (req, res) => {
    try {
        const userId = req.user.id;
        const { siteId, format } = req.body;

        const VALID_FORMATS = ['POPUNDER', 'IN_PAGE_PUSH', 'PUSH_NOTIFICATION'];

        if (!siteId || !format) {
            return res.status(400).json({ message: 'siteId and format are required' });
        }

        if (!VALID_FORMATS.includes(format)) {
            return res.status(400).json({ message: `Invalid format. Must be one of: ${VALID_FORMATS.join(', ')}` });
        }

        const publisher = await prisma.publisher.findUnique({ where: { userId } });
        if (!publisher) return res.status(404).json({ message: 'Publisher not found' });

        // Make sure the site belongs to this publisher and is active
        const site = await prisma.site.findFirst({
            where: { id: siteId, publisherId: publisher.id }
        });

        if (!site) return res.status(404).json({ message: 'Site not found' });

        if (site.status !== 'ACTIVE') {
            return res.status(400).json({ message: 'Site must be ACTIVE to generate ad codes. Please wait for admin approval.' });
        }

        // Find existing zone or create
        let zone = await prisma.zone.findFirst({
            where: { siteId, type: format }
        });

        if (!zone) {
            const formatNames = {
                POPUNDER: 'Popunder',
                IN_PAGE_PUSH: 'In-Page Push',
                PUSH_NOTIFICATION: 'Web Push Notification',
            };
            zone = await prisma.zone.create({
                data: {
                    siteId,
                    name: `${site.name} - ${formatNames[format]}`,
                    type: format,
                }
            });
        }

        return res.json({ zone });
    } catch (error) {
        console.error('getOrCreateZone error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Statistics
export const getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate } = req.query;

        const publisher = await prisma.publisher.findUnique({
            where: { userId },
            include: {
                sites: {
                    include: {
                        zones: {
                            include: {
                                impressions: {
                                    where: startDate && endDate ? {
                                        createdAt: {
                                            gte: new Date(startDate),
                                            lte: new Date(endDate)
                                        }
                                    } : {}
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!publisher) {
            return res.status(404).json({ message: 'Publisher not found' });
        }

        // Aggregate stats
        const stats = {
            impressions: 0,
            clicks: 0,
            revenue: 0,
            bySite: []
        };

        publisher.sites.forEach(site => {
            let siteImpressions = 0;
            let siteClicks = 0;
            let siteRevenue = 0;

            site.zones.forEach(zone => {
                siteImpressions += zone.impressions.length;
                zone.impressions.forEach(imp => {
                    if (imp.clicked) siteClicks++;
                    siteRevenue += parseFloat(imp.publisherRevenue);
                });
            });

            stats.impressions += siteImpressions;
            stats.clicks += siteClicks;
            stats.revenue += siteRevenue;

            stats.bySite.push({
                siteName: site.name,
                impressions: siteImpressions,
                clicks: siteClicks,
                revenue: siteRevenue.toFixed(2),
                ctr: siteImpressions > 0 ? ((siteClicks / siteImpressions) * 100).toFixed(2) : 0
            });
        });

        res.json({
            ...stats,
            revenue: stats.revenue.toFixed(2),
            ctr: stats.impressions > 0 ? ((stats.clicks / stats.impressions) * 100).toFixed(2) : 0
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
