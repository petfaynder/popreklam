import crypto from 'crypto';

class ModerationService {
    constructor() {
        this.apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY || null;

        // Comprehensive list of prohibited categories and their regex patterns
        this.prohibitedPatterns = [
            {
                category: 'Adult / Pornography',
                regex: /\b(porn|sex|xxx|nsfw|tube8|redtube|xvideos|pornhub|camgirl|onlyfans|adult-dating|nude|naked)\b/i
            },
            {
                category: 'Illegal Gambling / Casino',
                regex: /\b(casino|bet|poker|slots|roulette|gambling|lottery|jackpot|sportsbook|1xbet|bet365)\b/i
            },
            {
                category: 'Scam / Phishing / Malware',
                regex: /\b(hack|crack|keygen|warez|virus|malware|phishing|stealer|free-iphone|claim-prize|winner)\b/i
            },
            {
                category: 'Counterfeit / Drugs',
                regex: /\b(viagra|cialis|steroids|drugs|weed|cannabis|counterfeit|fake-id|darkweb|silkroad)\b/i
            }
        ];
    }

    /**
     * Test URL against local heuristic regex
     */
    checkKeywords(url, title = '', description = '') {
        const textToAnalyze = `${url} ${title} ${description}`.toLowerCase();

        for (const pattern of this.prohibitedPatterns) {
            if (pattern.regex.test(textToAnalyze)) {
                return {
                    flagged: true,
                    reason: `System detected prohibited content category: ${pattern.category}`
                };
            }
        }

        return { flagged: false, reason: null };
    }

    /**
     * Check URL against Google Safe Browsing API
     */
    async checkSafeBrowsing(url) {
        if (!this.apiKey) {
            console.log('[Moderation] GOOGLE_SAFE_BROWSING_API_KEY not configured. Skipping malware check for:', url);
            return { flagged: false, reason: null };
        }

        try {
            const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${this.apiKey}`;
            const reqBody = {
                client: {
                    clientId: "mrpop-ad-network",
                    clientVersion: "1.0.0"
                },
                threatInfo: {
                    threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                    platformTypes: ["ANY_PLATFORM"],
                    threatEntryTypes: ["URL"],
                    threatEntries: [
                        { url: url }
                    ]
                }
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reqBody)
            });

            if (!response.ok) {
                console.error('[Moderation] Google Safe Browsing API Error:', response.status);
                // If API fails, we don't block the ad, but log the error
                return { flagged: false, reason: null };
            }

            const data = await response.json();

            if (data && data.matches && data.matches.length > 0) {
                const threats = data.matches.map(m => m.threatType).join(', ');
                return {
                    flagged: true,
                    reason: `Google Safe Browsing flagged this URL for: ${threats}`
                };
            }

            return { flagged: false, reason: null };

        } catch (error) {
            console.error('[Moderation] Exception during Safe Browsing check:', error);
            return { flagged: false, reason: null };
        }
    }

    /**
     * Analyze a campaign completely (local DB + Google API)
     * Returns: { action: 'APPROVE', 'REJECT', 'MANUAL_REVIEW', reason: '...' }
     */
    async analyzeCampaign(targetUrl, title = '', description = '') {
        console.log(`[Moderation] Analyzing campaign targeting: ${targetUrl}`);

        // 1. Check local heuristics
        const keywordResult = this.checkKeywords(targetUrl, title, description);
        if (keywordResult.flagged) {
            return {
                action: 'REJECT',
                reason: `Auto-Rejected: ${keywordResult.reason}`
            };
        }

        // 2. Check Google Safe Browsing (async)
        const safeResult = await this.checkSafeBrowsing(targetUrl);
        if (safeResult.flagged) {
            return {
                action: 'REJECT',
                reason: `Auto-Rejected (Security Alert): ${safeResult.reason}`
            };
        }

        // 3. Fallback (If all passes, it still needs manual approval from admin according to business logic, or can be auto-approved based on trust score)
        // For standard flow, just return clear
        return {
            action: 'PASS',
            reason: 'Automated scans found no issues.'
        };
    }
}

export const moderationService = new ModerationService();
