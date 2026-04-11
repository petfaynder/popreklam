import { Megaphone, Layout, Bell } from 'lucide-react';
import { getDashboardTheme } from '@/lib/themeUtils';
import useTheme from '@/hooks/useTheme';

export default function AdFormatSelect({ formData, updateField }) {
    const theme = useTheme();
    const d = getDashboardTheme(theme);

    const formats = [
        {
            id: 'POPUNDER',
            label: 'Popunder',
            description: 'Full-tab ads that appear behind the active window. High volume, excellent reach.',
            icon: Layout,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            badge: 'High Volume',
            badgeBg: 'bg-purple-500/20 text-purple-400',
        },
        {
            id: 'IN_PAGE_PUSH',
            label: 'In-Page Push',
            description: 'Native-like notification banners appearing on the publisher page. No browser permission needed.',
            icon: Megaphone,
            color: 'text-sky-500',
            bg: 'bg-sky-500/10',
            badge: 'High CTR',
            badgeBg: 'bg-sky-500/20 text-sky-400',
        },
        {
            id: 'PUSH_NOTIFICATION',
            label: 'Web Push Notification',
            description: 'OS-level browser notifications that reach users even when the site is closed. Premium CPM.',
            icon: Bell,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            badge: '🔥 Premium',
            badgeBg: 'bg-amber-500/20 text-amber-400',
        }
    ];

    return (
        <div className={`p-6 rounded-2xl mb-6 border ${d.card} ${d.cardHover}`}>
            <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${d.heading}`}>
                <Megaphone className={`w-5 h-5 ${d.accent}`} />
                Ad Format
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formats.map((format) => {
                    const isSelected = formData.adFormat === format.id;
                    const Icon = format.icon;

                    return (
                        <button
                            key={format.id}
                            type="button"
                            onClick={() => updateField('adFormat', format.id)}
                            className={`relative text-left p-4 rounded-xl border-2 transition-all group ${isSelected
                                    ? `${d.isDark ? 'bg-white/5 border-lime-500/50' : 'bg-gray-50 border-[#1A1A1A]'} shadow-lg`
                                    : `${d.isDark ? 'border-white/5 hover:border-white/20' : 'border-gray-200 hover:border-gray-300'} bg-transparent`
                                }`}
                        >
                            {isSelected && (
                                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${d.isDark ? 'bg-lime-400 shadow-[0_0_8px_rgba(163,255,51,0.5)]' : 'bg-[#1A1A1A]'}`} />
                            )}

                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${format.bg} ${format.color}`}>
                                <Icon className="w-6 h-6" />
                            </div>

                            <div className="flex items-center gap-2 mb-1">
                                <h4 className={`font-bold text-base ${d.isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {format.label}
                                </h4>
                            </div>

                            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${format.badgeBg}`}>
                                {format.badge}
                            </span>

                            <p className="text-xs text-gray-500 leading-relaxed">
                                {format.description}
                            </p>
                        </button>
                    );
                })}
            </div>

            {/* Push-specific guidance */}
            {formData.adFormat === 'PUSH_NOTIFICATION' && (
                <div className={`mt-4 p-3 rounded-xl border ${d.isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                    <p className={`text-xs ${d.isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                        <strong>🔔 Web Push:</strong> Requires publisher to install a Service Worker on their site.
                        Reaches users even when browser is closed. Typical CPM: <strong>$3–$15</strong>. Higher intent audience.
                    </p>
                </div>
            )}
        </div>
    );
}
