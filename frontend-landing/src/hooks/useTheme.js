'use client';

import { useState, useEffect } from 'react';

/**
 * Synchronously read localStorage to avoid flash of wrong theme.
 * Runs only once at module load time (not on every render).
 */
function getInitialTheme() {
    if (typeof window === 'undefined') return 'theme-brutalist'; // SSR fallback
    try {
        return localStorage.getItem('site_theme') || 'theme-brutalist';
    } catch {
        return 'theme-brutalist';
    }
}

/**
 * useTheme hook — reads the global active theme from the backend,
 * using localStorage as the synchronous initial value to prevent FOUC.
 * 
 * @returns {string} The current theme key (never null).
 */
export default function useTheme() {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        // Fetch global theme from admin settings
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/public-settings`)
            .then(res => res.json())
            .then(data => {
                if (data.theme && data.theme !== theme) {
                    setTheme(data.theme);
                    localStorage.setItem('site_theme', data.theme);
                    window.dispatchEvent(new CustomEvent('themeChange', { detail: data.theme }));
                }
            })
            .catch(() => {
                // Backend unreachable — silently keep the localStorage fallback theme
            });

        // Listen for internal theme changes (e.g. if an Admin previews themes)
        const handler = (e) => setTheme(e.detail);
        window.addEventListener('themeChange', handler);
        return () => window.removeEventListener('themeChange', handler);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return theme;
}
