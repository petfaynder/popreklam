import { useState, useEffect } from 'react';
import { Globe, Smartphone, Chrome, ChevronDown, ChevronUp, CheckCircle, Languages, ShieldCheck, Radio, Users, X, PlusCircle, InboxIcon, ShieldAlert, EyeOff } from 'lucide-react';
import { advertiserAPI } from '@/lib/api';
import { getDashboardTheme } from '@/lib/themeUtils';
import useTheme from '@/hooks/useTheme';
import CountrySelect from './CountrySelect';

const LANGUAGES = [
    { code: 'EN', label: 'English', flag: '🇬🇧' },
    { code: 'TR', label: 'Turkish', flag: '🇹🇷' },
    { code: 'DE', label: 'German', flag: '🇩🇪' },
    { code: 'FR', label: 'French', flag: '🇫🇷' },
    { code: 'ES', label: 'Spanish', flag: '🇪🇸' },
    { code: 'PT', label: 'Portuguese', flag: '🇧🇷' },
    { code: 'IT', label: 'Italian', flag: '🇮🇹' },
    { code: 'RU', label: 'Russian', flag: '🇷🇺' },
    { code: 'AR', label: 'Arabic', flag: '🇸🇦' },
    { code: 'ZH', label: 'Chinese', flag: '🇨🇳' },
    { code: 'JA', label: 'Japanese', flag: '🇯🇵' },
    { code: 'KO', label: 'Korean', flag: '🇰🇷' },
    { code: 'HI', label: 'Hindi', flag: '🇮🇳' },
    { code: 'PL', label: 'Polish', flag: '🇵🇱' },
    { code: 'NL', label: 'Dutch', flag: '🇳🇱' },
    { code: 'SV', label: 'Swedish', flag: '🇸🇪' },
    { code: 'NO', label: 'Norwegian', flag: '🇳🇴' },
    { code: 'DA', label: 'Danish', flag: '🇩🇰' },
    { code: 'FI', label: 'Finnish', flag: '🇫🇮' },
    { code: 'CS', label: 'Czech', flag: '🇨🇿' },
    { code: 'RO', label: 'Romanian', flag: '🇷🇴' },
    { code: 'HU', label: 'Hungarian', flag: '🇭🇺' },
    { code: 'EL', label: 'Greek', flag: '🇬🇷' },
    { code: 'TH', label: 'Thai', flag: '🇹🇭' },
    { code: 'VI', label: 'Vietnamese', flag: '🇻🇳' },
    { code: 'ID', label: 'Indonesian', flag: '🇮🇩' },
    { code: 'MS', label: 'Malay', flag: '🇲🇾' },
    { code: 'UK', label: 'Ukrainian', flag: '🇺🇦' },
    { code: 'BG', label: 'Bulgarian', flag: '🇧🇬' },
    { code: 'HR', label: 'Croatian', flag: '🇭🇷' },
    { code: 'SK', label: 'Slovak', flag: '🇸🇰' },
];

