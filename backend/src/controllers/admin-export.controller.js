import prisma from '../lib/prisma.js';

/**
 * GET /api/admin/campaigns/export/csv
 * Export all campaigns to a CSV file.
 */
export const exportCampaignsCsv = async (req, res) => {
    try {
        const campaigns = await prisma.campaign.findMany({
            include: {
                advertiser: {
                    include: { user: true }
                },
                _count: {
                    select: { creatives: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Define CSV headers
        const headers = [
            'Campaign ID', 'Name', 'Advertiser Email', 'Advertiser Name',
            'Format', 'Status', 'Daily Budget', 'Total Budget', 'Bid Amount',
            'CPA Goal', 'Auto Optimize', 'Freq Cap', 'Freq Interval',
            'Total Spent', 'Impressions', 'Clicks', 'Conversions',
            'Creatives Count', 'Created At'
        ];

        // Format data rows
        const rows = campaigns.map(c => [
            c.id,
            `"${c.name.replace(/"/g, '""')}"`,
            c.advertiser?.user?.email || 'N/A',
            `"${(c.advertiser?.companyName || 'N/A').replace(/"/g, '""')}"`,
            c.adFormat,
            c.status,
            c.dailyBudget || 'UNLIMITED',
            c.totalBudget,
            c.bidAmount,
            c.cpaGoal || 'NONE',
            c.autoOptimize ? 'YES' : 'NO',
            c.freqCap,
            c.freqInterval,
            c.totalSpent,
            c.totalImpressions,
            c.totalClicks,
            c.totalConversions,
            c._count?.creatives || 0,
            c.createdAt.toISOString()
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Send file
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="campaigns_export_${new Date().toISOString().split('T')[0]}.csv"`);
        res.status(200).send(csvContent);

    } catch (error) {
        console.error('CSV Export Error:', error);
        res.status(500).json({ message: 'Failed to export campaigns' });
    }
};
