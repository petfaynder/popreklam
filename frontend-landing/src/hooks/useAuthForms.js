'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAPI } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Shared login form logic with role toggle (publisher/advertiser).
 * Handles 2FA challenge: if backend returns requiresTwoFactor, exposes
 * twoFAState so the UI can render the OTP input step.
 */
export function useLoginForm() {
    const router = useRouter();
    const [role, setRole] = useState('publisher');
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [recaptchaToken, setRecaptchaToken] = useState(null);

    // ── 2FA state ──────────────────────────────────────────────────────────────
    const [twoFARequired, setTwoFARequired] = useState(false); // show OTP screen?
    const [twoFAUserId, setTwoFAUserId] = useState(null);       // userId for verify endpoint
    const [twoFAToken, setTwoFAToken] = useState('');           // 6-digit input

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    // Step 1: Normal login — may get 2FA challenge
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await authAPI.login(formData.email, formData.password, role.toUpperCase(), recaptchaToken);

            // ── 2FA Required ───────────────────────────────────────────────────
            if (data.requiresTwoFactor) {
                setTwoFARequired(true);
                setTwoFAUserId(data.userId);
                setLoading(false);
                return;
            }

            // ── Normal login success ───────────────────────────────────────────
            _redirectByRole(data.user.role);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify the 2FA OTP code
    const handleTwoFA = async () => {
        if (twoFAToken.length !== 6) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/auth/2fa/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: twoFAToken, userId: twoFAUserId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Invalid code');

            // Store auth data and redirect
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            _redirectByRole(data.user.role);
        } catch (err) {
            setError(err.message);
            setTwoFAToken('');
        } finally {
            setLoading(false);
        }
    };

    // Cancel 2FA — go back to password form
    const cancelTwoFA = () => {
        setTwoFARequired(false);
        setTwoFAUserId(null);
        setTwoFAToken('');
        setError('');
    };

    function _redirectByRole(role) {
        if (role === 'PUBLISHER') router.push('/publisher');
        else if (role === 'ADVERTISER') router.push('/advertiser');
        else if (role === 'ADMIN') router.push('/admin');
        else router.push('/');
    }

    return {
        role, setRole,
        formData, loading, error,
        handleChange, handleSubmit, setRecaptchaToken,
        // 2FA
        twoFARequired, twoFAToken, setTwoFAToken,
        handleTwoFA, cancelTwoFA,
    };
}

/**
 * Shared register form logic with role toggle.
 */
export function useRegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [role, setRole] = useState('publisher');
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '', companyName: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [recaptchaToken, setRecaptchaToken] = useState(null);

    useEffect(() => {
        const ref = searchParams?.get('ref');
        if (ref) setReferralCode(ref);
    }, [searchParams]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
                throw new Error('Please fill in all required fields.');
            }

            const data = await authAPI.register(
                formData.email, formData.password, role.toUpperCase(), formData.companyName, referralCode, recaptchaToken
            );

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            if (data.user.role === 'PUBLISHER') router.push('/publisher');
            else router.push('/advertiser');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { role, setRole, formData, loading, error, handleChange, handleSubmit, referralCode, setRecaptchaToken };
}

/**
 * Shared forgot password form logic — calls real API.
 */
export function useForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authAPI.forgotPassword(email, recaptchaToken);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return { email, setEmail, loading, error, success, handleSubmit, setRecaptchaToken };
}

/**
 * Shared reset password form logic — calls real API.
 */
export function useResetPasswordForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e, token) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError('');

        try {
            await authAPI.resetPassword(token, formData.password);
            setSuccess(true);
            setTimeout(() => router.push('/login'), 2000);
        } catch (err) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return { formData, loading, error, success, handleChange, handleSubmit };
}
