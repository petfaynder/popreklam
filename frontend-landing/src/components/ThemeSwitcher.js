'use client';

import { useState, useEffect } from "react";
import { Paintbrush } from "lucide-react";

export default function ThemeSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTheme, setActiveTheme] = useState('theme-brutalist');

    useEffect(() => {
        const saved = localStorage.getItem('site_theme');
        if (saved) setActiveTheme(saved);
    }, []);

    const handleThemeChange = (theme) => {
        setActiveTheme(theme);
        localStorage.setItem('site_theme', theme);

        // Dispatch custom event for page.js to catch
        window.dispatchEvent(new CustomEvent('themeChange', { detail: theme }));
    };

    return (
        <div className="fixed bottom-6 left-6 z-[99999]" onMouseLeave={() => setIsOpen(false)}>
            <button
                onMouseEnter={() => setIsOpen(true)}
                onClick={() => setIsOpen(!isOpen)}
                className="bg-black text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform border-4 border-white"
                title="Change Theme"
            >
                <Paintbrush className="w-6 h-6" />
            </button>

            {isOpen && (
                <div className="absolute bottom-20 left-0 bg-white border border-gray-200 text-black p-4 rounded-xl shadow-2xl w-72 animate-fade-up">
                    <h3 className="font-bold mb-3 text-xs uppercase tracking-wider text-gray-500">Select Interface Style</h3>
                    <div className="space-y-2">
                        <button
                            onClick={() => handleThemeChange('theme-brutalist')}
                            className={`w-full text-left p-3 rounded-lg text-sm font-bold border-2 transition-all flex items-center gap-3 ${activeTheme === 'theme-brutalist' ? 'bg-gray-100 border-black' : 'border-transparent hover:bg-gray-50'}`}
                        >
                            <div className="w-4 h-4 bg-red-500 border border-black"></div>
                            <div>
                                <div className="leading-none">Brutalist</div>
                                <div className="text-[10px] text-gray-400 font-normal mt-1">Bordered, Raw, Tech</div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleThemeChange('theme-classic')} // Using classic key for SaaS layout
                            className={`w-full text-left p-3 rounded-lg text-sm font-bold border-2 transition-all flex items-center gap-3 ${activeTheme === 'theme-classic' ? 'bg-gray-100 border-purple-500' : 'border-transparent hover:bg-gray-50'}`}
                        >
                            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500"></div>
                            <div>
                                <div className="leading-none">Ethereal SaaS</div>
                                <div className="text-[10px] text-gray-400 font-normal mt-1">Dark, Glass, Modern</div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleThemeChange('theme-neon')}
                            className={`w-full text-left p-3 rounded-lg text-sm font-bold border-2 transition-all flex items-center gap-3 ${activeTheme === 'theme-neon' ? 'bg-gray-100 border-gray-500' : 'border-transparent hover:bg-gray-50'}`}
                        >
                            <div className="w-4 h-4 bg-white border border-black"></div>
                            <div>
                                <div className="leading-none">Newspaper / Editorial</div>
                                <div className="text-[10px] text-gray-400 font-normal mt-1">Serif, Minimal, Grid</div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleThemeChange('theme-publisher')}
                            className={`w-full text-left p-3 rounded-lg text-sm font-bold border-2 transition-all flex items-center gap-3 ${activeTheme === 'theme-publisher' ? 'bg-gray-100 border-lime-400' : 'border-transparent hover:bg-gray-50'}`}
                        >
                            <div className="w-4 h-4 bg-lime-400 rounded-full shadow-lg shadow-lime-400/50"></div>
                            <div>
                                <div className="leading-none">Luminous (Publisher)</div>
                                <div className="text-[10px] text-gray-400 font-normal mt-1">Lime, Dark, Vibrant</div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleThemeChange('theme-advertiser')}
                            className={`w-full text-left p-3 rounded-lg text-sm font-bold border-2 transition-all flex items-center gap-3 ${activeTheme === 'theme-advertiser' ? 'bg-gray-100 border-sky-500' : 'border-transparent hover:bg-gray-50'}`}
                        >
                            <div className="w-4 h-4 bg-sky-500 rounded-lg shadow-lg shadow-sky-500/50"></div>
                            <div>
                                <div className="leading-none">Azure (Advertiser)</div>
                                <div className="text-[10px] text-gray-400 font-normal mt-1">Blue, Corporate, Tech</div>
                            </div>
                        </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">
                            * Switching swaps the entire layout engine component.
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
