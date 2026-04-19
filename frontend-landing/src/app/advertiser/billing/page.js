'use client';

import { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Loader2, Plus, FileText, CheckCircle2, AlertCircle, ShieldCheck, Bitcoin, CreditCard, Globe, X } from 'lucide-react';
import { advertiserAPI } from '@/lib/api';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';
import { useSearchParams, useRouter } from 'next/navigation';

const GATEWAYS = [
    {
        id: 'DODO',
        label: 'Credit Card',
        sublabel: 'Visa, Mastercard',
        icon: CreditCard,
        color: 'text-violet-400',
        bg: 'bg-violet-500/10',
        accent: 'border-violet-400 bg-violet-400/5',
    },
    {
        id: 'OXAPAY',
        label: 'Crypto',
        sublabel: 'BTC, ETH, USDT+',
        icon: Bitcoin,
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        accent: 'border-orange-400 bg-orange-400/5',
    },
    {
        id: 'VOLET',
        label: 'Volet.com',
        sublabel: 'Crypto & Fiat Wallet',
        icon: Globe,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        accent: 'border-blue-400 bg-blue-400/5',
    },
];

export default function AdvertiserBilling() {
    const theme = useTheme();
    const d = getDashboardTheme(theme);
    const searchParams = useSearchParams();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        balance: 0,
        stats: { totalSpent: 0, totalDeposit: 0 },
        settings: { autoRecharge: false },
        transactions: [],
        paymentMethods: [],
    });

    const [depositModal, setDepositModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState('100');
    const [selectedMethod, setSelectedMethod] = useState('DODO');
    const [depositing, setDepositing] = useState(false);

    const [couponCode, setCouponCode] = useState('');
    const [couponResult, setCouponResult] = useState(null); // { valid, bonusAmount, code, error }
    const [couponChecking, setCouponChecking] = useState(false);

    const [invoices, setInvoices] = useState([]);
    const [loadingInvoices, setLoadingInvoices] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [billingToast, setBillingToast] = useState({ type: '', msg: '' });

    const showBillingToast = (type, msg) => {
        setBillingToast({ type, msg });
        setTimeout(() => setBillingToast({ type: '', msg: '' }), 5000);
    };

    useEffect(() => {
        fetchData();
        if (searchParams.get('success') === 'true') {
            setShowSuccess(true);
            const paymentId = searchParams.get('payment_id');
            const isMock = searchParams.get('mock') === '1';

            // For real gateway returns (not mock), verify with backend to update balance
            if (paymentId && !isMock) {
                const token = localStorage.getItem('token');
                fetch(`/api/advertiser/billing/verify/${paymentId}`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                })
                    .then(r => r.json())
                    .then(result => {
                        if (result.status === 'COMPLETED') {
                            // Balance updated — refresh billing data
                            fetchData();
                        }
                    })
                    .catch(console.error);
            }

            setTimeout(() => {
                setShowSuccess(false);
                router.replace('/advertiser/billing');
            }, 5000);
        }
    }, [searchParams]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const billingData = await advertiserAPI.getBilling();
            setData(billingData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchInvoices = async () => {
        try {
            setLoadingInvoices(true);
            const res = await advertiserAPI.getInvoices();
            setInvoices(res.invoices);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingInvoices(false);
        }
    };

    const handleInvoiceDownload = async (invoiceId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/advertiser/billing/invoices/${invoiceId}/download`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to load invoice');
            const html = await response.text();
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const win = window.open(url, '_blank');
            if (win) win.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
        } catch (err) {
            console.error('Invoice download error:', err);
            showBillingToast('error', 'Failed to open invoice. Please try again.');
        }
    };

    const handleCouponApply = async () => {
        if (!couponCode.trim()) return;
        setCouponChecking(true);
        setCouponResult(null);
        try {
            const token = localStorage.getItem('token');
            const r = await fetch('/api/advertiser/billing/validate-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ code: couponCode, amount: depositAmount }),
            });
            const data = await r.json();
            if (!r.ok) {
                setCouponResult({ valid: false, error: data.error || 'Invalid code' });
            } else {
                setCouponResult({ valid: true, ...data });
            }
        } catch (err) {
            setCouponResult({ valid: false, error: 'Network error' });
        } finally {
            setCouponChecking(false);
        }
    };

    const closeDepositModal = () => {
        setDepositModal(false);
        setCouponCode('');
        setCouponResult(null);
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        try {
            setDepositing(true);
            const response = await fetch('/api/advertiser/billing/deposit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    amount: depositAmount,
                    methodType: selectedMethod,
                    ...(couponResult?.valid && { couponCode: couponResult.code }),
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to initiate checkout');

            if (result.checkoutUrl) {
                // Dodo Payments: inline checkout via SDK
                if (selectedMethod === 'DODO') {
                    closeDepositModal();
                    setShowDodoInline(true);
                    setDodoCheckoutUrl(result.checkoutUrl);
                } else {
                    // OxaPay & Volet: redirect to hosted page
                    window.location.href = result.checkoutUrl;
                }
            } else {
                showBillingToast('success', result.message || 'Deposit successful!');
                closeDepositModal();
                fetchData();
            }
        } catch (err) {
            showBillingToast('error', 'Checkout failed: ' + err.message);
        } finally {
            setDepositing(false);
        }
    };

    // Dodo inline checkout state
    const [showDodoInline, setShowDodoInline] = useState(false);
    const [dodoCheckoutUrl, setDodoCheckoutUrl] = useState('');

    useEffect(() => {
        if (!showDodoInline || !dodoCheckoutUrl) return;

        // Dynamically import Dodo Payments SDK
        import('dodopayments-checkout').then(({ DodoPayments }) => {
            DodoPayments.Initialize({
                mode: process.env.NODE_ENV === 'production' ? 'live' : 'test',
                displayType: 'inline',
                onEvent: (event) => {
                    if (event.event_type === 'payment.succeeded') {
                        setShowDodoInline(false);
                        setShowSuccess(true);
                        fetchData();
                        setTimeout(() => setShowSuccess(false), 5000);
                    }
                },
            });

            DodoPayments.Checkout.open({
                checkoutUrl: dodoCheckoutUrl,
                elementId: 'dodo-checkout-container',
            });
        }).catch(err => {
            console.error('Dodo SDK load error:', err);
            // Fallback to redirect
            window.location.href = dodoCheckoutUrl;
        });
    }, [showDodoInline, dodoCheckoutUrl]);

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className={`w-8 h-8 animate-spin ${d.loaderColor}`} />
            </div>
        );

    const headText = d.isDark ? 'text-white' : 'text-[#1A1A1A]';
    const subText = d.isDark ? 'text-gray-400' : 'text-gray-500';
    const inputCls = `w-full text-center text-4xl font-bold rounded-xl px-4 py-6 focus:outline-none transition-all placeholder-gray-500 ${d.isDark ? 'bg-transparent border-b-2 border-white/20 text-white focus:border-lime-400' : 'bg-transparent border-b-2 border-gray-300 text-[#1A1A1A] focus:border-lime-500'}`;

    return (
        <div className="space-y-6 relative">
            {/* Success Toast */}
            {showSuccess && (
                <div className="absolute top-0 right-0 z-50 animate-slide-in-right bg-lime-500 text-black px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl font-bold">
                    <CheckCircle2 className="w-6 h-6" /> Payment Successful! Your balance has been updated.
                </div>
            )}

            {/* Billing Action Toast */}
            {billingToast.msg && (
                <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border text-sm animate-fade-in ${
                    billingToast.type === 'success'
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                    {billingToast.type === 'success'
                        ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        : <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    }
                    <p className="flex-1">{billingToast.msg}</p>
                    <button onClick={() => setBillingToast({ type: '', msg: '' })}>
                        <X className="w-4 h-4 opacity-60 hover:opacity-100" />
                    </button>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={d.heading}>Capital Management</h1>
                    <p className={d.subheading}>Fund your campaigns and track automated invoices.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setDepositModal(true)}
                        className={`${d.btnPrimary} flex items-center gap-2 group px-8 py-3 text-lg`}
                    >
                        <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" /> Add Funds
                    </button>
                </div>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Available Balance', value: data.balance, icon: Wallet, color: 'text-lime-400', bg: 'bg-lime-500/10' },
                    { label: 'Total Invested', value: data.stats.totalSpent, icon: ArrowUpRight, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Total Funding', value: data.stats.totalDeposit, icon: ArrowDownLeft, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                ].map((stat, i) => (
                    <div key={i} className={`${d.card} overflow-hidden relative group`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <span className={`text-sm font-medium uppercase tracking-widest ${subText}`}>{stat.label}</span>
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                        </div>
                        <div className={`text-4xl font-bold font-mono tracking-tighter ${headText} relative z-10`}>
                            ${stat.value.toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className={`flex items-center gap-4 border-b overflow-x-auto pb-1 ${d.isDark ? 'border-white/10' : 'border-gray-200'}`}>
                {['overview', 'invoices'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); if (tab === 'invoices') fetchInvoices(); }}
                        className={`px-4 py-2 border-b-2 font-medium transition-colors whitespace-nowrap capitalize ${activeTab === tab ? 'border-lime-400 text-lime-400' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                    >
                        {tab === 'overview' ? 'Ledger History' : 'B2B Invoices'}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className={d.card}>
                {activeTab === 'overview' && (
                    data.transactions.length === 0 ? (
                        <div className={`text-center py-12 ${subText}`}>No transactions yet</div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className={`border-b text-left ${d.isDark ? 'border-white/10' : 'border-gray-200'}`}>
                                    <th className={`pb-4 text-sm font-medium ${subText}`}>Date</th>
                                    <th className={`pb-4 text-sm font-medium ${subText}`}>Description</th>
                                    <th className={`pb-4 text-sm font-medium ${subText}`}>Amount</th>
                                    <th className={`pb-4 text-sm font-medium ${subText}`}>Status</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${d.isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                                {data.transactions.map((tx) => (
                                    <tr key={tx.id} className={d.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}>
                                        <td className={`py-4 text-sm font-mono ${d.isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className={`py-4 text-sm ${headText}`}>
                                            {tx.type} via <span className="font-bold">{tx.method}</span>
                                        </td>
                                        <td className={`py-4 text-sm font-mono font-bold ${tx.type === 'DEPOSIT' ? 'text-lime-400' : headText}`}>
                                            {tx.type === 'DEPOSIT' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                                        </td>
                                        <td className="py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${tx.status === 'COMPLETED' ? 'bg-lime-500/10 text-lime-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}

                {activeTab === 'invoices' && (
                    loadingInvoices ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className={`w-8 h-8 animate-spin ${d.loaderColor}`} />
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className={`text-center py-12 ${subText}`}>No invoices found</div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className={`border-b text-left ${d.isDark ? 'border-white/10' : 'border-gray-200'}`}>
                                    <th className={`pb-4 text-sm font-medium ${subText}`}>Invoice #</th>
                                    <th className={`pb-4 text-sm font-medium ${subText}`}>Date</th>
                                    <th className={`pb-4 text-sm font-medium ${subText}`}>Gateway</th>
                                    <th className={`pb-4 text-sm font-medium ${subText}`}>Amount</th>
                                    <th className={`pb-4 text-sm font-medium text-right ${subText}`}>Download</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${d.isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                                {invoices.map((inv) => (
                                    <tr key={inv.id} className={d.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}>
                                        <td className={`py-4 text-sm font-mono font-bold ${headText}`}>{inv.invoiceNo}</td>
                                        <td className={`py-4 text-sm ${subText}`}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                                        <td className={`py-4 text-sm ${subText}`}>{inv.payment?.method || 'N/A'}</td>
                                        <td className="py-4 text-sm font-mono font-bold text-lime-400">
                                            ${parseFloat(inv.total).toFixed(2)}
                                        </td>
                                        <td className="py-4 text-sm text-right">
                                            <button
                                                onClick={() => handleInvoiceDownload(inv.id)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${d.isDark ? 'bg-white/5 hover:bg-lime-400/10 text-gray-400 hover:text-lime-400 border border-white/10 hover:border-lime-400/30' : 'bg-gray-100 hover:bg-lime-50 text-gray-500 hover:text-lime-600 border border-gray-200 hover:border-lime-300'}`}
                                            >
                                                <FileText className="w-3.5 h-3.5" /> PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}
            </div>

            {/* ── Deposit Modal ─────────────────────────────────────────────── */}
            {depositModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className={`absolute inset-0 backdrop-blur-md ${d.isDark ? 'bg-black/70' : 'bg-black/40'}`}
                        onClick={closeDepositModal}
                    />

                    <div className={`relative w-full max-w-lg overflow-hidden shadow-2xl ${
                        d.isDark
                            ? 'bg-slate-900 border border-white/10 rounded-2xl'
                            : 'bg-white border border-gray-200 rounded-2xl'
                    }`}>
                        {/* Header */}
                        <div className={`flex items-center justify-between px-8 pt-7 pb-5 border-b ${
                            d.isDark ? 'border-white/10' : 'border-gray-200'
                        }`}>
                            <h2 className={`text-xl font-bold tracking-tight ${headText}`}>Fund Account</h2>
                            <button
                                onClick={closeDepositModal}
                                className={`p-1.5 rounded-lg transition-all ${
                                    d.isDark
                                        ? 'hover:bg-white/10 text-gray-400'
                                        : 'hover:bg-gray-100 text-gray-500'
                                }`}
                                aria-label="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-8 py-6">
                            <form onSubmit={handleCheckout} className="space-y-6">
                                {/* Amount Input */}
                                <div className="text-center relative">
                                    <span className={`absolute left-0 top-6 text-2xl font-bold ${subText}`}>$</span>
                                    <input
                                        type="number"
                                        min="10"
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(e.target.value)}
                                        className={inputCls}
                                        placeholder="0.00"
                                        required
                                    />
                                    <div className={`mt-2 text-xs uppercase tracking-widest ${subText}`}>
                                        Minimum Deposit: $50.00
                                    </div>
                                </div>

                                {/* Gateway Selection */}
                                <div className="space-y-3">
                                    <div className={`text-xs font-semibold uppercase tracking-widest ${subText}`}>Select Gateway</div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {GATEWAYS.map((gw) => {
                                            const isSelected = selectedMethod === gw.id;
                                            return (
                                                <button
                                                    key={gw.id}
                                                    type="button"
                                                    onClick={() => setSelectedMethod(gw.id)}
                                                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                                                        isSelected
                                                            ? gw.accent
                                                            : d.isDark
                                                                ? 'border-white/10 hover:border-white/20'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <gw.icon className={`w-7 h-7 ${isSelected ? gw.color : subText}`} />
                                                    <span className={`font-bold text-xs text-center leading-tight ${isSelected ? headText : subText}`}>
                                                        {gw.label}
                                                    </span>
                                                    <span className={`text-[10px] text-center ${subText} opacity-70`}>
                                                        {gw.sublabel}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Promo Code */}
                                <div>
                                    <div className={`text-xs font-semibold uppercase tracking-widest mb-2 ${subText}`}>Promo Code (Optional)</div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); }}
                                            placeholder="Enter code..."
                                            className={`flex-1 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none border transition-all ${
                                                couponResult?.valid
                                                    ? 'border-lime-400 bg-lime-400/5 text-lime-300'
                                                    : couponResult?.error
                                                        ? 'border-red-400 bg-red-400/5 text-red-300'
                                                        : d.isDark
                                                            ? 'border-white/10 bg-white/5 text-white'
                                                            : 'border-gray-200 bg-gray-50 text-gray-800'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCouponApply}
                                            disabled={couponChecking || !couponCode.trim()}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all disabled:opacity-50 ${
                                                d.isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                            }`}
                                        >
                                            {couponChecking ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                    {couponResult?.valid && (
                                        <div className="mt-2 flex items-center gap-2 text-xs text-lime-400 font-semibold">
                                            <span>🎁</span>
                                            <span>Valid! You will receive <strong>${couponResult.bonusAmount.toFixed(2)}</strong> bonus balance.</span>
                                        </div>
                                    )}
                                    {couponResult?.error && (
                                        <div className="mt-2 text-xs text-red-400">{couponResult.error}</div>
                                    )}
                                </div>

                                {/* Gateway info pill */}
                                <div className={`text-xs text-center py-2 px-4 rounded-xl ${
                                    d.isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-50 border border-gray-200 text-gray-500'
                                }`}>
                                    {selectedMethod === 'DODO' && '💳 Card checkout opens inline — no redirect'}
                                    {selectedMethod === 'OXAPAY' && '₿ Supports BTC, ETH, USDT (TRC20/ERC20), LTC, and 20+ coins'}
                                    {selectedMethod === 'VOLET' && '🌐 Pay via Volet wallet — supports fiat & crypto'}
                                </div>

                                <button
                                    type="submit"
                                    disabled={depositing}
                                    className={`w-full py-3.5 rounded-xl font-bold text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                                        d.btnPrimary
                                    }`}
                                >
                                    {depositing ? (
                                        <Loader2 className="animate-spin w-5 h-5" />
                                    ) : (
                                        <><ShieldCheck className="w-5 h-5" /> Proceed to Checkout</>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className={`py-3 text-center text-xs font-medium uppercase tracking-widest border-t ${
                            d.isDark ? 'border-white/10 text-gray-600' : 'border-gray-100 text-gray-400'
                        }`}>
                            SSL Secured · 256-bit Encryption · PCI Compliant
                        </div>
                    </div>
                </div>
            )}

            {/* ── Dodo Inline Checkout Overlay ──────────────────────────────── */}
            {showDodoInline && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className={`absolute inset-0 backdrop-blur-md ${d.isDark ? 'bg-black/70' : 'bg-black/40'}`}
                        onClick={() => setShowDodoInline(false)}
                    />

                    <div className={`relative w-full max-w-xl overflow-hidden shadow-2xl ${
                        d.isDark
                            ? 'bg-slate-900 border border-white/10 rounded-2xl'
                            : 'bg-white border border-gray-200 rounded-2xl'
                    }`}>
                        {/* Header */}
                        <div className={`flex items-center justify-between px-6 py-4 border-b ${
                            d.isDark ? 'border-white/10' : 'border-gray-200'
                        }`}>
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-violet-400" />
                                <span className={`font-bold text-sm ${headText}`}>Secure Card Payment</span>
                            </div>
                            <button
                                onClick={() => setShowDodoInline(false)}
                                className={`p-1.5 rounded-lg transition-all ${
                                    d.isDark
                                        ? 'hover:bg-white/10 text-gray-400'
                                        : 'hover:bg-gray-100 text-gray-500'
                                }`}
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Dodo SDK mounts here */}
                        <div id="dodo-checkout-container" className="min-h-[400px] p-4">
                            <div className="flex items-center justify-center h-[400px]">
                                <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className={`py-3 text-center text-xs font-medium uppercase tracking-widest border-t ${
                            d.isDark ? 'border-white/10 text-gray-600' : 'border-gray-100 text-gray-400'
                        }`}>
                            Powered by Dodo Payments · PCI DSS Compliant
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
