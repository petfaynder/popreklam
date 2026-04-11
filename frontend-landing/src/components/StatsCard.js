'use client';

import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

// Reusable stats card component for dashboard metrics — theme-aware
export default function StatsCard({ icon: Icon, title, value, change, changeType = 'positive', subtitle, color = 'lime' }) {
    const theme = useTheme();
    const d = getDashboardTheme(theme);

    const iconWrapperCls = typeof d.statIcon === 'function' ? d.statIcon(color) : d.statIcon;
    const iconColorCls = typeof d.statIconColor === 'function' ? d.statIconColor(color) : d.statIconColor;
    const changeCls = typeof d.statChange === 'function' ? d.statChange(changeType === 'positive') : '';

    return (
        <div className={`${d.card} ${d.cardHover}`}>
            <div className="flex items-start justify-between mb-4">
                <div className={iconWrapperCls}>
                    <Icon className={`w-6 h-6 ${iconColorCls}`} />
                </div>
                {change && (
                    <div className={changeCls}>
                        {changeType === 'positive' ? '↑' : '↓'} {change}
                    </div>
                )}
            </div>
            <div className={`${d.statTitle} mb-1`}>{title}</div>
            <div className={`${d.statValue} mb-1`}>{value}</div>
            {subtitle && <div className={`text-xs ${d.isDark ? 'text-gray-500' : 'text-gray-400'}`}>{subtitle}</div>}
        </div>
    );
}
