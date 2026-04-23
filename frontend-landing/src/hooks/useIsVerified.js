import { useState, useEffect } from 'react';

/**
 * Returns whether the currently logged-in user has verified their email.
 * Reads from localStorage (populated on login/register).
 * Defaults to `true` to avoid flashing locked UI for a split second on load.
 */
export default function useIsVerified() {
    const [isVerified, setIsVerified] = useState(true);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('user');
            if (raw) {
                const parsed = JSON.parse(raw);
                // isVerified: false → locked; undefined/true → unlocked
                setIsVerified(parsed.isVerified !== false);
            }
        } catch {
            setIsVerified(true);
        }
    }, []);

    return isVerified;
}
