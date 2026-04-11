/**
 * Device Detection Utilities
 * Used for ad targeting
 */

export function detectDevice(userAgent) {
    if (!userAgent) return 'DESKTOP';

    const ua = userAgent.toLowerCase();

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'TABLET';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'MOBILE';
    }
    return 'DESKTOP';
}

export function detectBrowser(userAgent) {
    if (!userAgent) return 'OTHER';

    const ua = userAgent.toLowerCase();

    if (ua.includes('edg/')) return 'EDGE';
    if (ua.includes('chrome')) return 'CHROME';
    if (ua.includes('firefox')) return 'FIREFOX';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'SAFARI';
    if (ua.includes('opera') || ua.includes('opr/')) return 'OPERA';

    return 'OTHER';
}

export function detectOS(userAgent) {
    if (!userAgent) return 'OTHER';

    const ua = userAgent.toLowerCase();

    if (ua.includes('win')) return 'WINDOWS';
    if (ua.includes('mac')) return 'MAC';
    if (ua.includes('linux')) return 'LINUX';
    if (ua.includes('android')) return 'ANDROID';
    if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) return 'IOS';

    return 'OTHER';
}

/**
 * Get country from IP address
 * In production, use a real GeoIP service like MaxMind or ipapi
 */
export async function getCountryFromIP(ip) {
    // Mock implementation - return US for localhost/test
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('::ffff:127')) {
        return 'US';
    }

    // In production, integrate with GeoIP service:
    // try {
    //     const response = await fetch(`https://ipapi.co/${ip}/country_code/`);
    //     return await response.text();
    // } catch (error) {
    //     return 'UNKNOWN';
    // }

    // For now, return mock data
    const mockCountries = ['US', 'GB', 'DE', 'FR', 'CA', 'AU', 'TR'];
    return mockCountries[Math.floor(Math.random() * mockCountries.length)];
}
