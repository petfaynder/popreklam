'use client';

import ThemePageWrapper from '@/components/ThemePageWrapper';

export default function TermsPage() {
    return (
        <ThemePageWrapper>
            {(theme) => {
                const isDark = theme !== 'theme-brutalist' && theme !== 'theme-editorial';
                const isEditorial = theme === 'theme-editorial';
                const isBrutalist = theme === 'theme-brutalist';
                const accentText = theme === 'theme-luminous' ? 'text-lime-400' : theme === 'theme-azure' ? 'text-sky-400' : isEditorial ? 'text-red-700' : isBrutalist ? 'text-primary' : 'text-lime-400';
                const secondAccent = theme === 'theme-luminous' ? 'text-sky-400' : theme === 'theme-azure' ? 'text-purple-400' : isEditorial ? 'text-blue-700' : isBrutalist ? 'text-accent' : 'text-sky-400';
                const h2Cls = `text-2xl font-bold mb-4 ${isBrutalist ? 'uppercase' : ''}`;
                const h3Cls = (color) => `text-xl font-semibold mb-3 ${color} ${isBrutalist ? 'uppercase text-lg' : ''} mt-4`;
                const pCls = `leading-relaxed mb-4 ${isDark ? 'text-gray-300' : isEditorial ? 'text-gray-600' : 'text-muted-foreground'}`;
                const liCls = `${isDark ? 'text-gray-300' : isEditorial ? 'text-gray-600' : 'text-muted-foreground'}`;
                const linkCls = `${accentText} hover:underline`;

                return (
                    <div className="max-w-4xl mx-auto px-6 py-16">
                        <h1 className={`text-4xl font-bold mb-4 ${isBrutalist ? 'uppercase tracking-tighter font-black' : ''}`}>Terms of Service</h1>
                        <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Last updated: February 7, 2026</p>

                        <div className="space-y-8">
                            <section><h2 className={h2Cls}>1. Acceptance of Terms</h2><p className={pCls}>By accessing and using MrPop.io ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p></section>

                            <section><h2 className={h2Cls}>2. Service Description</h2><p className={pCls}>MrPop.io is an advertising network that connects Publishers (website owners) with Advertisers (campaign owners). The platform facilitates the display of advertisements on Publisher websites and manages payments between parties.</p></section>

                            <section>
                                <h2 className={h2Cls}>3. Publisher Terms</h2>
                                <h3 className={h3Cls(accentText)}>3.1. Eligibility</h3>
                                <p className={pCls}>Publishers must own or have legal rights to the websites they register. Websites must comply with our content policies.</p>
                                <h3 className={h3Cls(accentText)}>3.2. Prohibited Content</h3>
                                <p className={pCls}>Publishers may not use the Service on websites containing:</p>
                                <ul className={`list-disc list-inside space-y-2 ml-4 mb-4 ${liCls}`}>
                                    <li>Illegal content or activities</li><li>Adult/pornographic material (18+)</li><li>Hate speech, violence, or discrimination</li><li>Malware, viruses, or harmful code</li><li>Copyright infringing content</li><li>Fraudulent or misleading information</li>
                                </ul>
                                <h3 className={h3Cls(accentText)}>3.3. Traffic Quality</h3>
                                <p className={pCls}>Publishers must provide legitimate traffic. Prohibited activities include:</p>
                                <ul className={`list-disc list-inside space-y-2 ml-4 mb-4 ${liCls}`}>
                                    <li>Bot traffic or automated clicks</li><li>Incentivized traffic (paid-to-click schemes)</li><li>Misleading redirects or forced clicks</li><li>Any form of click fraud</li>
                                </ul>
                                <h3 className={h3Cls(accentText)}>3.4. Payment Terms</h3>
                                <p className={pCls}>- Revenue Share: Publishers earn a percentage of advertising revenue (specified in dashboard)</p>
                                <p className={pCls}>- Minimum Payout: $50.00 USD</p>
                                <p className={pCls}>- Payment Frequency: Weekly (upon reaching minimum threshold)</p>
                                <p className={pCls}>- Payment Methods: PayPal, Wire Transfer, Bitcoin</p>
                            </section>

                            <section>
                                <h2 className={h2Cls}>4. Advertiser Terms</h2>
                                <h3 className={h3Cls(secondAccent)}>4.1. Campaign Requirements</h3>
                                <p className={pCls}>Advertisers must:</p>
                                <ul className={`list-disc list-inside space-y-2 ml-4 mb-4 ${liCls}`}>
                                    <li>Provide accurate targeting information</li><li>Use legal and compliant advertising content</li><li>Direct traffic to legitimate, safe websites</li><li>Comply with advertising standards and regulations</li>
                                </ul>
                                <h3 className={h3Cls(secondAccent)}>4.2. Prohibited Campaigns</h3>
                                <p className={pCls}>Campaigns promoting the following are not allowed:</p>
                                <ul className={`list-disc list-inside space-y-2 ml-4 mb-4 ${liCls}`}>
                                    <li>Illegal products or services</li><li>Adult content (without proper age verification)</li><li>Gambling (in restricted jurisdictions)</li><li>Malware, viruses, or phishing</li><li>Cryptocurrency scams or pump-and-dump schemes</li><li>Misleading or false advertising</li>
                                </ul>
                                <h3 className={h3Cls(secondAccent)}>4.3. Pricing & Billing</h3>
                                <p className={pCls}>- Pricing Model: CPM (Cost Per Mille / 1000 impressions)</p>
                                <p className={pCls}>- Minimum Deposit: $100.00 USD</p>
                                <p className={pCls}>- Billing: Pre-paid (deposit required before campaign launch)</p>
                                <p className={pCls}>- Refunds: Available for unused balance upon account closure</p>
                            </section>

                            <section><h2 className={h2Cls}>5. Account Termination</h2><p className={pCls}>MrPop.io reserves the right to suspend or terminate accounts that violate these terms. Violations include, but are not limited to:</p>
                                <ul className={`list-disc list-inside space-y-2 ml-4 mb-4 ${liCls}`}><li>Fraudulent activity or click fraud</li><li>Violation of content policies</li><li>Chargebacks or payment disputes</li><li>Abuse of the platform or other users</li></ul>
                            </section>

                            <section><h2 className={h2Cls}>6. Limitation of Liability</h2><p className={pCls}>MrPop.io is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of the service, including but not limited to loss of revenue, data loss, or service interruptions.</p></section>

                            <section><h2 className={h2Cls}>7. Modifications to Terms</h2><p className={pCls}>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p></section>

                            <section><h2 className={h2Cls}>8. Contact Information</h2><p className={pCls}>For questions about these Terms, please contact us at: <a href="mailto:legal@mrpop.io" className={linkCls}>legal@mrpop.io</a></p></section>
                        </div>
                    </div>
                );
            }}
        </ThemePageWrapper>
    );
}
