'use client';

import useTheme from '@/hooks/useTheme';

/**
 * ThemeRouter — renders the correct themed component based on active theme.
 * 
 * @param {Object} props.themes - Map of theme keys to React components:
 *   { brutalist: <Component/>, saas: <Component/>, editorial: <Component/>, luminous: <Component/>, azure: <Component/> }
 * @param {React.ReactNode} [props.fallback] - Loading fallback (optional)
 */
export default function ThemeRouter({ themes, fallback = null }) {
    const theme = useTheme();

    if (!theme) return fallback;

    switch (theme) {
        case 'theme-classic':
            return themes.saas || themes.brutalist;
        case 'theme-neon':
            return themes.editorial || themes.brutalist;
        case 'theme-publisher':
            return themes.luminous || themes.brutalist;
        case 'theme-advertiser':
            return themes.azure || themes.brutalist;
        case 'theme-brutalist':
        default:
            return themes.brutalist;
    }
}
