/**
 * Shared theme utility — centralizes theme-dependent class generation.
 * Use this instead of duplicating conditional logic in every page.
 *
 * Usage:
 *   import { getThemeClasses } from '@/lib/themeUtils';
 *   const t = getThemeClasses(theme);
 *   <div className={t.pageBg}>
 */

const THEME_MAPS = {
    'theme-brutalist': {
        isDark: false,
        pageBg: 'bg-background text-foreground',
        cardBg: 'bg-card border-2 border-foreground',
        accent: 'text-primary',
        accentBg: 'bg-primary text-white',
        headingFont: '',
        bodyFont: '',
        sectionBg: 'bg-gray-100',
        border: 'border-foreground',
        inputCls: 'border-2 border-foreground bg-background focus:ring-primary',
        btnPrimary: 'bg-foreground text-background hover:bg-primary hover:text-white border-2 border-foreground shadow-[4px_4px_0px_0px_var(--color-accent)]',
        btnSecondary: 'border-2 border-foreground hover:bg-gray-100',
        gradientText: 'text-foreground',
        link: 'text-primary hover:underline',
        muted: 'text-gray-500',
        tag: 'border-2 border-foreground text-foreground bg-transparent',
    },
    'theme-saas': {
        isDark: true,
        pageBg: 'bg-[#09090B] text-white',
        cardBg: 'rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur',
        accent: 'text-white',
        accentBg: 'bg-white text-black',
        headingFont: "style={{ fontFamily: 'var(--font-sans)' }}",
        bodyFont: "style={{ fontFamily: 'var(--font-sans)' }}",
        sectionBg: 'bg-white/[0.02]',
        border: 'border-white/10',
        inputCls: 'bg-white/5 border border-white/10 rounded-lg text-white focus:border-white/20 focus:ring-white/10',
        btnPrimary: 'bg-white text-black rounded-lg hover:bg-gray-100',
        btnSecondary: 'border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/5',
        gradientText: 'text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400',
        link: 'text-white hover:text-gray-300',
        muted: 'text-gray-500',
        tag: 'bg-white/5 border border-white/10 rounded-full text-gray-400',
    },
    'theme-editorial': {
        isDark: false,
        pageBg: 'bg-[#FBF9F6] text-[#1A1A1A]',
        cardBg: 'bg-white border border-gray-300 shadow-sm',
        accent: 'text-red-700',
        accentBg: 'bg-red-700 text-white',
        headingFont: "style={{ fontFamily: 'var(--font-serif)' }}",
        bodyFont: "style={{ fontFamily: 'var(--font-sans)' }}",
        sectionBg: 'bg-white',
        border: 'border-gray-300',
        inputCls: 'border border-gray-300 bg-[#FBF9F6] focus:border-red-700 focus:ring-red-700',
        btnPrimary: 'bg-[#1A1A1A] text-white hover:bg-red-700',
        btnSecondary: 'border border-gray-300 text-gray-500 hover:border-red-700 hover:text-red-700',
        gradientText: 'text-[#1A1A1A]',
        link: 'text-red-700 hover:underline',
        muted: 'text-gray-500',
        tag: 'border border-gray-300 text-gray-600 bg-white',
    },
    'theme-luminous': {
        isDark: true,
        pageBg: 'bg-slate-950 text-white',
        cardBg: 'rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl',
        accent: 'text-lime-400',
        accentBg: 'bg-lime-400 text-slate-900',
        headingFont: "style={{ fontFamily: 'var(--font-heading)' }}",
        bodyFont: '',
        sectionBg: 'bg-white/[0.02]',
        border: 'border-white/10',
        inputCls: 'bg-slate-900/50 border border-white/10 rounded-xl text-white focus:border-lime-400/50 focus:ring-lime-400/50',
        btnPrimary: 'bg-lime-400 text-slate-900 rounded-xl hover:bg-lime-300 shadow-[0_0_20px_rgba(163,255,51,0.3)]',
        btnSecondary: 'border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-lime-400/30',
        gradientText: 'text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400',
        link: 'text-lime-400 hover:text-lime-300',
        muted: 'text-gray-400',
        tag: 'bg-white/5 border border-white/10 rounded-full text-gray-400',
    },
    'theme-azure': {
        isDark: true,
        pageBg: 'bg-slate-950 text-white',
        cardBg: 'rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl',
        accent: 'text-sky-400',
        accentBg: 'bg-sky-500 text-white',
        headingFont: "style={{ fontFamily: 'var(--font-heading)' }}",
        bodyFont: '',
        sectionBg: 'bg-white/[0.02]',
        border: 'border-white/10',
        inputCls: 'bg-slate-900/50 border border-white/10 rounded-xl text-white focus:border-sky-500/50 focus:ring-sky-500/50',
        btnPrimary: 'bg-sky-500 text-white rounded-xl hover:bg-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)]',
        btnSecondary: 'border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-sky-400/30',
        gradientText: 'text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500',
        link: 'text-sky-400 hover:text-sky-300',
        muted: 'text-gray-400',
        tag: 'bg-white/5 border border-white/10 rounded-full text-gray-400',
    },
};

