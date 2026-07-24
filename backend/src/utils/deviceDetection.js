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
 * Detect connection type from User-Agent and network hints.
 * Returns: 'WIFI' | 'CELLULAR_2G' | 'CELLULAR_3G' | 'CELLULAR_4G' | 'CELLULAR_5G' | null
 *
 * Priority:
 *  1. Network Information API hints sent via headers (future-proof)
 *  2. UA keyword heuristics (e.g. "3gpp", "opera mini" implies mobile data)
 *  3. Device type inference (MOBILE without WiFi hint → CELLULAR_4G guess)
 */
export function detectConnectionType(userAgent, networkHint) {
    // If publisher JS forwarded navigator.connection.effectiveType, use it directly
    if (networkHint) {
        const hint = String(networkHint).toLowerCase();
        if (hint === 'wifi' || hint === '802.11') return 'WIFI';
        if (hint === 'slow-2g' || hint === '2g') return 'CELLULAR_2G';
        if (hint === '3g') return 'CELLULAR_3G';
        if (hint === '4g') return 'CELLULAR_4G';
        if (hint === '5g') return 'CELLULAR_5G';
    }

    if (!userAgent) return null;
    const ua = userAgent.toLowerCase();

    // Known mobile-data UA hints
    if (/3gpp|3g|gprs|edge|hsdpa|hsupa|wap|opera.mini/.test(ua)) return 'CELLULAR_3G';
    if (/lte|4g/.test(ua)) return 'CELLULAR_4G';
    if (/5g/.test(ua)) return 'CELLULAR_5G';

    // Mobile UA without explicit WiFi = likely cellular (default guess)
    if (/mobile|android|iphone|ipad/.test(ua)) return 'CELLULAR_4G';

    // Desktop UA = WiFi / Broadband (best guess)
    return 'WIFI';
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
