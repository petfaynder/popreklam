import prisma from '../lib/prisma.js'

const AD_FORMATS = ['POPUNDER', 'IN_PAGE_PUSH', 'NATIVE', 'BANNER', 'DIRECT_LINK'];

/**
 * GET /api/admin/geo-floors
 * Returns all geo floor entries optionally filtered by format
 */
export const getGeoFloors = async (req, res) => {
    try {
        const { format } = req.query;
        const where = format ? { adFormat: format } : {};
        const floors = await prisma.geoFloor.findMany({
            where,
            orderBy: [{ countryCode: 'asc' }, { adFormat: 'asc' }]
        });
        res.json({ floors, formats: AD_FORMATS });
    } catch (error) {
        console.error('[GeoFloor] Get error:', error);
        res.status(500).json({ error: 'Failed to fetch geo floors' });
    }
};

/**
 * PUT /api/admin/geo-floors
 * Upsert a floor entry for a country+format combination
 * Body: { countryCode, adFormat, minBid }
 */
export const upsertGeoFloor = async (req, res) => {
    try {
        const { countryCode, adFormat, minBid } = req.body;

        if (!countryCode || !adFormat || minBid === undefined) {
            return res.status(400).json({ error: 'countryCode, adFormat, and minBid are required' });
        }
        if (!AD_FORMATS.includes(adFormat)) {
            return res.status(400).json({ error: `Invalid adFormat. Must be one of: ${AD_FORMATS.join(', ')}` });
        }
        if (isNaN(Number(minBid)) || Number(minBid) < 0) {
            return res.status(400).json({ error: 'minBid must be a non-negative number' });
        }

        const floor = await prisma.geoFloor.upsert({
            where: { countryCode_adFormat: { countryCode: countryCode.toUpperCase(), adFormat } },
            update: { minBid: Number(minBid) },
            create: {
                countryCode: countryCode.toUpperCase(),
                adFormat,
                minBid: Number(minBid)
            }
        });

        res.json({ message: 'Geo floor updated', floor });
    } catch (error) {
        console.error('[GeoFloor] Upsert error:', error);
        res.status(500).json({ error: 'Failed to update geo floor' });
    }
};

/**
 * POST /api/admin/geo-floors/bulk
 * Bulk upsert — array of { countryCode, adFormat, minBid }
 */
export const bulkUpsertGeoFloors = async (req, res) => {
    try {
        const { floors } = req.body;
        if (!Array.isArray(floors)) return res.status(400).json({ error: 'floors must be an array' });

        const results = [];
        for (const { countryCode, adFormat, minBid } of floors) {
            if (!countryCode || !adFormat || minBid === undefined) continue;
            const floor = await prisma.geoFloor.upsert({
                where: { countryCode_adFormat: { countryCode: countryCode.toUpperCase(), adFormat } },
                update: { minBid: Number(minBid) },
                create: { countryCode: countryCode.toUpperCase(), adFormat, minBid: Number(minBid) }
            });
            results.push(floor);
        }

        res.json({ message: `${results.length} geo floors updated`, floors: results });
    } catch (error) {
        console.error('[GeoFloor] Bulk upsert error:', error);
        res.status(500).json({ error: 'Failed to bulk update geo floors' });
    }
};

/**
 * DELETE /api/admin/geo-floors/:countryCode/:adFormat
 * Remove a specific floor (removes the restriction)
 */
export const deleteGeoFloor = async (req, res) => {
    try {
        const { countryCode, adFormat } = req.params;
        await prisma.geoFloor.deleteMany({
            where: { countryCode: countryCode.toUpperCase(), adFormat }
        });
        res.json({ message: 'Geo floor removed' });
    } catch (error) {
        console.error('[GeoFloor] Delete error:', error);
        res.status(500).json({ error: 'Failed to delete geo floor' });
    }
};

/**
 * GET /api/public/geo-floors/:countryCode/:adFormat
 * Public endpoint — used by campaign creation form to validate bid
 */
export const getFloorForCountryFormat = async (req, res) => {
    try {
        const { countryCode, adFormat } = req.params;
        const floor = await prisma.geoFloor.findUnique({
            where: { countryCode_adFormat: { countryCode: countryCode.toUpperCase(), adFormat } }
        });
        res.json({ floor: floor ? Number(floor.minBid) : 0, countryCode: countryCode.toUpperCase(), adFormat });
    } catch (error) {
        res.json({ floor: 0 });
    }
};