/**
 * Returns theme-specific class sets.
 * @param {string} theme - Active theme key (e.g. 'theme-luminous')
 * @returns {object} Class sets for the given theme
 */
export function getThemeClasses(theme) {
    return THEME_MAPS[theme] || THEME_MAPS['theme-luminous'];
}

/**
 * Returns 404-page specific theme classes.
 * @param {string} theme - Active theme key
 */
export function get404Classes(theme) {
    const t = getThemeClasses(theme);
    return {
        ...t,
        numberGradient: theme === 'theme-brutalist'
            ? 'text-foreground'
            : theme === 'theme-editorial'
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-red-500'
                : theme === 'theme-saas'
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600'
                    : theme === 'theme-azure'
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500'
                        : 'text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400',
    };
}

/* ───────────────────────────────────────────────
 *  DASHBOARD THEME SYSTEM
 *  Returns complete class tokens for dashboard layouts
 *  and content pages across all 5 themes.
 * ─────────────────────────────────────────────── */

const DASHBOARD_THEMES = {
    'theme-brutalist': {
        isDark: false,
        // Core text/accent/border tokens
        text: 'text-[#1A1A1A]',
        accent: 'text-[#1A1A1A]',
        border: 'border-[#1A1A1A]',
        // Shell
        shell: 'min-h-screen bg-[#F5F5F0] text-[#1A1A1A] font-sans flex',
        bgTexture: false,
        // Sidebar
        sidebar: 'w-64 fixed h-full z-30 hidden lg:flex flex-col border-r-4 border-[#1A1A1A] bg-white',
        sidebarLogo: 'h-20 flex items-center px-5 border-b-4 border-[#1A1A1A]',
        sidebarNav: 'flex-1 py-4 px-3 space-y-0.5 overflow-y-auto',
        sidebarSection: 'pt-6 pb-2 px-3 text-[10px] font-black text-[#1A1A1A] uppercase tracking-[0.2em] border-t-2 border-[#1A1A1A] mt-4',
        sidebarProfile: 'p-4 border-t-4 border-[#1A1A1A] bg-[#F5F5F0]',
        navActive: 'flex items-center gap-3 px-3 py-2.5 bg-[#1A1A1A] text-white font-black uppercase text-sm tracking-wider transition-all shadow-[3px_3px_0px_0px_var(--color-primary)]',
        navInactive: 'flex items-center gap-3 px-3 py-2.5 text-[#1A1A1A] font-bold uppercase text-sm tracking-wider hover:bg-[#1A1A1A] hover:text-white transition-all border-2 border-transparent hover:border-[#1A1A1A]',
        navIconActive: 'text-white',
        navIconInactive: 'text-[#1A1A1A]',
        // Topbar
        topbar: 'h-16 border-b-4 border-[#1A1A1A] bg-white sticky top-0 z-20 px-4 lg:px-6 flex items-center justify-between',
        breadcrumb: 'text-sm font-bold uppercase tracking-wider text-gray-500',
        breadcrumbActive: 'text-[#1A1A1A] font-black',
        // Balance
        balanceCard: 'flex items-center gap-3 px-4 py-2 bg-[#F5F5F0] border-2 border-[#1A1A1A] hover:shadow-[3px_3px_0px_0px_var(--color-primary)] transition-all cursor-pointer',
        balanceLabel: 'text-[10px] font-black uppercase tracking-wider text-gray-500',
        balanceValue: 'text-base font-black text-[#1A1A1A] font-mono',
        balanceIcon: 'w-9 h-9 bg-[#1A1A1A] flex items-center justify-center text-white',
        notifBtn: 'relative p-2 text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white border-2 border-transparent hover:border-[#1A1A1A] transition-all',
        notifDot: 'absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 border-2 border-white',
        // Content
        mainPadding: 'flex-1 p-4 lg:p-6',
        // Cards & Content
        card: 'bg-white border-2 border-[#1A1A1A] p-6 shadow-[4px_4px_0px_0px_#1A1A1A]',
        cardHover: 'hover:shadow-[6px_6px_0px_0px_var(--color-primary)] hover:-translate-y-0.5 transition-all',
        heading: 'text-2xl font-black uppercase tracking-tight text-[#1A1A1A]',
        subheading: 'text-sm font-bold uppercase tracking-wider text-gray-500',
        tableHead: 'border-b-2 border-[#1A1A1A]',
        tableHeadCell: 'py-3 px-2 text-[10px] font-black uppercase tracking-wider text-[#1A1A1A]',
        tableRow: 'border-b border-gray-300 hover:bg-[#F5F5F0] transition-colors',
        tableCell: 'py-3 px-2 text-sm font-medium text-[#1A1A1A]',
        tableCellAccent: 'py-3 px-2 text-sm font-black',
        // Buttons
        btnPrimary: 'px-4 py-2 bg-[#1A1A1A] text-white font-black uppercase text-sm tracking-wider border-2 border-[#1A1A1A] hover:bg-primary hover:border-primary transition-all shadow-[3px_3px_0px_0px_var(--color-primary)]',
        btnSecondary: 'px-4 py-2 bg-white text-[#1A1A1A] font-bold text-sm border-2 border-[#1A1A1A] hover:bg-[#F5F5F0] transition-all',
        // Avatar
        avatarBg: 'bg-[#1A1A1A] text-white font-black',
        avatarName: 'text-sm font-black text-[#1A1A1A]',
        avatarSub: 'text-[10px] font-bold text-gray-500 uppercase tracking-wider',
        logoutBtn: 'text-gray-400 hover:text-red-600 transition-colors',
        // Chart
        chartColors: { primary: '#1A1A1A', secondary: '#888', accent: 'var(--color-primary)' },
        // Stats
        statIcon: (color) => `w-12 h-12 border-2 border-[#1A1A1A] flex items-center justify-center bg-[#F5F5F0] shadow-[2px_2px_0px_0px_#1A1A1A]`,
        statIconColor: () => 'text-[#1A1A1A]',
        statValue: 'text-3xl font-black text-[#1A1A1A]',
        statTitle: 'text-xs font-bold uppercase tracking-wider text-gray-500',
        statChange: (positive) => `px-2 py-0.5 text-xs font-black uppercase ${positive ? 'bg-green-100 text-green-800 border border-green-800' : 'bg-red-100 text-red-800 border border-red-800'}`,
        // Loader
        loaderColor: 'text-[#1A1A1A]',
        loaderText: 'text-gray-500 font-bold uppercase text-sm tracking-wider',
        tableWrapper: 'bg-white border-2 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] overflow-hidden',
        searchInput: 'w-full pl-10 pr-4 py-2 bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] placeholder-gray-500 focus:outline-[#1A1A1A] focus:ring-0 rounded-none transition-all',
        searchIcon: 'text-gray-500',
        tableFooter: 'px-6 py-3 border-t-2 border-[#1A1A1A] text-[#1A1A1A] font-black uppercase text-[10px] tracking-wider bg-gray-50',
        inputCls: 'w-full px-4 py-3 bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] placeholder-gray-500 focus:outline-[#1A1A1A] focus:ring-0 rounded-none transition-all',
        labelCls: 'block text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A1A] mb-2',
    },
    'theme-saas': {
        isDark: true,
        text: 'text-white',
        accent: 'text-white',
        border: 'border-white/[0.08]',
        shell: 'min-h-screen bg-[#09090B] text-white flex',
        bgTexture: false,
        sidebar: 'w-64 fixed h-full z-30 hidden lg:flex flex-col border-r border-white/[0.08] bg-[#09090B]',
        sidebarLogo: 'h-16 flex items-center px-5 border-b border-white/[0.08]',
        sidebarNav: 'flex-1 py-4 px-3 space-y-0.5 overflow-y-auto',
        sidebarSection: 'pt-6 pb-2 px-3 text-[11px] font-medium text-gray-600 uppercase tracking-widest',
        sidebarProfile: 'p-4 border-t border-white/[0.08]',
        navActive: 'flex items-center gap-3 px-3 py-2 bg-white/[0.08] text-white font-medium text-sm rounded-lg transition-all',
        navInactive: 'flex items-center gap-3 px-3 py-2 text-gray-500 font-medium text-sm rounded-lg hover:text-white hover:bg-white/[0.04] transition-all',
        navIconActive: 'text-white',
        navIconInactive: 'text-gray-600',
        topbar: 'h-16 border-b border-white/[0.08] bg-[#09090B]/80 backdrop-blur-sm sticky top-0 z-20 px-4 lg:px-6 flex items-center justify-between',
        breadcrumb: 'text-sm text-gray-600',
        breadcrumbActive: 'text-white',
        balanceCard: 'flex items-center gap-3 px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg hover:bg-white/[0.06] transition-all cursor-pointer',
        balanceLabel: 'text-[11px] text-gray-500',
        balanceValue: 'text-base font-semibold text-white font-mono',
        balanceIcon: 'w-9 h-9 bg-white/[0.06] rounded-lg flex items-center justify-center text-gray-400',
        notifBtn: 'relative p-2 text-gray-500 hover:text-white transition-colors',
        notifDot: 'absolute top-1.5 right-1.5 w-2 h-2 bg-white rounded-full',
        mainPadding: 'flex-1 p-4 lg:p-8',
        card: 'bg-white/[0.02] border border-white/[0.08] rounded-xl p-6',
        cardHover: 'hover:border-white/[0.15] transition-all',
        heading: 'text-2xl font-semibold text-white tracking-tight',
        subheading: 'text-sm text-gray-500',
        tableHead: 'border-b border-white/[0.08]',
        tableHeadCell: 'py-3 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider',
        tableRow: 'border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors',
        tableCell: 'py-3 px-2 text-sm text-gray-400',
        tableCellAccent: 'py-3 px-2 text-sm font-medium text-white',
        btnPrimary: 'px-4 py-2 bg-white text-[#09090B] font-medium text-sm rounded-lg hover:bg-gray-200 transition-all',
        btnSecondary: 'px-4 py-2 bg-transparent text-gray-400 text-sm border border-white/[0.08] rounded-lg hover:text-white hover:bg-white/[0.04] transition-all',
        avatarBg: 'bg-white/[0.1] text-white font-medium',
        avatarName: 'text-sm font-medium text-white',
        avatarSub: 'text-xs text-gray-600',
        logoutBtn: 'text-gray-600 hover:text-red-400 transition-colors',
        chartColors: { primary: '#ffffff', secondary: '#555', accent: '#888' },
        statIcon: () => `w-10 h-10 bg-white/[0.06] border border-white/[0.08] rounded-lg flex items-center justify-center`,
        statIconColor: () => 'text-gray-400',
        statValue: 'text-3xl font-semibold text-white',
        statTitle: 'text-sm text-gray-500',
        statChange: (positive) => `px-2 py-0.5 text-xs font-medium rounded ${positive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`,
        loaderColor: 'text-white',
        loaderText: 'text-gray-600 text-sm',
        tableWrapper: 'bg-white/[0.02] border border-white/[0.08] rounded-xl overflow-hidden',
        searchInput: 'w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all',
        searchIcon: 'text-gray-400',
        tableFooter: 'px-6 py-3 border-t border-white/[0.08] text-xs text-gray-500',
        inputCls: 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all',
        labelCls: 'block text-sm font-medium text-gray-300 mb-2',
    },
    'theme-editorial': {
        isDark: false,
        text: 'text-[#1A1A1A]',
        accent: 'text-red-700',
        border: 'border-gray-300',
        shell: 'min-h-screen bg-[#FBF9F6] text-[#1A1A1A] flex',
        bgTexture: false,
        sidebar: 'w-64 fixed h-full z-30 hidden lg:flex flex-col border-r border-gray-300 bg-white',
        sidebarLogo: 'h-20 flex items-center justify-center px-5 border-b border-gray-300',
        sidebarNav: 'flex-1 py-4 px-3 space-y-0.5 overflow-y-auto',
        sidebarSection: 'pt-6 pb-2 px-3 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] border-t border-gray-200 mt-4',
        sidebarProfile: 'p-4 border-t border-gray-300 bg-[#FBF9F6]',
        navActive: 'flex items-center gap-3 px-3 py-2.5 bg-[#1A1A1A] text-white font-semibold text-sm rounded transition-all',
        navInactive: 'flex items-center gap-3 px-3 py-2.5 text-gray-500 font-medium text-sm rounded hover:text-[#1A1A1A] hover:bg-[#FBF9F6] transition-all',
        navIconActive: 'text-white',
        navIconInactive: 'text-gray-400 group-hover:text-red-700',
        topbar: 'h-16 border-b border-gray-300 bg-white/90 backdrop-blur-sm sticky top-0 z-20 px-4 lg:px-6 flex items-center justify-between',
        breadcrumb: 'text-sm text-gray-400',
        breadcrumbActive: 'text-[#1A1A1A] font-semibold',
        balanceCard: 'flex items-center gap-3 px-4 py-2 bg-[#FBF9F6] border border-gray-300 rounded hover:border-red-700 transition-all cursor-pointer',
        balanceLabel: 'text-[10px] font-bold text-gray-400 uppercase tracking-wider',
        balanceValue: 'text-base font-bold text-[#1A1A1A] font-mono',
        balanceIcon: 'w-9 h-9 bg-red-700 rounded flex items-center justify-center text-white',
        notifBtn: 'relative p-2 text-gray-400 hover:text-[#1A1A1A] transition-colors',
        notifDot: 'absolute top-1 right-1 w-2.5 h-2.5 bg-red-700 rounded-full border-2 border-white',
        mainPadding: 'flex-1 p-4 lg:p-8',
        card: 'bg-white border border-gray-200 rounded-lg p-6 shadow-sm',
        cardHover: 'hover:shadow-md hover:border-gray-300 transition-all',
        heading: 'text-2xl font-bold text-[#1A1A1A] tracking-tight',
        subheading: 'text-sm text-gray-500',
        tableHead: 'border-b-2 border-gray-300',
        tableHeadCell: 'py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider',
        tableRow: 'border-b border-gray-200 hover:bg-[#FBF9F6] transition-colors',
        tableCell: 'py-3 px-2 text-sm text-gray-600',
        tableCellAccent: 'py-3 px-2 text-sm font-semibold text-[#1A1A1A]',
        btnPrimary: 'px-4 py-2 bg-[#1A1A1A] text-white font-semibold text-sm rounded hover:bg-red-700 transition-all',
        btnSecondary: 'px-4 py-2 bg-white text-gray-600 text-sm border border-gray-300 rounded hover:border-red-700 hover:text-red-700 transition-all',
        avatarBg: 'bg-red-700 text-white font-bold',
        avatarName: 'text-sm font-semibold text-[#1A1A1A]',
        avatarSub: 'text-xs text-gray-400',
        logoutBtn: 'text-gray-400 hover:text-red-700 transition-colors',
        chartColors: { primary: '#B91C1C', secondary: '#D1D5DB', accent: '#1A1A1A' },
        statIcon: () => `w-11 h-11 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center`,
        statIconColor: () => 'text-red-700',
        statValue: 'text-3xl font-bold text-[#1A1A1A]',
        statTitle: 'text-sm text-gray-500',
        statChange: (positive) => `px-2 py-0.5 text-xs font-semibold rounded ${positive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`,
        loaderColor: 'text-red-700',
        loaderText: 'text-gray-500 text-sm',
        tableWrapper: 'bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm',
        searchInput: 'w-full pl-10 pr-4 py-2 bg-[#FBF9F6] border border-gray-300 rounded text-[#1A1A1A] placeholder-gray-500 focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 transition-all',
        searchIcon: 'text-gray-400',
        tableFooter: 'px-6 py-3 border-t border-gray-200 text-xs text-gray-500 font-medium',
        inputCls: 'w-full px-4 py-3 bg-[#FBF9F6] border border-gray-300 rounded text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-red-700 focus:ring-1 focus:ring-red-700 transition-all',
        labelCls: 'block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2',
    },
    'theme-luminous': {
        isDark: true,
        text: 'text-white',
        accent: 'text-lime-400',
        border: 'border-white/10',
        shell: 'min-h-screen bg-slate-950 text-white font-sans flex',
        bgTexture: true,
        sidebar: 'w-64 fixed h-full z-30 hidden lg:flex flex-col border-r border-white/10 bg-slate-900/50 backdrop-blur-xl',
        sidebarLogo: 'h-20 flex items-center px-6 border-b border-white/5',
        sidebarNav: 'flex-1 py-6 px-3 space-y-1 overflow-y-auto',
        sidebarSection: 'pt-6 pb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider',
        sidebarProfile: 'p-4 border-t border-white/5 bg-white/5',
        navActive: 'flex items-center gap-3 px-3 py-2.5 rounded-xl bg-lime-400 text-slate-900 font-bold shadow-[0_0_15px_rgba(163,255,51,0.2)] transition-all',
        navInactive: 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all',
        navIconActive: 'text-slate-900',
        navIconInactive: 'text-gray-400 group-hover:text-lime-400',
        topbar: 'h-20 border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-20 px-4 lg:px-8 flex items-center justify-between',
        breadcrumb: 'text-sm text-gray-400',
        breadcrumbActive: 'text-white',
        balanceCard: 'flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-xl border border-white/10 hover:border-lime-400/30 transition-colors cursor-pointer group',
        balanceLabel: 'text-xs text-gray-400 group-hover:text-lime-400 transition-colors',
        balanceValue: 'text-lg font-bold text-white font-mono',
        balanceIcon: 'w-10 h-10 rounded-lg bg-lime-400/10 flex items-center justify-center group-hover:bg-lime-400/20 transition-colors text-lime-400',
        notifBtn: 'relative p-2 text-gray-400 hover:text-white transition-colors',
        notifDot: 'absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900',
        mainPadding: 'flex-1 p-4 lg:p-8',
        card: 'glass-premium p-6 rounded-3xl',
        cardHover: 'hover:border-white/20 transition-all',
        heading: 'text-3xl font-bold text-white',
        subheading: 'text-gray-400',
        tableHead: 'border-b border-white/10',
        tableHeadCell: 'py-3 px-2 text-sm font-medium text-gray-400',
        tableRow: 'border-b border-white/5 hover:bg-white/5 transition-colors',
        tableCell: 'py-3 px-2 text-sm text-gray-300',
        tableCellAccent: 'py-3 px-2 text-sm font-medium text-lime-400',
        btnPrimary: 'flex items-center gap-2 px-4 py-2 bg-lime-400 hover:bg-lime-500 rounded-xl text-black font-medium transition-all',
        btnSecondary: 'flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all',
        avatarBg: 'bg-gradient-to-br from-lime-400 to-emerald-600 text-slate-900 font-bold',
        avatarName: 'text-sm font-medium text-white',
        avatarSub: 'text-xs text-gray-400',
        logoutBtn: 'text-gray-400 hover:text-red-400 transition-colors',
        chartColors: { primary: '#a3ff33', secondary: '#38bdf8', accent: '#f472b6' },
        statIcon: (color) => {
            const map = { lime: 'bg-lime-400/10 shadow-[0_0_20px_rgba(163,255,51,0.2)]', sky: 'bg-sky-500/10 shadow-[0_0_20px_rgba(14,165,233,0.2)]', purple: 'bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]', orange: 'bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.2)]', emerald: 'bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]' };
            return `w-12 h-12 rounded-xl flex items-center justify-center ${map[color] || map.lime}`;
        },
        statIconColor: (color) => {
            const map = { lime: 'text-lime-400', sky: 'text-sky-400', purple: 'text-purple-400', orange: 'text-orange-400', emerald: 'text-emerald-400' };
            return map[color] || map.lime;
        },
        statValue: 'text-3xl font-bold text-white',
        statTitle: 'text-sm text-gray-400',
        statChange: (positive) => `px-2 py-1 rounded-lg text-xs font-medium ${positive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`,
        loaderColor: 'text-lime-400',
        loaderText: 'text-gray-400',
        tableWrapper: 'glass-premium rounded-3xl border border-white/10 overflow-hidden',
        searchInput: 'w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/50 transition-all',
        searchIcon: 'text-gray-400',
        tableFooter: 'px-6 py-3 border-t border-white/10 text-sm text-gray-500',
        inputCls: 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/50 transition-all',
        labelCls: 'block text-sm font-medium text-gray-300 mb-2',
    },
    'theme-azure': {
        isDark: true,
        text: 'text-white',
        accent: 'text-sky-400',
        border: 'border-white/10',
        shell: 'min-h-screen bg-slate-950 text-white font-sans flex',
        bgTexture: true,
        sidebar: 'w-64 fixed h-full z-30 hidden lg:flex flex-col border-r border-white/10 bg-slate-900/50 backdrop-blur-xl',
        sidebarLogo: 'h-20 flex items-center px-6 border-b border-white/5',
        sidebarNav: 'flex-1 py-6 px-3 space-y-1 overflow-y-auto',
        sidebarSection: 'pt-6 pb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider',
        sidebarProfile: 'p-4 border-t border-white/5 bg-white/5',
        navActive: 'flex items-center gap-3 px-3 py-2.5 rounded-xl bg-sky-500 text-white font-bold shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all',
        navInactive: 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all',
        navIconActive: 'text-white',
        navIconInactive: 'text-gray-400 group-hover:text-sky-400',
        topbar: 'h-20 border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-20 px-4 lg:px-8 flex items-center justify-between',
        breadcrumb: 'text-sm text-gray-400',
        breadcrumbActive: 'text-white',
        balanceCard: 'flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-xl border border-white/10 hover:border-sky-400/30 transition-colors cursor-pointer group',
        balanceLabel: 'text-xs text-gray-400 group-hover:text-sky-400 transition-colors',
        balanceValue: 'text-lg font-bold text-white font-mono',
        balanceIcon: 'w-10 h-10 rounded-lg bg-sky-400/10 flex items-center justify-center group-hover:bg-sky-400/20 transition-colors text-sky-400',
        notifBtn: 'relative p-2 text-gray-400 hover:text-white transition-colors',
        notifDot: 'absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900',
        mainPadding: 'flex-1 p-4 lg:p-8',
        card: 'glass-premium p-6 rounded-3xl',
        cardHover: 'hover:border-white/20 transition-all',
        heading: 'text-3xl font-bold text-white',
        subheading: 'text-gray-400',
        tableHead: 'border-b border-white/10',
        tableHeadCell: 'py-3 px-2 text-sm font-medium text-gray-400',
        tableRow: 'border-b border-white/5 hover:bg-white/5 transition-colors',
        tableCell: 'py-3 px-2 text-sm text-gray-300',
        tableCellAccent: 'py-3 px-2 text-sm font-medium text-sky-400',
        btnPrimary: 'flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 rounded-xl text-white font-medium transition-all shadow-[0_0_15px_rgba(14,165,233,0.2)]',
        btnSecondary: 'flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all',
        avatarBg: 'bg-gradient-to-br from-sky-400 to-blue-600 text-white font-bold',
        avatarName: 'text-sm font-medium text-white',
        avatarSub: 'text-xs text-gray-400',
        logoutBtn: 'text-gray-400 hover:text-red-400 transition-colors',
        chartColors: { primary: '#38bdf8', secondary: '#a3ff33', accent: '#f472b6' },
        statIcon: (color) => {
            const map = { sky: 'bg-sky-500/10 shadow-[0_0_20px_rgba(14,165,233,0.2)]', lime: 'bg-lime-400/10 shadow-[0_0_20px_rgba(163,255,51,0.2)]', purple: 'bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]', orange: 'bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.2)]', emerald: 'bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]' };
            return `w-12 h-12 rounded-xl flex items-center justify-center ${map[color] || map.sky}`;
        },
        statIconColor: (color) => {
            const map = { sky: 'text-sky-400', lime: 'text-lime-400', purple: 'text-purple-400', orange: 'text-orange-400', emerald: 'text-emerald-400' };
            return map[color] || map.sky;
        },
        statValue: 'text-3xl font-bold text-white',
        statTitle: 'text-sm text-gray-400',
        statChange: (positive) => `px-2 py-1 rounded-lg text-xs font-medium ${positive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`,
        loaderColor: 'text-sky-400',
        loaderText: 'text-gray-400',
        tableWrapper: 'glass-premium rounded-3xl border border-white/10 overflow-hidden',
        searchInput: 'w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/50 transition-all',
        searchIcon: 'text-gray-400',
        tableFooter: 'px-6 py-3 border-t border-white/10 text-sm text-gray-500',
        inputCls: 'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/50 transition-all',
        labelCls: 'block text-sm font-medium text-gray-300 mb-2',
    },
};

/**
 * Returns dashboard-specific theme tokens.
 * @param {string} theme - Active theme key (e.g. 'theme-luminous')
 * @returns {object} Full dashboard token set
 */
export function getDashboardTheme(theme) {
    return DASHBOARD_THEMES[theme] || DASHBOARD_THEMES['theme-luminous'];
}

