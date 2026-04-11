import { Link, Globe, Anchor } from 'lucide-react';
import { getDashboardTheme } from '@/lib/themeUtils';
import useTheme from '@/hooks/useTheme';
import MacroHelper from './MacroHelper';

export default function GeneralInfo({ formData, updateField }) {
    const theme = useTheme();
    const d = getDashboardTheme(theme);

    return (
        <div className={`p-6 rounded-2xl mb-6 border ${d.card} ${d.cardHover}`}>
            <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${d.heading}`}>
                <Anchor className={`w-5 h-5 ${d.accent}`} />
                General Information
            </h3>

            <div className="space-y-6">
                {/* Campaign Name */}
                <div>
                    <label className={`block text-sm font-medium mb-2 ${d.subheading}`}>Campaign Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="e.g., Summer Sale 2024 - US - Mobile"
                        className={d.inputCls}
                    />
                </div>

                {/* Target URL */}
                <div>
                    <label className={`block text-sm font-medium mb-2 ${d.subheading}`}>Target URL</label>
                    <div className="relative">
                        <Globe className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${d.muted}`} />
                        <input
                            type="url"
                            value={formData.targetUrl}
                            onChange={(e) => updateField('targetUrl', e.target.value)}
                            placeholder="https://example.com/landing-page"
                            className={`${d.inputCls} pl-12`}
                        />
                    </div>
                    <p className={`text-xs mt-2 ${d.muted}`}>
                        Ensure your URL is accessible and complies with our ad policies.
                    </p>
                </div>

                {/* Conversion Tracking (Postback) - New Feature */}
                <div className={`p-4 rounded-xl border ${d.isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <label className={`block text-sm font-bold ${d.text}`}>Conversion Tracking (S2S Postback)</label>
                        <span className={`text-[10px] px-2 py-1 rounded border uppercase tracking-wider ${d.isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                            Optional
                        </span>
                    </div>
                    <div className="relative">
                        <Link className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${d.muted}`} />
                        <input
                            type="text"
                            value={formData.postbackUrl || ''}
                            onChange={(e) => updateField('postbackUrl', e.target.value)}
                            placeholder="https://your-tracker.com/postback?clickid={clickid}"
                            className={`${d.inputCls} pl-12 text-sm font-mono`}
                        />
                    </div>
                    <p className={`text-xs mt-2 ${d.muted}`}>
                        Use <code className={d.isDark ? 'text-lime-400' : 'text-blue-600'}>{`{clickid}`}</code> macro to track conversions. See all macros below.
                    </p>
                </div>

                {/* Macro Helper */}
                <MacroHelper
                    targetUrl={formData.postbackUrl}
                    onInsert={(macro) => {
                        const current = formData.postbackUrl || '';
                        if (!current.includes(macro)) {
                            // Smart separator logic
                            const paramName = macro.replace(/[{}]/g, '');
                            if (!current) {
                                // Empty URL — just copy macro, user will paste it
                                navigator.clipboard.writeText(macro);
                                return;
                            }
                            const separator = current.includes('?') ? '&' : '?';
                            updateField('postbackUrl', `${current}${separator}${paramName}=${macro}`);
                        }
                    }}
                />
            </div>
        </div>
    );
}
