'use client';

import { useState, useEffect } from 'react';
import {
    DollarSign, TrendingUp, Calendar, CreditCard, Loader2,
    Download, CheckCircle2, AlertCircle, X, Wallet,
    ArrowDownToLine, RefreshCw, Landmark, Bitcoin, Paypal
} from 'lucide-react';
import { publisherAPI } from '@/lib/api';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

const PAYMENT_METHODS = [
    { id: 'paypal', label: 'PayPal', icon: '🅿', desc: 'Instant to 1 business day' },
    { id: 'wire', label: 'Wire Transfer', icon: '🏦', desc: '3–5 business days' },
    { id: 'btc', label: 'Bitcoin (BTC)', icon: '₿', desc: '1–24 hours' },
    { id: 'usdt', label: 'USDT (TRC-20)', icon: '₮', desc: '1–24 hours' },
];

function Toast({ type, message, onClose }) {
    if (!message) return null;
    return (
        <div className={`flex items-start gap-3 px-5 py-4 rounded-xl border text-sm ${type === 'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
            {type === 'success'
                ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
            <p className="flex-1">{message}</p>
            <button onClick={onClose}><X className="w-4 h-4 opacity-60 hover:opacity-100" /></button>
        </div>
    );
}

export default function PublisherPayments() {
    const theme = useTheme();
    const d = getDashboardTheme(theme);

    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [withdrawalModal, setWithdrawalModal] = useState(false);
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('paypal');
    const [withdrawing, setWithdrawing] = useState(false);
    const [toast, setToast] = useState({ type: '', msg: '' });
    const [filterType, setFilterType] = useState('ALL');

    useEffect(() => { fetchPaymentData(); }, []);

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast({ type: '', msg: '' }), 5000);
    };

    const fetchPaymentData = async () => {
        try {
            setLoading(true);
            const data = await publisherAPI.getPayments();
            setStats(data.stats || {});
            setTransactions(data.transactions || []);
        } catch (err) {
            console.error('Error fetching payments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdrawal = async () => {
        const amount = parseFloat(withdrawalAmount);
        if (!amount || amount < 50) {
            showToast('error', 'Minimum withdrawal amount is $50.');
            return;
        }
        if (amount > (stats?.balance || 0)) {
            showToast('error', 'Amount exceeds your available balance.');
            return;
        }
        try {
            setWithdrawing(true);
            await publisherAPI.requestWithdrawal(amount, selectedMethod);
            setWithdrawalModal(false);
            setWithdrawalAmount('');
            fetchPaymentData();
            showToast('success', `Withdrawal request of $${amount.toFixed(2)} via ${PAYMENT_METHODS.find(m => m.id === selectedMethod)?.label} submitted successfully!`);
        } catch (err) {
            showToast('error', 'Failed to request withdrawal: ' + err.message);
        } finally {
            setWithdrawing(false);
        }
    };

    const getStatusColor = (status) => {
        const light = !d.isDark;
        switch (status) {
            case 'COMPLETED': return light ? 'bg-green-100 text-green-700' : 'bg-lime-500/20 text-lime-400';
            case 'PENDING': return light ? 'bg-orange-100 text-orange-700' : 'bg-orange-500/20 text-orange-400';
            case 'PROCESSING': return light ? 'bg-sky-100 text-sky-700' : 'bg-sky-500/20 text-sky-400';
            case 'REJECTED': return light ? 'bg-red-100 text-red-700' : 'bg-red-500/20 text-red-400';
            default: return light ? 'bg-gray-100 text-gray-600' : 'bg-gray-500/20 text-gray-400';
        }
    };

    const getAmountColor = (type) => {
        if (!d.isDark) {
            return type === 'EARNING' ? (theme === 'theme-editorial' ? 'text-green-700' : 'text-green-600')
                : type === 'WITHDRAWAL' ? (theme === 'theme-editorial' ? 'text-red-700' : 'text-orange-600')
                    : 'text-gray-600';
        }
        switch (type) {
            case 'EARNING': return 'text-lime-400';
            case 'WITHDRAWAL': return 'text-orange-400';
            case 'WITHDRAWAL_REQUEST': return 'text-sky-400';
            default: return 'text-gray-400';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className={`w-12 h-12 ${d.loaderColor} animate-spin`} />
        </div>
    );

    const headText = d.isDark ? 'text-white' : 'text-[#1A1A1A]';
    const subText = d.isDark ? 'text-gray-400' : 'text-gray-500';
    const divider = d.isDark ? 'divide-white/5' : 'divide-gray-100';

    const accentText = {
        'theme-luminous': 'text-lime-400', 'theme-azure': 'text-sky-400',
        'theme-saas': 'text-white', 'theme-editorial': 'text-red-700', 'theme-brutalist': 'text-[#1A1A1A]',
    }[theme] || 'text-lime-400';

    const inputCls = `w-full px-4 py-3 focus:outline-none transition-all text-sm ${theme === 'theme-brutalist'
            ? 'border-2 border-[#1A1A1A] rounded bg-[#F5F5F0] text-[#1A1A1A]'
            : d.isDark
                ? 'bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-white/30'
                : 'bg-white border border-gray-200 rounded-xl text-[#1A1A1A] placeholder-gray-400 focus:border-gray-400'
        }`;

    const cardAccents = [
        'bg-lime-500/20 text-lime-400',
        'bg-purple-500/20 text-purple-400',
        'bg-orange-500/20 text-orange-400',
    ];
    if (!d.isDark) {
        cardAccents[0] = theme === 'theme-editorial' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200';
        cardAccents[1] = theme === 'theme-editorial' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-purple-50 text-purple-700 border border-purple-200';
        cardAccents[2] = theme === 'theme-editorial' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-orange-50 text-orange-700 border border-orange-200';
    }
    if (theme === 'theme-brutalist') {
        const bru = 'bg-[#F5F5F0] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] text-[#1A1A1A]';
        cardAccents[0] = cardAccents[1] = cardAccents[2] = bru;
    }

    // Filter transactions
    const filteredTx = filterType === 'ALL'
        ? transactions
        : transactions.filter(tx => tx.type === filterType);

    const TX_TYPES = ['ALL', 'EARNING', 'WITHDRAWAL', 'WITHDRAWAL_REQUEST'];

    const tabActive = {
        'theme-luminous': 'bg-lime-400 text-slate-900',
        'theme-azure': 'bg-sky-500 text-white',
        'theme-saas': 'bg-white text-black',
        'theme-editorial': 'bg-[#1A1A1A] text-white',
        'theme-brutalist': 'bg-[#1A1A1A] text-white border-2 border-[#1A1A1A]',
    }[theme] || 'bg-lime-400 text-slate-900';

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className={`${d.heading} mb-1`}>Payments</h1>
                    <p className={d.subheading}>Manage your earnings and withdrawals</p>
                </div>
                <button onClick={fetchPaymentData} className={`${d.btnSecondary} p-2.5`} title="Refresh">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Toast */}
            {toast.msg && <Toast type={toast.type} message={toast.msg} onClose={() => setToast({ type: '', msg: '' })} />}

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Available Balance', value: stats?.balance, icon: DollarSign, action: true, ai: 0 },
                    { label: 'Total Earnings', value: stats?.totalEarnings, icon: TrendingUp, ai: 1 },
                    { label: 'Total Withdrawn', value: stats?.totalWithdrawn, icon: ArrowDownToLine, ai: 2 },
                ].map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={i} className={d.card}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cardAccents[card.ai]}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className={`text-sm ${subText}`}>{card.label}</p>
                                    <p className={`text-2xl font-bold ${headText}`}>${(card.value || 0).toFixed(2)}</p>
                                </div>
                            </div>
                            {card.action && (
                                <button
                                    onClick={() => setWithdrawalModal(true)}
                                    disabled={!stats?.balance || stats.balance < 50}
                                    className={`w-full ${d.btnPrimary} disabled:opacity-40 disabled:cursor-not-allowed`}>
                                    <Wallet className="w-4 h-4 inline mr-2" />
                                    Request Withdrawal
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Payment Info */}
            <div className={d.card}>
                <h3 className={`text-lg font-bold ${headText} mb-5`}>Payment Information</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    {[
                        { label: 'Minimum Withdrawal', value: '$50.00' },
                        { label: 'Processing Time', value: '1–5 business days' },
                        { label: 'Payment Schedule', value: 'On request' },
                        { label: 'Available Methods', value: 'PayPal, Wire, BTC, USDT' },
                    ].map(info => (
                        <div key={info.label} className={`p-3 rounded-xl ${d.isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                            <p className={`${subText} text-xs mb-1`}>{info.label}</p>
                            <p className={`font-semibold text-sm ${headText}`}>{info.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Transaction History */}
            <div className={d.card}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3 className={`text-lg font-bold ${headText}`}>Transaction History</h3>
                    <div className="flex gap-1">
                        {TX_TYPES.map(t => (
                            <button key={t} onClick={() => setFilterType(t)}
                                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${filterType === t ? tabActive : `${subText} ${d.isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}`}>
                                {t === 'WITHDRAWAL_REQUEST' ? 'WD Req.' : t}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredTx.length === 0 ? (
                    <div className="text-center py-12">
                        <CreditCard className={`w-14 h-14 mx-auto mb-4 ${d.isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                        <p className={subText}>No transactions yet</p>
                    </div>
                ) : (
                    <div className={`divide-y ${divider}`}>
                        {filteredTx.map((tx) => (
                            <div key={tx.id} className={`py-4 flex items-center justify-between gap-4 ${d.isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} rounded-xl px-3 -mx-3 transition-all`}>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className={`font-bold text-sm ${getAmountColor(tx.type)}`}>
                                            {tx.type === 'EARNING' ? '+' : tx.type === 'WITHDRAWAL' ? '-' : ''}
                                            ${Math.abs(tx.amount).toFixed(2)}
                                        </p>
                                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getStatusColor(tx.status)}`}>
                                            {tx.status}
                                        </span>
                                    </div>
                                    <p className={`text-xs ${subText} truncate`}>{tx.description || tx.type}</p>
                                </div>
                                <div className={`flex items-center gap-1.5 text-xs flex-shrink-0 ${d.isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                    <Calendar className="w-3 h-3" />
                                    {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Withdrawal Modal */}
            {withdrawalModal && (
                <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 px-4">
                    <div className={`${d.card} max-w-md w-full`}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className={`text-xl font-bold ${headText}`}>Request Withdrawal</h3>
                            <button onClick={() => { setWithdrawalModal(false); setWithdrawalAmount(''); }}
                                className={`p-2 rounded-lg ${d.isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                                <X className={`w-5 h-5 ${subText}`} />
                            </button>
                        </div>

                        {/* Amount */}
                        <div className="mb-5">
                            <label className={`block text-sm font-medium mb-2 ${d.isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Amount (USD)
                            </label>
                            <input
                                type="number"
                                value={withdrawalAmount}
                                onChange={e => setWithdrawalAmount(e.target.value)}
                                placeholder="50.00"
                                min="50"
                                max={stats?.balance || 0}
                                step="0.01"
                                className={inputCls}
                            />
                            <div className="flex justify-between mt-2 text-xs">
                                <span className={subText}>Min: $50.00</span>
                                <span className={subText}>Available: <span className={`font-bold ${accentText}`}>${(stats?.balance || 0).toFixed(2)}</span></span>
                            </div>
                            {/* Quick amounts */}
                            <div className="flex gap-2 mt-3">
                                {[50, 100, 250, stats?.balance].filter(Boolean).map(amt => (
                                    <button key={amt} onClick={() => setWithdrawalAmount(amt.toFixed(2))}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${parseFloat(withdrawalAmount) === parseFloat(amt.toFixed(2))
                                                ? `${accentText} font-bold ${d.isDark ? 'bg-white/10' : 'bg-gray-100'}`
                                                : `${subText} ${d.isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`
                                            }`}>
                                        {amt === stats?.balance ? 'All' : `$${amt}`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="mb-6">
                            <label className={`block text-sm font-medium mb-3 ${d.isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Payment Method
                            </label>
                            <div className="space-y-2">
                                {PAYMENT_METHODS.map(method => (
                                    <button key={method.id} onClick={() => setSelectedMethod(method.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selectedMethod === method.id
                                                ? theme === 'theme-brutalist'
                                                    ? 'bg-[#F5F5F0] border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A]'
                                                    : d.isDark
                                                        ? 'border-white/30 bg-white/10'
                                                        : theme === 'theme-editorial'
                                                            ? 'border-red-700 bg-red-50'
                                                            : 'border-gray-400 bg-gray-50'
                                                : d.isDark
                                                    ? 'border-white/10 bg-white/5 hover:border-white/20'
                                                    : 'border-gray-200 bg-white hover:border-gray-400'
                                            }`}>
                                        <span className="text-xl w-8 text-center">{method.icon}</span>
                                        <div className="flex-1">
                                            <p className={`font-semibold text-sm ${headText}`}>{method.label}</p>
                                            <p className={`text-xs ${subText}`}>{method.desc}</p>
                                        </div>
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedMethod === method.id
                                                ? theme === 'theme-luminous' ? 'border-lime-400 bg-lime-400'
                                                    : theme === 'theme-editorial' ? 'border-red-700 bg-red-700'
                                                        : theme === 'theme-brutalist' ? 'border-[#1A1A1A] bg-[#1A1A1A]'
                                                            : theme === 'theme-azure' ? 'border-sky-400 bg-sky-400'
                                                                : 'border-white bg-white'
                                                : d.isDark ? 'border-white/20' : 'border-gray-300'
                                            }`}>
                                            {selectedMethod === method.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Summary line */}
                        {withdrawalAmount && parseFloat(withdrawalAmount) >= 50 && (
                            <div className={`p-3 rounded-xl mb-4 text-sm ${d.isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                <div className="flex justify-between">
                                    <span className={subText}>You'll receive</span>
                                    <span className={`font-bold ${accentText}`}>${parseFloat(withdrawalAmount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className={subText}>Via</span>
                                    <span className={`font-medium text-xs ${headText}`}>{PAYMENT_METHODS.find(m => m.id === selectedMethod)?.label}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button onClick={() => { setWithdrawalModal(false); setWithdrawalAmount(''); }}
                                className={`flex-1 ${d.btnSecondary}`}>
                                Cancel
                            </button>
                            <button onClick={handleWithdrawal} disabled={withdrawing}
                                className={`flex-1 ${d.btnPrimary} flex items-center justify-center gap-2 disabled:opacity-50`}>
                                {withdrawing
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                    : <><ArrowDownToLine className="w-4 h-4" /> Withdraw</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