export default function TargetingSection({ formData, toggleArrayField, setFormData, updateField }) {
    const theme = useTheme();
    const d = getDashboardTheme(theme);

    const [audiences, setAudiences] = useState([]);
    const [audiencesLoaded, setAudiencesLoaded] = useState(false);
    const [carrierSearch, setCarrierSearch] = useState('');
    const [showIncludeDropdown, setShowIncludeDropdown] = useState(false);
    const [showExcludeDropdown, setShowExcludeDropdown] = useState(false);
    const [showFeedDropdown, setShowFeedDropdown] = useState(false);

    const [openSections, setOpenSections] = useState({
        geo: true,
        device: false,
        browser: false,
        language: false,
        protection: false,
        carrier: false,
    });

    useEffect(() => {
        if (!audiencesLoaded) {
            advertiserAPI.getAudiences().then(data => {
                setAudiences(Array.isArray(data) ? data : []);
                setAudiencesLoaded(true);
            }).catch(() => setAudiencesLoaded(true));
        }
    }, [audiencesLoaded]);

    const addAudienceTag = (field, audienceId) => {
        const current = formData[field] || [];
        if (!current.includes(audienceId)) {
            updateField(field, [...current, audienceId]);
        }
    };

    const removeAudienceTag = (field, audienceId) => {
        updateField(field, (formData[field] || []).filter(id => id !== audienceId));
    };

    const getAudienceName = (id) => audiences.find(a => a.id === id)?.name || id;

    const toggleSection = (section) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const Section = ({ id, title, icon: Icon, badge, children }) => {
        const isOpen = openSections[id];
        const hasSelection = (id === 'geo' && formData.countries.length > 0) ||
            (id === 'device' && (formData.devices.length > 0 || formData.os.length > 0)) ||
            (id === 'browser' && (formData.browsers.length > 0 || formData.connectionType?.length > 0)) ||
            (id === 'language' && formData.languages?.length > 0) ||
            (id === 'protection' && formData.blockProxy) ||
            (id === 'carrier' && formData.carriers?.length > 0);

        return (
            <div className={`rounded-xl border mb-4 transition-all ${d.card}`}>
                <button
                    type="button"
                    onClick={() => toggleSection(id)}
                    className={`w-full flex items-center justify-between p-4 text-left transition-colors ${d.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${hasSelection ? (d.isDark ? 'bg-lime-400/10 text-lime-400' : 'bg-lime-100 text-lime-700') : (d.isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500')}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className={`text-base font-bold ${d.heading}`}>{title}</h4>
                                {badge && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${d.isDark ? 'bg-lime-500/10 text-lime-400 border border-lime-500/20' : 'bg-lime-50 text-lime-700 border border-lime-200'}`}>
                                        {badge}
                                    </span>
                                )}
                            </div>
                            {hasSelection && (
                                <p className={`text-xs font-medium mt-0.5 ${d.isDark ? 'text-lime-500' : 'text-lime-700'}`}>Active filters</p>
                            )}
                        </div>
                    </div>
                    {isOpen ? <ChevronUp className={`w-5 h-5 ${d.muted}`} /> : <ChevronDown className={`w-5 h-5 ${d.muted}`} />}
                </button>

                {isOpen && (
                    <div className={`p-6 border-t ${d.isDark ? 'border-white/5' : 'border-gray-100'}`}>
                        {children}
                    </div>
                )}
            </div>
        );
    };

    const ToggleButton = ({ label, isSelected, onClick }) => (
        <button
            type="button"
            onClick={onClick}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${isSelected
                    ? `${d.isDark ? 'bg-lime-500/20 border-lime-500/50 text-lime-400' : 'bg-[#1A1A1A] border-[#1A1A1A] text-white'}`
                    : `${d.isDark ? 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`
                }`}
        >
            {isSelected && <CheckCircle className="w-3 h-3" />}
            {label}
        </button>
    );

    return (
        <div className="mb-6">
            <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${d.heading}`}>
                <Globe className={`w-5 h-5 ${d.accent}`} />
                Targeting
            </h3>

            {/* Premium Traffic Type Selector */}
            <div className={`p-6 rounded-2xl mb-6 border relative overflow-hidden group ${d.isDark ? 'bg-gradient-to-br from-gray-900 via-black to-[#0a0a0a] border-white/5' : 'bg-gradient-to-br from-white via-gray-50 to-gray-100 border-gray-200 shadow-sm'}`}>
                {/* Background decorative elements */}
                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 ${d.isDark ? 'bg-indigo-500' : 'bg-indigo-300'}`}></div>
                <div className={`absolute bottom-0 left-0 w-48 h-48 rounded-full blur-2xl opacity-20 translate-y-1/2 -translate-x-1/4 ${d.isDark ? 'bg-rose-500' : 'bg-rose-300'}`}></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <EyeOff className={`w-5 h-5 ${d.isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        <h4 className={`text-base font-bold ${d.heading}`}>Traffic Types</h4>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ml-1 ${d.isDark ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'}`}>Content Filter</span>
                    </div>
                    <p className={`text-xs mb-6 max-w-lg leading-relaxed ${d.muted}`}>
                        Select the types of publisher sites your campaign is allowed to run on. Restricting traffic type guarantees brand safety.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Mainstream Option */}
                        <button
                            type="button"
                            onClick={() => {
                                const current = formData.trafficTypes || [];
                                const updated = current.includes('MAINSTREAM') 
                                    ? current.filter(t => t !== 'MAINSTREAM')
                                    : [...current, 'MAINSTREAM'];
                                if (updated.length === 0) updated.push('ADULT'); // Prevent empty state if removing last one
                                updateField('trafficTypes', updated);
                            }}
                            className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${
                                formData.trafficTypes?.includes('MAINSTREAM')
                                    ? (d.isDark ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-indigo-500 bg-indigo-50 shadow-md')
                                    : (d.isDark ? 'border-white/5 bg-black/40 hover:bg-white/5' : 'border-gray-200 bg-white hover:bg-gray-50')
                            }`}
                        >
                            {formData.trafficTypes?.includes('MAINSTREAM') && (
                                <div className="absolute top-4 right-4 text-indigo-500">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                            )}
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${d.isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h5 className={`font-bold mb-1 ${d.isDark ? 'text-white' : 'text-gray-900'}`}>Mainstream</h5>
                            <p className={`text-xs leading-relaxed ${d.muted}`}>
                                Standard websites, tech, gaming, news, and family-safe content.
                            </p>
                        </button>

                        {/* Adult Option */}
                        <button
                            type="button"
                            onClick={() => {
                                const current = formData.trafficTypes || [];
                                const updated = current.includes('ADULT') 
                                    ? current.filter(t => t !== 'ADULT')
                                    : [...current, 'ADULT'];
                                if (updated.length === 0) updated.push('MAINSTREAM'); // Prevent empty state if removing last one
                                updateField('trafficTypes', updated);
                            }}
                            className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${
                                formData.trafficTypes?.includes('ADULT')
                                    ? (d.isDark ? 'border-rose-500/50 bg-rose-500/10' : 'border-rose-500 bg-rose-50 shadow-md')
                                    : (d.isDark ? 'border-white/5 bg-black/40 hover:bg-white/5' : 'border-gray-200 bg-white hover:bg-gray-50')
                            }`}
                        >
                            {formData.trafficTypes?.includes('ADULT') && (
                                <div className="absolute top-4 right-4 text-rose-500">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                            )}
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${d.isDark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-600'}`}>
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <h5 className={`font-bold mb-1 ${d.isDark ? 'text-white' : 'text-gray-900'}`}>Adult (NSFW)</h5>
                            <p className={`text-xs leading-relaxed ${d.muted}`}>
                                Age-restricted content, dating, and non-safe-for-work publisher sites.
                            </p>
                        </button>
                    </div>
                </div>
            </div>

            <Section id="geo" title="Geography" icon={Globe} badge="200+ Countries">
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className={`text-xs font-bold uppercase tracking-wider ${d.muted}`}>
                            Countries & Regions
                        </label>
                        {formData.countries.length === 0 && (
                            <span className={`text-xs ${d.muted} italic`}>
                                🌍 Targeting all countries by default
                            </span>
                        )}
                    </div>

                    <CountrySelect
                        selectedCountries={formData.countries}
                        onChange={(newCountries) =>
                            setFormData(prev => ({ ...prev, countries: newCountries }))
                        }
                    />

                    {formData.countries.length > 0 && (
                        <p className={`text-xs mt-3 ${d.muted}`}>
                            💡 Tip: Targeting fewer countries increases competition within those markets.
                            Start broad and optimize after collecting data.
                        </p>
                    )}
                </div>
            </Section>

            <Section id="device" title="Device & System" icon={Smartphone}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${d.muted}`}>Device Type</label>
                        <div className="flex flex-wrap gap-2">
                            {['DESKTOP', 'MOBILE', 'TABLET'].map((device) => (
                                <ToggleButton
                                    key={device}
                                    label={device}
                                    isSelected={formData.devices.includes(device)}
                                    onClick={() => toggleArrayField('devices', device)}
                                />
                            ))}
                        </div>
                        {formData.devices.length === 0 && (
                            <p className={`text-xs mt-2 ${d.muted} italic`}>All devices targeted</p>
                        )}
                    </div>
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${d.muted}`}>Operating System</label>
                        <div className="flex flex-wrap gap-2">
                            {['WINDOWS', 'MAC', 'LINUX', 'ANDROID', 'IOS'].map((os) => (
                                <ToggleButton
                                    key={os}
                                    label={os}
                                    isSelected={formData.os.includes(os)}
                                    onClick={() => toggleArrayField('os', os)}
                                />
                            ))}
                        </div>
                        {formData.os.length === 0 && (
                            <p className={`text-xs mt-2 ${d.muted} italic`}>All operating systems targeted</p>
                        )}
                    </div>
                </div>
            </Section>

            <Section id="browser" title="Browser & Connection" icon={Chrome}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${d.muted}`}>Browser</label>
                        <div className="flex flex-wrap gap-2">
                            {['CHROME', 'FIREFOX', 'SAFARI', 'EDGE', 'OPERA'].map((browser) => (
                                <ToggleButton
                                    key={browser}
                                    label={browser}
                                    isSelected={formData.browsers.includes(browser)}
                                    onClick={() => toggleArrayField('browsers', browser)}
                                />
                            ))}
                        </div>
                        {formData.browsers.length === 0 && (
                            <p className={`text-xs mt-2 ${d.muted} italic`}>All browsers targeted</p>
                        )}
                    </div>
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${d.muted}`}>Connection Type</label>
                        <div className="flex flex-wrap gap-2">
                            {['WIFI', 'CELLULAR_3G', 'CELLULAR_4G', 'CELLULAR_5G'].map((conn) => (
                                <ToggleButton
                                    key={conn}
                                    label={conn.replace('CELLULAR_', '')}
                                    isSelected={formData.connectionType?.includes(conn)}
                                    onClick={() => {
                                        const current = formData.connectionType || [];
                                        const updated = current.includes(conn)
                                            ? current.filter(c => c !== conn)
                                            : [...current, conn];
                                        setFormData(prev => ({ ...prev, connectionType: updated }));
                                    }}
                                />
                            ))}
                        </div>
                        {(!formData.connectionType || formData.connectionType.length === 0) && (
                            <p className={`text-xs mt-2 ${d.muted} italic`}>All connection types targeted</p>
                        )}
                    </div>
                </div>
            </Section>

            <Section id="language" title="Language Targeting" icon={Languages} badge={`${LANGUAGES.length} Languages`}>
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className={`text-xs font-bold uppercase tracking-wider ${d.muted}`}>
                            Browser Language
                        </label>
                        {(!formData.languages || formData.languages.length === 0) && (
                            <span className={`text-xs ${d.muted} italic`}>
                                🌐 All languages targeted
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {LANGUAGES.map(lang => {
                            const isSelected = formData.languages?.includes(lang.code);
                            return (
                                <button
                                    key={lang.code}
                                    type="button"
                                    onClick={() => {
                                        const current = formData.languages || [];
                                        const updated = current.includes(lang.code)
                                            ? current.filter(l => l !== lang.code)
                                            : [...current, lang.code];
                                        setFormData(prev => ({ ...prev, languages: updated }));
                                    }}
                                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${isSelected
                                        ? `${d.isDark ? 'bg-lime-500/20 border-lime-500/50 text-lime-400' : 'bg-[#1A1A1A] border-[#1A1A1A] text-white'}`
                                        : `${d.isDark ? 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`
                                    }`}
                                >
                                    {isSelected && <CheckCircle className="w-3 h-3" />}
                                    <span>{lang.flag}</span>
                                    <span>{lang.code}</span>
                                </button>
                            );
                        })}
                    </div>

                    {formData.languages?.length > 0 && (
                        <div className="mt-3 flex items-center justify-between">
                            <p className={`text-xs ${d.muted}`}>
                                {formData.languages.length} language{formData.languages.length > 1 ? 's' : ''} selected —
                                Only users with matching browser language will see your ads.
                            </p>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, languages: [] }))}
                                className={`text-[10px] font-bold px-2 py-1 rounded-lg ${d.isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>
            </Section>

            <Section id="protection" title="Traffic Quality" icon={ShieldCheck}>
                <div>
                    <div className={`flex items-start gap-4 p-4 rounded-xl border ${formData.blockProxy
                        ? (d.isDark ? 'border-lime-500/30 bg-lime-500/5' : 'border-lime-500/30 bg-lime-50')
                        : (d.isDark ? 'border-white/5 bg-white/5' : 'border-gray-200 bg-gray-50')
                    }`}>
                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                            <input
                                type="checkbox"
                                checked={formData.blockProxy || false}
                                onChange={(e) => setFormData(prev => ({ ...prev, blockProxy: e.target.checked }))}
                                className="sr-only peer"
                            />
                            <div className={`w-11 h-6 ${d.isDark ? 'bg-gray-700' : 'bg-gray-300'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500`}></div>
                        </label>
                        <div>
                            <h5 className={`text-sm font-bold ${formData.blockProxy ? d.accent : d.heading}`}>
                                🛡️ Block Proxy & VPN Traffic
                            </h5>
                            <p className={`text-xs mt-1 ${d.muted}`}>
                                Filter out traffic from proxies, VPNs, and data centers. Reduces overall reach
                                but significantly improves traffic quality and conversion rates.
                            </p>
                            {formData.blockProxy && (
                                <div className={`mt-3 flex items-center gap-2 text-xs font-medium ${d.isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                                    <span>⚠️</span>
                                    <span>Estimated reach reduction: 8-15% depending on geography</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Section>

            <Section id="carrier" title="ISP / Carrier" icon={Radio} badge="Mobile">
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className={`text-xs font-bold uppercase tracking-wider ${d.muted}`}>
                            Mobile Carriers & ISPs
                        </label>
                        {(!formData.carriers || formData.carriers.length === 0) && (
                            <span className={`text-xs ${d.muted} italic`}>
                                📡 All carriers targeted
                            </span>
                        )}
                    </div>

                    <input
                        type="text"
                        value={carrierSearch}
                        onChange={(e) => setCarrierSearch(e.target.value)}
                        placeholder="Search carriers (e.g. Vodafone, T-Mobile...)"
                        className={`${d.inputCls} w-full mb-3`}
                    />

                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                        {[
                            'Vodafone', 'T-Mobile', 'AT&T', 'Verizon', 'Orange',
                            'Turkcell', 'Türk Telekom', 'Avea', 'O2', 'Three',
                            'Sprint', 'EE', 'Movistar', 'Claro', 'TIM',
                            'Airtel', 'Jio', 'BSNL', 'China Mobile', 'China Unicom',
                            'SoftBank', 'NTT Docomo', 'SK Telecom', 'KT Corporation',
                            'Telstra', 'Optus', 'Swisscom', 'A1 Telekom', 'Telenor',
                            'Telia', 'Proximus', 'KPN', 'Bouygues', 'SFR',
                            'Wind', 'Play', 'Plus', 'Globe', 'Smart',
                            'MTN', 'Etisalat', 'STC', 'Zain', 'Du',
                        ].filter(c => !carrierSearch || c.toLowerCase().includes(carrierSearch.toLowerCase()))
                        .map(carrier => {
                            const isSelected = formData.carriers?.includes(carrier);
                            return (
                                <button
                                    key={carrier}
                                    type="button"
                                    onClick={() => {
                                        const current = formData.carriers || [];
                                        const updated = current.includes(carrier)
                                            ? current.filter(c => c !== carrier)
                                            : [...current, carrier];
                                        setFormData(prev => ({ ...prev, carriers: updated }));
                                    }}
                                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${isSelected
                                        ? `${d.isDark ? 'bg-lime-500/20 border-lime-500/50 text-lime-400' : 'bg-[#1A1A1A] border-[#1A1A1A] text-white'}`
                                        : `${d.isDark ? 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`
                                    }`}
                                >
                                    {isSelected && <CheckCircle className="w-3 h-3 inline mr-1" />}
                                    {carrier}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </Section>

            <div className={`p-5 rounded-2xl border ${ d.isDark ? 'border-white/5 bg-white/3' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-4">
                    <Users className={`w-4 h-4 ${d.accent}`} />
                    <h4 className={`text-sm font-bold ${d.heading}`}>Audience Targeting</h4>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${ d.isDark ? 'bg-lime-500/10 text-lime-400' : 'bg-lime-100 text-lime-700'}`}>Retargeting</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                        <label className={`block text-xs font-bold mb-2 ${ d.isDark ? 'text-green-400' : 'text-green-700'}`}>
                            ✅ Include Audiences
                        </label>
                        <p className={`text-[10px] mb-2 ${d.muted}`}>Show ad only to users in these audiences</p>
                        <div className={`min-h-[48px] flex flex-wrap gap-1.5 p-2 rounded-lg border ${ d.isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                            {(formData.audienceInclude || []).map(id => (
                                <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                    {getAudienceName(id)}
                                    <button type="button" onClick={() => removeAudienceTag('audienceInclude', id)} className="hover:text-red-400"><X className="w-2.5 h-2.5" /></button>
                                </span>
                            ))}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => { setShowIncludeDropdown(!showIncludeDropdown); setShowExcludeDropdown(false); setShowFeedDropdown(false); }}
                                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition ${ d.isDark ? 'border-white/10 text-gray-400 hover:text-white hover:border-white/20' : 'border-gray-200 text-gray-400 hover:text-gray-600'}`}
                                >
                                    <PlusCircle className="w-3 h-3" /> Add
                                </button>
                                {showIncludeDropdown && audiences.length > 0 && (
                                    <div className={`absolute top-7 left-0 z-50 w-56 rounded-xl shadow-xl border py-1 ${ d.isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'}`}>
                                        {audiences.filter(a => !(formData.audienceInclude || []).includes(a.id)).map(a => (
                                            <button key={a.id} type="button"
                                                onClick={() => { addAudienceTag('audienceInclude', a.id); setShowIncludeDropdown(false); }}
                                                className={`w-full text-left px-3 py-2 text-xs hover:bg-lime-500/10 transition ${d.text}`}
                                            >
                                                {a.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className={`block text-xs font-bold mb-2 ${ d.isDark ? 'text-red-400' : 'text-red-600'}`}>
                            🚫 Exclude Audiences
                        </label>
                        <p className={`text-[10px] mb-2 ${d.muted}`}>Hide ad from users in these audiences</p>
                        <div className={`min-h-[48px] flex flex-wrap gap-1.5 p-2 rounded-lg border ${ d.isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                            {(formData.audienceExclude || []).map(id => (
                                <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                    {getAudienceName(id)}
                                    <button type="button" onClick={() => removeAudienceTag('audienceExclude', id)} className="hover:text-red-600"><X className="w-2.5 h-2.5" /></button>
                                </span>
                            ))}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => { setShowExcludeDropdown(!showExcludeDropdown); setShowIncludeDropdown(false); setShowFeedDropdown(false); }}
                                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition ${ d.isDark ? 'border-white/10 text-gray-400 hover:text-white hover:border-white/20' : 'border-gray-200 text-gray-400 hover:text-gray-600'}`}
                                >
                                    <PlusCircle className="w-3 h-3" /> Add
                                </button>
                                {showExcludeDropdown && audiences.length > 0 && (
                                    <div className={`absolute top-7 left-0 z-50 w-56 rounded-xl shadow-xl border py-1 ${ d.isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'}`}>
                                        {audiences.filter(a => !(formData.audienceExclude || []).includes(a.id)).map(a => (
                                            <button key={a.id} type="button"
                                                onClick={() => { addAudienceTag('audienceExclude', a.id); setShowExcludeDropdown(false); }}
                                                className={`w-full text-left px-3 py-2 text-xs hover:bg-red-500/10 transition ${d.text}`}
                                            >
                                                {a.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`p-4 rounded-xl border ${ d.isDark ? 'bg-blue-500/5 border-blue-500/15' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <InboxIcon className={`w-3.5 h-3.5 ${ d.isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        <p className={`text-xs font-bold ${ d.isDark ? 'text-blue-400' : 'text-blue-700'}`}>Audience Collection</p>
                    </div>
                    <p className={`text-[10px] mb-3 ${d.muted}`}>Feed visitors of this campaign into an audience for future retargeting</p>
                    <div className="flex flex-wrap gap-1.5 items-center">
                        {(formData.feedAudienceIds || []).map(id => (
                            <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                {getAudienceName(id)}
                                <button type="button" onClick={() => removeAudienceTag('feedAudienceIds', id)} className="hover:text-red-400"><X className="w-2.5 h-2.5" /></button>
                            </span>
                        ))}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => { setShowFeedDropdown(!showFeedDropdown); setShowIncludeDropdown(false); setShowExcludeDropdown(false); }}
                                className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg border transition font-medium ${ d.isDark ? 'border-blue-500/20 text-blue-400 hover:bg-blue-500/10' : 'border-blue-200 text-blue-600 hover:bg-blue-100'}`}
                            >
                                <PlusCircle className="w-3 h-3" /> Select Audience
                            </button>
                            {showFeedDropdown && audiences.length > 0 && (
                                <div className={`absolute bottom-8 left-0 z-50 w-56 rounded-xl shadow-xl border py-1 ${ d.isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'}`}>
                                    {audiences.filter(a => !(formData.feedAudienceIds || []).includes(a.id)).map(a => (
                                        <button key={a.id} type="button"
                                            onClick={() => { addAudienceTag('feedAudienceIds', a.id); setShowFeedDropdown(false); }}
                                            className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-500/10 transition ${d.text}`}
                                        >
                                            {a.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
