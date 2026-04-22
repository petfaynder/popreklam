'use client';

import { useState, useEffect } from 'react';
import { Flag, AlertTriangle, CheckCircle, Clock, ChevronDown, Send, Loader2, Info } from 'lucide-react';
import { publisherAPI } from '@/lib/api';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

const REASONS = [
    { value: 'MISLEADING', label: 'Misleading / False Content', desc: 'Ad makes false claims or is deceptive' },
    { value: 'INAPPROPRIATE', label: 'Inappropriate Content', desc: 'Adult or offensive content on non-adult site' },
    { value: 'MALWARE', label: 'Malware / Suspicious Link', desc: 'Ad redirects to phishing or malware sites' },
    { value: 'SPAM', label: 'Spam / Repetitive', desc: 'Same ad showing excessively or spamming users' },
    { value: 'OTHER', label: 'Other', desc: 'Other quality issues' },
];

const STATUS_STYLES = {
    OPEN: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Open' },
    RESOLVED: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Resolved' },
    DISMISSED: { color: 'bg-gray-100 text-gray-500', icon: Info, label: 'Dismissed' },
};

const REASON_LABELS = {
    MISLEADING: 'Misleading Content',
    INAPPROPRIATE: 'Inappropriate',
    MALWARE: 'Malware / Suspicious',
    SPAM: 'Spam',
    OTHER: 'Other',
};

export default function PublisherReportsPage() {
    const theme = useTheme();
    const d = getDashboardTheme(theme);

    const [sites, setSites] = useState([]);
    const [zones, setZones] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [selectedSite, setSelectedSite] = useState('');
    const [selectedZone, setSelectedZone] = useState('');
    const [selectedReason, setSelectedReason] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [sitesData, reportsData] = await Promise.all([
                publisherAPI.getSites(),
                publisherAPI.getMyAdReports(),
            ]);
            const siteList = sitesData?.sites || sitesData || [];
            setSites(siteList);
            setReports(reportsData?.reports || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSiteChange = (siteId) => {
        setSelectedSite(siteId);
        setSelectedZone('');
        const site = sites.find(s => s.id === siteId);
        setZones(site?.zones || []);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedZone || !selectedReason) {
            setError('Please select a zone and a reason.');
            return;
        }
        setError('');
        setSubmitting(true);
        try {
            await publisherAPI.createAdReport({
                zoneId: selectedZone,
                reason: selectedReason,
                description: description.trim() || undefined,
            });
            setSuccess(true);
            setSelectedSite('');
            setSelectedZone('');
            setSelectedReason('');
            setDescription('');
            setZones([]);
            await loadData();
            setTimeout(() => setSuccess(false), 4000);
        } catch (err) {
            setError(err.message || 'Failed to submit report.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                        <Flag className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Report a Bad Ad</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Help us maintain ad quality on your site</p>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                    <strong className="block mb-0.5">How it works</strong>
                    Select the zone where the problematic ad appeared, choose a reason, and optionally describe the issue.
                    Our team will review and take action within 24–48 hours. We'll automatically identify the last campaign that served on your zone.
                </div>
            </div>

            {/* Report Form */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10">
                    <h2 className="font-semibold text-gray-900 dark:text-white">Submit a Report</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Site Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Select Site
                        </label>
                        <div className="relative">
                            <select
                                value={selectedSite}
                                onChange={e => handleSiteChange(e.target.value)}
                                className="w-full appearance-none bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">— Choose a site —</option>
                                {sites.filter(s => s.status === 'ACTIVE').map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.url})</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Zone Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Select Zone (Ad Placement)
                        </label>
                        <div className="relative">
                            <select
                                value={selectedZone}
                                onChange={e => setSelectedZone(e.target.value)}
                                disabled={!selectedSite}
                                className="w-full appearance-none bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                <option value="">— Choose a zone —</option>
                                {zones.map(z => (
                                    <option key={z.id} value={z.id}>{z.name} ({z.type})</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        {selectedSite && zones.length === 0 && (
                            <p className="text-xs text-amber-600 mt-1">This site has no zones yet.</p>
                        )}
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Reason for Report
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {REASONS.map(r => (
                                <label
                                    key={r.value}
                                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                        selectedReason === r.value
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                            : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={r.value}
                                        checked={selectedReason === r.value}
                                        onChange={e => setSelectedReason(e.target.value)}
                                        className="mt-0.5 accent-red-600"
                                    />
                                    <div>
                                        <div className={`text-sm font-medium ${selectedReason === r.value ? 'text-red-700 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                            {r.label}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{r.desc}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Additional Details <span className="font-normal text-gray-400">(optional)</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Describe what happened — e.g. the target URL, what the ad claimed, etc."
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            Report submitted successfully. Our team will review it within 24–48 hours.
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex justify-end pt-1">
                        <button
                            type="submit"
                            disabled={submitting || !selectedZone || !selectedReason}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {submitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>

            {/* My Reports History */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900 dark:text-white">My Reports</h2>
                    <span className="text-sm text-gray-500">{reports.length} total</span>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                    </div>
                ) : reports.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <Flag className="w-8 h-8 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No reports submitted yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {reports.map(r => {
                            const st = STATUS_STYLES[r.status] || STATUS_STYLES.OPEN;
                            const StatusIcon = st.icon;
                            return (
                                <div key={r.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {REASON_LABELS[r.reason] || r.reason}
                                                </span>
                                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${st.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {st.label}
                                                </span>
                                            </div>
                                            {r.zoneName && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    Zone: <span className="font-medium">{r.zoneName}</span>
                                                    {r.campaignName && <> · Campaign: <span className="font-medium">{r.campaignName}</span></>}
                                                </div>
                                            )}
                                            {r.description && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{r.description}</p>
                                            )}
                                            {r.adminNote && (
                                                <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2">
                                                    <strong>Admin note:</strong> {r.adminNote}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                                            {new Date(r.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
