'use client';

import ThemePageWrapper from '@/components/ThemePageWrapper';

export default function PrivacyPage() {
    return (
        <ThemePageWrapper>
            {(theme) => {
                const isDark = theme !== 'theme-brutalist' && theme !== 'theme-editorial';
                const isEditorial = theme === 'theme-editorial';
                const isBrutalist = theme === 'theme-brutalist';
                const accentText = theme === 'theme-luminous' ? 'text-lime-400' : theme === 'theme-azure' ? 'text-sky-400' : isEditorial ? 'text-red-700' : isBrutalist ? 'text-primary' : 'text-lime-400';
                const secondAccent = theme === 'theme-luminous' ? 'text-sky-400' : theme === 'theme-azure' ? 'text-purple-400' : isEditorial ? 'text-blue-700' : isBrutalist ? 'text-accent' : 'text-sky-400';
                const h2Cls = `text-2xl font-bold mb-4 ${isBrutalist ? 'uppercase' : ''}`;
                const h3Cls = (color) => `text-xl font-semibold mb-3 ${color} ${isBrutalist ? 'uppercase text-lg' : ''} mt-6`;
                const pCls = `leading-relaxed mb-4 ${isDark ? 'text-gray-300' : isEditorial ? 'text-gray-600' : 'text-muted-foreground'}`;
                const liCls = `${isDark ? 'text-gray-300' : isEditorial ? 'text-gray-600' : 'text-muted-foreground'}`;
                const boldCls = isDark ? 'font-semibold text-white' : 'font-semibold';
                const linkCls = `${accentText} hover:underline`;

                return (
                    <div className="max-w-4xl mx-auto px-6 py-16">
                        <h1 className={`text-4xl font-bold mb-4 ${isBrutalist ? 'uppercase tracking-tighter font-black' : ''}`}>Privacy Policy</h1>
                        <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Last updated: February 7, 2026</p>

                        <div className="space-y-8">
                            <section><h2 className={h2Cls}>1. Introduction</h2><p className={pCls}>PopReklam ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our advertising network platform.</p></section>

                            <section>
                                <h2 className={h2Cls}>2. Information We Collect</h2>
                                <h3 className={h3Cls(accentText)}>2.1. Account Information</h3>
                                <p className={pCls}>When you register, we collect:</p>
                                <ul className={`list-disc list-inside space-y-2 ml-4 mb-4 ${liCls}`}>
                                    <li>Email address</li><li>Password (encrypted)</li><li>Company name (optional)</li><li>Payment information (PayPal email, bank details, Bitcoin address)</li><li>Tax ID (for Publishers requesting payouts above threshold)</li>
                                </ul>
                                <h3 className={h3Cls(accentText)}>2.2. Website Information (Publishers)</h3>
                                <p className={pCls}>For Publisher accounts, we collect:</p>
                                <ul className={`list-disc list-inside space-y-2 ml-4 mb-4 ${liCls}`}><li>Website URLs</li><li>Website categories</li><li>Traffic statistics</li></ul>
                                <h3 className={h3Cls(accentText)}>2.3. Campaign Information (Advertisers)</h3>
                                <p className={pCls}>For Advertiser accounts, we collect:</p>
                                <ul className={`list-disc list-inside space-y-2 ml-4 mb-4 ${liCls}`}><li>Campaign details (targeting, budget, ad creative)</li><li>Billing information</li><li>Landing page URLs</li></ul>
                                <h3 className={h3Cls(accentText)}>2.4. Ad Serving Data</h3>
                                <p className={pCls}>When ads are displayed, we collect:</p>
                                <ul className={`list-disc list-inside space-y-2 ml-4 mb-4 ${liCls}`}><li>IP address (anonymized for GDPR compliance)</li><li>User agent (browser type, device, operating system)</li><li>Geographic location (country, city)</li><li>Referrer URL</li><li>Impression and click events</li></ul>
                                <h3 className={h3Cls(accentText)}>2.5. Cookies and Tracking</h3>
                                <p className={pCls}>We use cookies and similar tracking technologies for:</p>
                                <ul className={`list-disc list-inside space-y-2 ml-4 mb-4 ${liCls}`}><li>Authentication and session management</li><li>Frequency capping (limiting ad impressions per user)</li><li>Analytics and performance measurement</li><li>Fraud prevention</li></ul>
                            </section>

                            <section>
                                <h2 className={h2Cls}>3. How We Use Your Information</h2>
                                <p className={pCls}>We use collected information for:</p>
                                <ul className={`list-disc list-inside space-y-2 ml-4 mb-4 ${liCls}`}>
                                    <li><span className={boldCls}>Ad Serving:</span> Matching ads to appropriate audiences based on targeting criteria</li>
                                    <li><span className={boldCls}>Analytics:</span> Providing performance statistics to Publishers and Advertisers</li>
                                    <li><span className={boldCls}>Payments:</span> Processing payouts to Publishers and billing Advertisers</li>
                                    <li><span className={boldCls}>Fraud Prevention:</span> Detecting and preventing click fraud, bot traffic, and abuse</li>
                                    <li><span className={boldCls}>Platform Improvement:</span> Analyzing usage patterns to enhance our service</li>
                                    <li><span className={boldCls}>Communication:</span> Sending service updates, payment notifications, and support messages</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className={h2Cls}>4. Information Sharing</h2>
                                <p className={pCls}>We do not sell your personal information. We may share information with:</p>
                                <h3 className={h3Cls(secondAccent)}>4.1. Service Providers</h3>
                                <p className={pCls}>We share data with trusted third parties who assist with:</p>
                                <ul className={`list-disc list-inside space-y-2 ml-4 mb-4 ${liCls}`}><li>Payment processing (PayPal, Stripe, cryptocurrency processors)</li><li>Email delivery</li><li>Analytics and monitoring</li><li>Fraud detection</li></ul>
                                <h3 className={h3Cls(secondAccent)}>4.2. Legal Requirements</h3>
                                <p className={pCls}>We may disclose information when required by law, court order, or to protect our rights and prevent fraud.</p>
                                <h3 className={h3Cls(secondAccent)}>4.3. Business Transfers</h3>
                                <p className={pCls}>In the event of a merger, acquisition, or sale of assets, user information may be transferred as part of that transaction.</p>
                            </section>

                            <section>
                                <h2 className={h2Cls}>5. Your Rights (GDPR & CCPA Compliance)</h2>
                                <p className={pCls}>You have the right to:</p>
                                <ul className={`list-disc list-inside space-y-2 ml-4 mb-4 ${liCls}`}>
                                    <li><span className={boldCls}>Access:</span> Request a copy of your personal data</li>
                                    <li><span className={boldCls}>Rectification:</span> Correct inaccurate or incomplete data</li>
                                    <li><span className={boldCls}>Erasure:</span> Request deletion of your data ("right to be forgotten")</li>
                                    <li><span className={boldCls}>Restriction:</span> Limit how we process your data</li>
                                    <li><span className={boldCls}>Portability:</span> Receive your data in a machine-readable format</li>
                                    <li><span className={boldCls}>Objection:</span> Opt-out of certain data processing activities</li>
                                    <li><span className={boldCls}>Withdraw Consent:</span> Revoke previously given consents</li>
                                </ul>
                                <p className={pCls}>To exercise these rights, contact us at <a href="mailto:privacy@popreklam.com" className={linkCls}>privacy@popreklam.com</a></p>
                            </section>

                            <section>
                                <h2 className={h2Cls}>6. Data Security</h2>
                                <p className={pCls}>We implement industry-standard security measures:</p>
                                <ul className={`list-disc list-inside space-y-2 ml-4 mb-4 ${liCls}`}><li>TLS/SSL encryption for data transmission</li><li>Encrypted password storage (bcrypt hashing)</li><li>Regular security audits and penetration testing</li><li>Access controls and authentication</li><li>Secure database storage with backups</li></ul>
                                <p className={pCls}>However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.</p>
                            </section>

                            <section><h2 className={h2Cls}>7. Data Retention</h2><p className={pCls}>We retain your information for as long as your account is active or as needed to provide services. After account deletion, we may retain certain data for legal and compliance purposes (typically 7 years for financial records).</p></section>

                            <section><h2 className={h2Cls}>8. Children's Privacy</h2><p className={pCls}>PopReklam is not intended for users under 18 years of age. We do not knowingly collect information from children.</p></section>

                            <section><h2 className={h2Cls}>9. International Data Transfers</h2><p className={pCls}>Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.</p></section>

                            <section><h2 className={h2Cls}>10. Changes to This Privacy Policy</h2><p className={pCls}>We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last updated" date. Continued use after changes constitutes acceptance.</p></section>

                            <section>
                                <h2 className={h2Cls}>11. Contact Us</h2>
                                <p className={pCls}>For privacy-related questions or to exercise your rights, contact us at:</p>
                                <ul className={`list-none space-y-2 ml-4 mt-3 ${liCls}`}>
                                    <li><span className={boldCls}>Email:</span> <a href="mailto:privacy@popreklam.com" className={linkCls}>privacy@popreklam.com</a></li>
                                    <li><span className={boldCls}>Data Protection Officer:</span> <a href="mailto:dpo@popreklam.com" className={linkCls}>dpo@popreklam.com</a></li>
                                </ul>
                            </section>
                        </div>
                    </div>
                );
            }}
        </ThemePageWrapper>
    );
}
