'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Globe, Search, X, ChevronDown, ChevronUp, Check, ChevronsUpDown } from 'lucide-react';
import { getDashboardTheme } from '@/lib/themeUtils';
import useTheme from '@/hooks/useTheme';
import {
    COUNTRIES,
    CONTINENTS,
    getCountriesByContinent,
    getCountryCodesByContinent,
    getCountryByCode
} from './countryData';

const countriesByContinent = getCountriesByContinent();

export default function CountrySelect({ selectedCountries = [], onChange }) {
    const theme = useTheme();
    const d = getDashboardTheme(theme);

    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [panelStyle, setPanelStyle] = useState({});
    const triggerRef = useRef(null);
    const searchRef = useRef(null);

    // Compute panel position based on trigger's bounding rect
    const updatePanelPosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setPanelStyle({
            position: 'fixed',
            top: rect.bottom + 8,
            left: rect.left,
            width: rect.width,
            zIndex: 9999,
        });
    }, []);

    // Update position on open, scroll, resize
    useEffect(() => {
        if (!isOpen) return;
        updatePanelPosition();
        window.addEventListener('scroll', updatePanelPosition, true);
        window.addEventListener('resize', updatePanelPosition);
        return () => {
            window.removeEventListener('scroll', updatePanelPosition, true);
            window.removeEventListener('resize', updatePanelPosition);
        };
    }, [isOpen, updatePanelPosition]);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!isOpen) return;
        const handler = () => setIsOpen(false);
        const tid = setTimeout(() => {
            document.addEventListener('click', handler);
        }, 10);
        return () => {
            clearTimeout(tid);
            document.removeEventListener('click', handler);
        };
    }, [isOpen]);

    // Focus search on open
    useEffect(() => {
        if (isOpen && searchRef.current) {
            setTimeout(() => searchRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Search filter
    const filteredCountries = useCallback(() => {
        let list = activeTab === 'ALL'
            ? COUNTRIES
            : countriesByContinent[activeTab] || [];

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.code.toLowerCase().includes(q)
            );
        }
        return list;
    }, [search, activeTab]);

    const filtered = filteredCountries();

    // Calculate selected countries in continent
    const getSelectedCountInContinent = (continentKey) => {
        const codes = getCountryCodesByContinent(continentKey);
        return codes.filter(c => selectedCountries.includes(c)).length;
    };

    // Continent selection toggle
    const toggleContinent = (continentKey) => {
        const codes = getCountryCodesByContinent(continentKey);
        const allSelected = codes.every(c => selectedCountries.includes(c));
        if (allSelected) {
            // Remove all
            onChange(selectedCountries.filter(c => !codes.includes(c)));
        } else {
            // Add all (clear duplicates)
            const merged = Array.from(new Set([...selectedCountries, ...codes]));
            onChange(merged);
        }
    };

    // Single country toggle
    const toggleCountry = (code) => {
        if (selectedCountries.includes(code)) {
            onChange(selectedCountries.filter(c => c !== code));
        } else {
            onChange([...selectedCountries, code]);
        }
    };

    // Select / clear all
    const selectAll = () => {
        const allCodes = COUNTRIES.map(c => c.code);
        onChange(allCodes);
    };

    const clearAll = () => onChange([]);

    // Are all countries in the continent selected?
    const isContinentFullySelected = (continentKey) => {
        const codes = getCountryCodesByContinent(continentKey);
        return codes.length > 0 && codes.every(c => selectedCountries.includes(c));
    };

    const isContinentPartiallySelected = (continentKey) => {
        const codes = getCountryCodesByContinent(continentKey);
        return codes.some(c => selectedCountries.includes(c)) && !isContinentFullySelected(continentKey);
    };

    const selectedCount = selectedCountries.length;
    const totalCount = COUNTRIES.length;

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                ref={triggerRef}
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(prev => !prev);
                }}
                className={`
                    w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left
                    transition-all duration-200
                    ${isOpen
                        ? (d.isDark ? 'border-lime-500/50 bg-lime-500/5' : 'border-lime-500 bg-lime-50')
                        : (d.isDark ? 'border-white/10 bg-white/5 hover:border-white/20' : 'border-gray-200 bg-white hover:border-gray-300')
                    }
                `}
            >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Globe className={`w-4 h-4 flex-shrink-0 ${selectedCount > 0 ? 'text-lime-400' : d.muted}`} />
                    {selectedCount === 0 ? (
                        <span className={`text-sm ${d.muted}`}>All countries (Global reach)</span>
                    ) : selectedCount === totalCount ? (
                        <span className={`text-sm font-medium ${d.text}`}>🌍 All Countries Selected</span>
                    ) : (
                        <div className="flex flex-wrap gap-1 min-w-0 flex-1 max-h-12 overflow-hidden">
                            {selectedCountries.slice(0, 6).map(code => {
                                const country = getCountryByCode(code);
                                return country ? (
                                    <span
                                        key={code}
                                        className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-md
                                            ${d.isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}`}
                                    >
                                        {country.flag} {code}
                                    </span>
                                ) : null;
                            })}
                            {selectedCount > 6 && (
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${d.isDark ? 'bg-lime-500/20 text-lime-400' : 'bg-lime-100 text-lime-700'}`}>
                                    +{selectedCount - 6} more
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {selectedCount > 0 && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${d.isDark ? 'bg-lime-500/20 text-lime-400' : 'bg-lime-100 text-lime-700'}`}>
                            {selectedCount}
                        </span>
                    )}
                    {isOpen ? (
                        <ChevronUp className={`w-4 h-4 ${d.muted}`} />
                    ) : (
                        <ChevronDown className={`w-4 h-4 ${d.muted}`} />
                    )}
                </div>
            </button>

            {/* Dropdown Panel — fixed positioned to escape overflow:hidden parents */}
            {isOpen && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className={`
                        rounded-2xl border shadow-2xl
                        flex flex-col
                        ${d.isDark ? 'bg-[#1a1a2e] border-white/10' : 'bg-white border-gray-200'}
                    `}
                    style={{ ...panelStyle, maxHeight: '480px' }}
                >
                    {/* Search Bar */}
                    <div className={`p-3 border-b ${d.isDark ? 'border-white/5' : 'border-gray-100'}`}>
                        <div className="relative">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${d.muted}`} />
                            <input
                                ref={searchRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search countries..."
                                className={`
                                    w-full pl-9 pr-4 py-2 text-sm rounded-lg border
                                    focus:outline-none focus:border-lime-500 transition-colors
                                    ${d.isDark
                                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                                    }
                                `}
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${d.muted} hover:text-white`}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Continent Tabs */}
                    {!search && (
                        <div className={`flex gap-0.5 p-2 border-b overflow-x-auto scrollbar-hide ${d.isDark ? 'border-white/5 bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
                            {/* All Tab */}
                            <button
                                type="button"
                                onClick={() => setActiveTab('ALL')}
                                className={`
                                    flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                                    ${activeTab === 'ALL'
                                        ? (d.isDark ? 'bg-lime-500/20 text-lime-400' : 'bg-lime-100 text-lime-700')
                                        : (d.isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:bg-gray-200')
                                    }
                                `}
                            >
                                🌐 All
                            </button>

                            {Object.entries(CONTINENTS).map(([key, continent]) => {
                                const selectedInContinent = getSelectedCountInContinent(key);
                                const totalInContinent = (countriesByContinent[key] || []).length;
                                const isActive = activeTab === key;

                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setActiveTab(key)}
                                        className={`
                                            flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                                            ${isActive
                                                ? (d.isDark ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-900')
                                                : (d.isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:bg-gray-200')
                                            }
                                        `}
                                    >
                                        <span>{continent.emoji}</span>
                                        <span>{continent.label}</span>
                                        {selectedInContinent > 0 && (
                                            <span className={`text-[10px] px-1 rounded ${d.isDark ? 'bg-lime-500/30 text-lime-400' : 'bg-lime-100 text-lime-700'}`}>
                                                {selectedInContinent}/{totalInContinent}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Continent Quick Select (shown when a continent tab is active) */}
                    {!search && activeTab !== 'ALL' && (
                        <div className={`px-3 py-2 border-b flex items-center justify-between ${d.isDark ? 'border-white/5 bg-black/10' : 'border-gray-100 bg-gray-50/50'}`}>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${d.text}`}>
                                    {CONTINENTS[activeTab]?.emoji} {CONTINENTS[activeTab]?.label}
                                </span>
                                <span className={`text-[10px] ${d.muted}`}>
                                    ({(countriesByContinent[activeTab] || []).length} countries)
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => toggleContinent(activeTab)}
                                className={`
                                    text-xs font-bold px-3 py-1 rounded-lg transition-all
                                    ${isContinentFullySelected(activeTab)
                                        ? (d.isDark ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-50 text-red-600 hover:bg-red-100')
                                        : (d.isDark ? 'bg-lime-500/20 text-lime-400 hover:bg-lime-500/30' : 'bg-lime-100 text-lime-700 hover:bg-lime-200')
                                    }
                                `}
                            >
                                {isContinentFullySelected(activeTab) ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                    )}

                    {/* Country Grid */}
                    <div className="overflow-y-auto flex-1" style={{ minHeight: 0 }}>
                        {search && filtered.length === 0 ? (
                            <div className={`p-8 text-center ${d.muted} text-sm`}>
                                No countries found for "{search}"
                            </div>
                        ) : (
                            <div className="p-2 grid grid-cols-2 sm:grid-cols-3 gap-0.5">
                                {/* Continent headers in "ALL" view */}
                                {activeTab === 'ALL' && !search ? (
                                    Object.entries(CONTINENTS).map(([continentKey, continent]) => {
                                        const countries = countriesByContinent[continentKey] || [];
                                        const isFullySelected = isContinentFullySelected(continentKey);
                                        const isPartial = isContinentPartiallySelected(continentKey);

                                        return (
                                            <div key={continentKey} className="col-span-2 sm:col-span-3">
                                                {/* Continent Header Row */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleContinent(continentKey)}
                                                    className={`
                                                        w-full flex items-center justify-between px-3 py-2 my-1 rounded-xl text-xs font-bold transition-all
                                                        ${isFullySelected
                                                            ? (d.isDark ? 'bg-lime-500/15 text-lime-400' : 'bg-lime-50 text-lime-700')
                                                            : isPartial
                                                                ? (d.isDark ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-50 text-yellow-700')
                                                                : (d.isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                                                        }
                                                    `}
                                                >
                                                    <span>{continent.emoji} {continent.label}</span>
                                                    <div className="flex items-center gap-2">
                                                        {(isFullySelected || isPartial) && (
                                                            <span className={`text-[10px] ${d.isDark ? 'opacity-70' : 'opacity-80'}`}>
                                                                {getSelectedCountInContinent(continentKey)}/{countries.length}
                                                            </span>
                                                        )}
                                                        <div className={`
                                                            w-4 h-4 rounded border flex items-center justify-center
                                                            ${isFullySelected
                                                                ? 'bg-lime-500 border-lime-500'
                                                                : isPartial
                                                                    ? 'bg-yellow-500/20 border-yellow-500/50'
                                                                    : (d.isDark ? 'border-white/20' : 'border-gray-300')
                                                            }
                                                        `}>
                                                            {isFullySelected && <Check className="w-2.5 h-2.5 text-white" />}
                                                            {isPartial && <div className="w-2 h-0.5 bg-yellow-400 rounded" />}
                                                        </div>
                                                    </div>
                                                </button>

                                                {/* Countries in this continent */}
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-0.5 mb-1">
                                                    {countries.map(country => (
                                                        <CountryItem
                                                            key={country.code}
                                                            country={country}
                                                            isSelected={selectedCountries.includes(country.code)}
                                                            onToggle={() => toggleCountry(country.code)}
                                                            d={d}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    // Filtered / single continent list
                                    filtered.map(country => (
                                        <CountryItem
                                            key={country.code}
                                            country={country}
                                            isSelected={selectedCountries.includes(country.code)}
                                            onToggle={() => toggleCountry(country.code)}
                                            d={d}
                                        />
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className={`p-3 border-t flex items-center justify-between ${d.isDark ? 'border-white/5 bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
                        <span className={`text-xs ${d.muted}`}>
                            {selectedCount === 0
                                ? 'No countries selected (Global)'
                                : `${selectedCount} of ${totalCount} countries selected`
                            }
                        </span>
                        <div className="flex gap-2">
                            {selectedCount > 0 && (
                                <button
                                    type="button"
                                    onClick={clearAll}
                                    className={`text-xs font-medium px-2 py-1 rounded-lg transition-colors ${d.isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
                                >
                                    Clear All
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={selectAll}
                                className={`text-xs font-medium px-2 py-1 rounded-lg transition-colors ${d.isDark ? 'text-lime-400 hover:bg-lime-500/10' : 'text-lime-700 hover:bg-lime-50'}`}
                            >
                                Select All
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${d.isDark ? 'bg-lime-500/20 text-lime-400 hover:bg-lime-500/30' : 'bg-lime-100 text-lime-700 hover:bg-lime-200'}`}
                            >
                                Done ✓
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Selected Chips (below the trigger, shown when >0 selected) */}
            {selectedCount > 0 && selectedCount <= 15 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedCountries.map(code => {
                        const country = getCountryByCode(code);
                        if (!country) return null;
                        return (
                            <span
                                key={code}
                                className={`
                                    inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg
                                    group cursor-default
                                    ${d.isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'}
                                `}
                            >
                                {country.flag} {country.name}
                                <button
                                    type="button"
                                    onClick={() => toggleCountry(code)}
                                    className={`ml-0.5 rounded-full transition-colors ${d.isDark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}
            {selectedCount > 15 && (
                <div className={`mt-2 text-xs font-medium px-3 py-2 rounded-xl ${d.isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                    🌍 {selectedCount} countries selected across multiple regions
                </div>
            )}
        </div>
    );
}

// Single country row item
function CountryItem({ country, isSelected, onToggle, d }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`
                flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium
                transition-all duration-100 text-left w-full
                ${isSelected
                    ? (d.isDark ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30' : 'bg-lime-50 text-lime-700 border border-lime-200')
                    : (d.isDark ? 'text-gray-300 hover:bg-white/5 border border-transparent' : 'text-gray-700 hover:bg-gray-100 border border-transparent')
                }
            `}
        >
            <span className="text-base leading-none flex-shrink-0">{country.flag}</span>
            <span className="truncate flex-1">{country.name}</span>
            {isSelected && <Check className="w-3 h-3 flex-shrink-0 text-lime-400" />}
        </button>
    );
}
