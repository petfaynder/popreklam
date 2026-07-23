'use client';

import { useState } from 'react';
import { Code2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { getDashboardTheme } from '@/lib/themeUtils';
import useTheme from '@/hooks/useTheme';

const MACROS = [
    {
        category: 'Tracking',
        items: [
            { macro: '{clickid}', desc: 'Unique click identifier for conversion tracking', example: 'abc123xyz' },
            { macro: '{subid}', desc: 'Sub-ID for traffic source segmentation', example: 'push_tier1' },
            { macro: '{campaignid}', desc: 'Campaign ID', example: '12345' },
            { macro: '{zoneid}', desc: 'Publisher zone/placement ID', example: '98765' },
            { macro: '{cost}', desc: 'Actual CPM cost of the impression', example: '1.20' },
        ]
    },
    {
        category: 'Geo & Device',
        items: [
            { macro: '{country}', desc: 'ISO 2-letter country code of visitor', example: 'US' },
            { macro: '{city}', desc: 'City name of the visitor', example: 'New York' },
            { macro: '{device}', desc: 'Device type: desktop, mobile, tablet', example: 'mobile' },
            { macro: '{os}', desc: 'Operating system', example: 'Android' },
            { macro: '{browser}', desc: 'Browser name', example: 'Chrome' },
            { macro: '{ip}', desc: 'Visitor IP address (hashed)', example: '1.2.xxx.xxx' },
        ]
    },
    {
        category: 'Traffic Source',
        items: [
            { macro: '{publisher}', desc: 'Publisher site domain', example: 'example.com' },
            { macro: '{referer}', desc: 'HTTP referrer URL', example: 'https://site.com/page' },
            { macro: '{timestamp}', desc: 'Unix timestamp of impression', example: '1712345678' },
            { macro: '{ua}', desc: 'URL-encoded user agent string', example: 'Mozilla%2F5.0...' },
        ]
    },
];

export default function MacroHelper({ targetUrl, onInsert }) {
    const theme = useTheme();
    const d = getDashboardTheme(theme);
    const [isOpen, setIsOpen] = useState(false);
    const [copiedMacro, setCopiedMacro] = useState(null);

    const handleCopy = (macro) => {
        navigator.clipboard.writeText(macro).then(() => {
            setCopiedMacro(macro);
            setTimeout(() => setCopiedMacro(null), 1500);
        });
    };

    const handleInsert = (macro) => {
        if (onInsert) {
            onInsert(macro);
        } else {
            handleCopy(macro);
        }
    };

    // Detect which macros are already in the URL
    const usedMacros = MACROS.flatMap(cat => cat.items)
        .filter(item => targetUrl?.includes(item.macro))
        .map(item => item.macro);

    return (
        <div className={`rounded-xl border mb-6 overflow-hidden ${d.isDark ? 'border-white/10' : 'border-gray-200'}`}>
            {/* Header */}
            <button
                type="button"
                onClick={() => setIsOpen(p => !p)}
                className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${d.isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${d.isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                        <Code2 className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                        <span className={`text-sm font-bold ${d.heading}`}>Tracking Macros</span>
                        {usedMacros.length > 0 && (
                            <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${d.isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                                {usedMacros.length} used
                            </span>
                        )}
                        <p className={`text-[11px] ${d.muted} mt-0.5`}>Click to insert dynamic parameters into your URL</p>
                    </div>
                </div>
                {isOpen ? <ChevronUp className={`w-4 h-4 ${d.muted}`} /> : <ChevronDown className={`w-4 h-4 ${d.muted}`} />}
            </button>

            {/* Panel */}
            {isOpen && (
                <div className={`p-4 border-t ${d.isDark ? 'border-white/5 bg-black/10' : 'border-gray-100 bg-white'}`}>
                    <p className={`text-xs mb-4 ${d.muted}`}>
                        These macros are dynamically replaced with real values when your ad is served.
                        Click any macro to copy it, then paste into your Target URL.
                    </p>

                    {MACROS.map(cat => (
                        <div key={cat.category} className="mb-4 last:mb-0">
                            <h5 className={`text-[10px] font-black uppercase tracking-wider mb-2 ${d.isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {cat.category}
                            </h5>
                            <div className="space-y-1.5">
                                {cat.items.map(item => {
                                    const isUsed = usedMacros.includes(item.macro);
                                    const isCopied = copiedMacro === item.macro;
                                    return (
                                        <div
                                            key={item.macro}
                                            className={`flex items-start gap-3 p-2.5 rounded-lg group cursor-pointer transition-all ${
                                                isUsed
                                                    ? (d.isDark ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200')
                                                    : (d.isDark ? 'hover:bg-white/5 border border-transparent' : 'hover:bg-gray-50 border border-transparent')
                                            }`}
                                            onClick={() => handleInsert(item.macro)}
                                        >
                                            <code className={`text-[11px] font-mono font-bold flex-shrink-0 px-2 py-0.5 rounded ${
                                                isUsed
                                                    ? (d.isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700')
                                                    : (d.isDark ? 'bg-white/10 text-lime-400' : 'bg-gray-100 text-gray-700')
                                            }`}>
                                                {item.macro}
                                            </code>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs ${d.text}`}>{item.desc}</p>
                                                <p className={`text-[10px] ${d.muted} mt-0.5`}>e.g. <span className="font-mono">{item.example}</span></p>
                                            </div>
                                            <button
                                                type="button"
                                                className={`flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${d.isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}
                                                onClick={(e) => { e.stopPropagation(); handleCopy(item.macro); }}
                                            >
                                                {isCopied
                                                    ? <Check className="w-3.5 h-3.5 text-lime-400" />
                                                    : <Copy className="w-3.5 h-3.5" />
                                                }
                                            </button>
                                            {isUsed && (
                                                <span className={`flex-shrink-0 text-[9px] font-bold uppercase px-1 py-0.5 rounded ${d.isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                                                    ✓ Used
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Example URL */}
                    <div className={`mt-4 p-3 rounded-xl text-[10px] font-mono break-all ${d.isDark ? 'bg-black/30 text-gray-400' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                        <span className={`text-[9px] uppercase font-bold tracking-wider block mb-1 ${d.muted}`}>Example Postback URL:</span>
                        https://track.example.com/convert?click=<span className="text-lime-400">{'{clickid}'}</span>&country=<span className="text-lime-400">{'{country}'}</span>&cost=<span className="text-lime-400">{'{cost}'}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
