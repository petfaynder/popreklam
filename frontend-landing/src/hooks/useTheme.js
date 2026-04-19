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

// ─── Module-level singleton cache ────────────────────────────────────────────
// Ensures only ONE fetch is ever in-flight regardless of how many components
// call useTheme simultaneously, preventing 429 rate-limit storms.
let _fetchPromise = null;
let _cachedTheme = null;

function fetchThemeOnce() {
    if (_fetchPromise) return _fetchPromise; // reuse in-flight request
    _fetchPromise = fetch('/api/auth/public-settings')
        .then(res => res.json())
        .then(data => {
            if (data?.theme) {
                _cachedTheme = data.theme;
                try { localStorage.setItem('site_theme', data.theme); } catch {}
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('themeChange', { detail: data.theme }));
                }
            }
            return _cachedTheme;
        })
        .catch(() => null)
        .finally(() => {
            // Allow a re-fetch after 60 s so theme changes eventually propagate
            setTimeout(() => { _fetchPromise = null; }, 60_000);
        });
    return _fetchPromise;
}
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useTheme hook — reads the global active theme from the backend,
 * using localStorage as the synchronous initial value to prevent FOUC.
 * Uses a module-level singleton to guarantee at most one in-flight request
 * across all mounted consumers.
 *
 * @returns {string} The current theme key (never null).
 */
export default function useTheme() {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        // If we already have a cached result, apply it immediately (no re-fetch)
        if (_cachedTheme && _cachedTheme !== theme) {
            setTheme(_cachedTheme);
        }

        // Fire (or reuse) the singleton fetch
        fetchThemeOnce().then(t => {
            if (t && t !== theme) setTheme(t);
        });

        // Listen for internal theme changes (e.g. if an Admin previews themes)
        const handler = (e) => setTheme(e.detail);
        window.addEventListener('themeChange', handler);
        return () => window.removeEventListener('themeChange', handler);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return theme;
}
