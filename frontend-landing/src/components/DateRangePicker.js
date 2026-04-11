'use client';

import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

const PRESET_RANGES = [
    { label: 'Last 7 Days', value: 7 },
    { label: 'Last 30 Days', value: 30 },
    { label: 'Last 90 Days', value: 90 },
    { label: 'This Month', value: 'month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'This Year', value: 'year' }
];

export default function DateRangePicker({ onRangeChange, defaultRange = 30 }) {
    const [selected, setSelected] = useState(defaultRange);
    const [isOpen, setIsOpen] = useState(false);
    const theme = useTheme();
    const d = getDashboardTheme(theme);

    const handleRangeSelect = (range) => {
        setSelected(range);
        setIsOpen(false);

        const endDate = new Date();
        let startDate = new Date();

        if (typeof range === 'number') {
            startDate.setDate(endDate.getDate() - range);
        } else if (range === 'month') {
            startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        } else if (range === 'last_month') {
            startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
            endDate.setDate(0);
        } else if (range === 'year') {
            startDate = new Date(endDate.getFullYear(), 0, 1);
        }

        onRangeChange({
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            period: range
        });
    };

    const getSelectedLabel = () => {
        const preset = PRESET_RANGES.find(r => r.value === selected);
        return preset ? preset.label : `Last ${selected} Days`;
    };

    // Theme-aware dropdown styles
    const dropdownBg = d.isDark
        ? 'bg-slate-900 border border-white/10'
        : theme === 'theme-brutalist'
            ? 'bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]'
            : 'bg-white border border-gray-200 shadow-lg';

    const itemActive = d.isDark
        ? 'bg-white/10 text-white font-medium'
        : theme === 'theme-brutalist'
            ? 'bg-[#1A1A1A] text-white font-black uppercase tracking-wider'
            : 'bg-[#FBF9F6] text-[#1A1A1A] font-semibold';

    const itemInactive = d.isDark
        ? 'text-gray-400 hover:bg-white/5 hover:text-white'
        : theme === 'theme-brutalist'
            ? 'text-[#1A1A1A] font-bold hover:bg-[#F5F5F0] uppercase tracking-wider'
            : 'text-gray-500 hover:bg-[#FBF9F6] hover:text-[#1A1A1A]';

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${d.btnSecondary} flex items-center gap-2`}
            >
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">{getSelectedLabel()}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className={`absolute top-full right-0 mt-2 w-48 ${dropdownBg} rounded-xl z-20 overflow-hidden`}>
                        {PRESET_RANGES.map((range) => (
                            <button
                                key={range.value}
                                onClick={() => handleRangeSelect(range.value)}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-all ${selected === range.value ? itemActive : itemInactive}`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
