import { ListFilter, ShieldAlert } from 'lucide-react';
import { getDashboardTheme } from '@/lib/themeUtils';
import useTheme from '@/hooks/useTheme';

export default function ZoneTargeting({ formData, updateField }) {
    const theme = useTheme();
    const d = getDashboardTheme(theme);

    return (
        <div className={`p-6 rounded-2xl mb-6 border ${d.card} ${d.cardHover}`}>
            <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${d.heading}`}>
                <ListFilter className={`w-5 h-5 ${d.accent}`} />
                Zone Targeting (Optional)
            </h3>

            <div className={`p-4 rounded-xl border mb-6 flex gap-3 items-start ${d.isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-bold mb-1">Optimization Tip</p>
                    <p className="text-xs opacity-80">
                        Start with global targeting (leave empty) to gather data. Once you identify high-performing or low-performing zones, return here to whitelist or blacklist them.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Whitelist */}
                <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${d.muted}`}>Include Zones (Whitelist)</label>
                    <textarea
                        value={formData.includeZones || ''}
                        onChange={(e) => updateField('includeZones', e.target.value)}
                        placeholder="123456&#10;789012"
                        className={`${d.inputCls} min-h-[120px] font-mono text-xs`}
                    />
                    <p className={`text-[10px] mt-2 ${d.muted}`}>Only target these specific zones.</p>
                </div>

                {/* Blacklist */}
                <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${d.muted}`}>Exclude Zones (Blacklist)</label>
                    <textarea
                        value={formData.excludeZones || ''}
                        onChange={(e) => updateField('excludeZones', e.target.value)}
                        placeholder="123456&#10;789012"
                        className={`${d.inputCls} min-h-[120px] font-mono text-xs`}
                    />
                    <p className={`text-[10px] mt-2 ${d.muted}`}>Block traffic from these zones.</p>
                </div>
            </div>
        </div>
    );
}
