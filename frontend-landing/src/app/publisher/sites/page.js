'use client';

import { useState, useEffect } from 'react';
import { Plus, Globe, CheckCircle, XCircle, Clock, TrendingUp, Eye, DollarSign, Edit, Trash2, Loader2, ShieldAlert, ShieldCheck, Code, FileText, LayoutTemplate, Copy, Check } from 'lucide-react';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import StatsCard from '@/components/StatsCard';
import { publisherAPI } from '@/lib/api';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

export default function PublisherSitesPage() {
    const theme = useTheme();
    const d = getDashboardTheme(theme);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSite, setSelectedSite] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [sites, setSites] = useState([]);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        url: '',
        name: '',
        category: '',
        description: ''
    });

    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [verifyingSite, setVerifyingSite] = useState(null);
    const [verifyMethod, setVerifyMethod] = useState('META'); // META, FILE, DNS
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [verifyError, setVerifyError] = useState('');
    const [verifySuccess, setVerifySuccess] = useState(false);
    const [copiedStates, setCopiedStates] = useState({});

    useEffect(() => {
        fetchSites();
    }, []);

    const fetchSites = async () => {
        try {
            setLoading(true);
            const data = await publisherAPI.getSites();
            setSites(Array.isArray(data) ? data : data.sites || []);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching sites:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSite = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const newSite = await publisherAPI.createSite({
                url: formData.url, name: formData.name,
                category: formData.category, description: formData.description
            });
            setSites([...sites, newSite]);
            setIsAddModalOpen(false);
            setFormData({ url: '', name: '', category: '', description: '' });
        } catch (err) { setError(err.message); }
        finally { setSubmitting(false); }
    };

    const handleEditSite = (site) => {
        setSelectedSite(site);
        setFormData({ url: site.url, name: site.name, category: site.category, description: site.description || '' });
        setIsEditModalOpen(true);
    };

    const handleUpdateSite = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const updated = await publisherAPI.updateSite(selectedSite.id, {
                name: formData.name, category: formData.category, description: formData.description
            });
            setSites(sites.map(site => site.id === selectedSite.id ? { ...site, ...updated } : site));
            setIsEditModalOpen(false);
            setSelectedSite(null);
            setFormData({ url: '', name: '', category: '', description: '' });
        } catch (err) { setError(err.message); } finally { setSubmitting(false); }
    };

    const handleDeleteSite = async (siteId) => {
        if (!confirm('Are you sure you want to delete this site?')) return;
        try {
            await publisherAPI.deleteSite(siteId);
            setSites(sites.filter(site => site.id !== siteId));
        } catch (err) { alert('Error deleting site: ' + err.message); }
    };

    const handleOpenVerify = (site) => {
        setVerifyingSite(site);
        setVerifyMethod('META');
        setVerifyError('');
        setVerifySuccess(false);
        setIsVerifyModalOpen(true);
    };

    const handleVerifySubmit = async () => {
        setVerifyLoading(true);
        setVerifyError('');
        try {
            if (verifyMethod === 'ADS_TXT') {
                await publisherAPI.verifyAdsTxt(verifyingSite.id);
            } else {
                await publisherAPI.verifySite(verifyingSite.id, verifyMethod);
            }

            setVerifySuccess(true);
            setSites(sites.map(s => s.id === verifyingSite.id ? {
                ...s,
                verifiedAt: verifyMethod !== 'ADS_TXT' ? new Date() : s.verifiedAt,
                adsTxtVerifiedAt: verifyMethod === 'ADS_TXT' ? new Date() : s.adsTxtVerifiedAt
            } : s));
            setTimeout(() => {
                setIsVerifyModalOpen(false);
                setVerifyingSite(null);
            }, 2000);
        } catch (err) {
            setVerifyError(err.message || 'Verification failed. Please check the instructions and try again.');
        } finally {
            setVerifyLoading(false);
        }
    };


    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedStates({ ...copiedStates, [id]: true });
        setTimeout(() => setCopiedStates({ ...copiedStates, [id]: false }), 2000);
    };

    const statusBadge = (status) => {
        const variants = {
            ACTIVE: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', icon: CheckCircle },
            PENDING: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', icon: Clock },
            REJECTED: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', icon: XCircle }
        };
        const variant = variants[status] || variants.PENDING;
        const Icon = variant.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${variant.bg} ${variant.text} ${variant.border}`}>
                <Icon className="w-3 h-3" />
                {status}
            </span>
        );
    };

    const columns = [
        {
            header: 'Site', accessor: 'name', sortable: true,
            render: (row) => (
                <div>
                    <div className="font-bold text-base">{row.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs opacity-75">{row.url}</span>
                        {row.verifiedAt ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20" title="Domain verified">
                                <ShieldCheck className="w-3 h-3" /> Verified
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20" title="Domain verify required">
                                <ShieldAlert className="w-3 h-3" /> Unverified
                            </span>
                        )}
                        {row.adsTxtVerifiedAt ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20" title="Ads.txt successfully connected">
                                <FileText className="w-3 h-3" /> Ads.txt
                            </span>
                        ) : row.verifiedAt && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-gray-500/10 px-1.5 py-0.5 rounded border border-gray-500/20" title="Ads.txt not configured yet">
                                <ShieldAlert className="w-3 h-3 text-red-400" /> No Ads.txt
                            </span>
                        )}
                    </div>

                </div>
            )
        },
        { header: 'Category', accessor: 'category', sortable: true },
        { header: 'Status', accessor: 'status', sortable: true, render: (row) => statusBadge(row.status) },
        { header: 'Impressions', accessor: 'impressions', sortable: true, render: (row) => (row.impressions || 0).toLocaleString() },
        { header: 'Revenue', accessor: 'revenue', sortable: true, render: (row) => `$${Number(row.revenue || 0).toFixed(2)}` },
        { header: 'Added', accessor: 'createdAt', sortable: true, render: (row) => new Date(row.createdAt).toLocaleDateString() },
        {
            header: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-2">
                    {(!row.verifiedAt || !row.adsTxtVerifiedAt) && (
                        <button onClick={() => handleOpenVerify(row)} className={`p-2 rounded hover:bg-amber-500/20 text-amber-500 transition-colors tooltip-btn`} title={!row.verifiedAt ? "Verify Site Ownership" : "Setup Ads.txt"}>
                            <ShieldAlert className="w-4 h-4" />
                        </button>
                    )}
                    <button onClick={() => handleEditSite(row)} className={`p-2 rounded hover:opacity-70 transition-opacity tooltip-btn`} title="Edit">

                        <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteSite(row.id)} className="p-2 rounded hover:text-red-500 transition-colors tooltip-btn" title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    const activeSites = sites.filter(s => s.status === 'ACTIVE').length;
    const totalImpressions = sites.reduce((sum, s) => sum + (s.impressions || 0), 0);
    const totalRevenue = sites.reduce((sum, s) => sum + (parseFloat(s.revenue) || 0), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className={`w-12 h-12 ${d.loaderColor} animate-spin mx-auto mb-4`} />
                    <p className={d.loaderText}>Loading sites...</p>
                </div>
            </div>
        );
    }

    const inputCls = `w-full px-4 py-3 ${d.isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-white/30' : 'bg-white border border-gray-300 text-[#1A1A1A] placeholder-gray-400 focus:border-gray-500'} rounded-xl focus:outline-none transition-all`;
    const labelCls = `block text-sm font-medium mb-2 ${d.isDark ? 'text-gray-300' : 'text-gray-600'}`;

    return (
        <div className="space-y-8">
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className={`${d.heading} mb-2`}>My Sites</h1>
                    <p className={d.subheading}>Manage your websites and monitor their performance</p>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className={`${d.btnPrimary} flex items-center gap-2`}>
                    <Plus className="w-5 h-5" />
                    Add New Site
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard icon={Globe} title="Total Sites" value={sites.length} subtitle={`${activeSites} active`} color="lime" />
                <StatsCard icon={Eye} title="Total Impressions" value={totalImpressions.toLocaleString()} change="+12.5%" changeType="positive" color="sky" />
                <StatsCard icon={DollarSign} title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} change="+8.3%" changeType="positive" color="purple" />
                <StatsCard icon={TrendingUp} title="Avg CPM" value={totalImpressions > 0 ? `$${((totalRevenue / totalImpressions) * 1000).toFixed(2)}` : '$0.00'} subtitle="Last 30 days" color="orange" />
            </div>

            {/* Sites Table */}
            {sites.length === 0 ? (
                <EmptyState
                    icon={Globe}
                    title="No sites added yet"
                    description="Add your first website to start monetizing your traffic"
                    action={
                        <button onClick={() => setIsAddModalOpen(true)} className={d.btnPrimary}>
                            Add Your First Site
                        </button>
                    }
                />
            ) : (
                <DataTable columns={columns} data={sites} searchPlaceholder="Search sites..." />
            )}

            {/* Add Site Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Site" size="medium" variant={theme}>
                <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${d.isDark ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                    <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <h5 className="text-sm font-bold mb-1">Adult Traffic Guidelines</h5>
                        <p className="text-xs leading-relaxed opacity-90">
                            If your website contains NSFW or Adult content, you must explicitly select the <strong>Adult (NSFW)</strong> category. Misrepresenting your category may result in account suspension and withheld earnings.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleAddSite} className="space-y-6">
                    <div>
                        <label className={d.labelCls}>Website URL *</label>
                        <input type="url" required value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className={d.inputCls} placeholder="https://example.com" />
                    </div>
                    <div>
                        <label className={d.labelCls}>Site Name *</label>
                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={d.inputCls} placeholder="My Awesome Site" />
                    </div>
                    <div>
                        <label className={d.labelCls}>Category *</label>
                        <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={d.inputCls}>
                            <option value="">Select a category</option>
                            <option value="Adult">Adult (NSFW)</option>
                            <option value="Technology">Technology</option>
                            <option value="Gaming">Gaming</option>
                            <option value="News">News</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Sports">Sports</option>
                            <option value="Lifestyle">Lifestyle</option>
                            <option value="Travel">Travel</option>
                            <option value="Education">Education</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className={d.labelCls}>Description (Optional)</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className={`${d.inputCls} resize-none`} placeholder="Brief description of your site..." />
                    </div>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} disabled={submitting} className={`flex-1 ${d.btnSecondary} disabled:opacity-50`}>Cancel</button>
                        <button type="submit" disabled={submitting} className={`flex-1 ${d.btnPrimary} disabled:opacity-50 flex items-center justify-center gap-2`}>
                            {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>) : 'Add Site'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Site Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Site" size="medium" variant={theme}>
                <form onSubmit={handleUpdateSite} className="space-y-6">
                    <div>
                        <label className={d.labelCls}>Website URL</label>
                        <input type="url" disabled value={formData.url} className={`${d.inputCls} cursor-not-allowed opacity-50`} />
                        <p className={`text-xs mt-1 ${d.isDark ? 'text-gray-500' : 'text-gray-400'}`}>URL cannot be changed after creation</p>
                    </div>
                    <div>
                        <label className={d.labelCls}>Site Name *</label>
                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={d.inputCls} />
                    </div>
                    <div>
                        <label className={d.labelCls}>Category *</label>
                        <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={d.inputCls}>
                            <option value="Adult">Adult (NSFW)</option>
                            <option value="Technology">Technology</option>
                            <option value="Gaming">Gaming</option>
                            <option value="News">News</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Sports">Sports</option>
                            <option value="Lifestyle">Lifestyle</option>
                            <option value="Travel">Travel</option>
                            <option value="Education">Education</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className={`flex-1 ${d.btnSecondary}`}>Cancel</button>
                        <button type="submit" className={`flex-1 ${d.btnPrimary}`}>Save Changes</button>
                    </div>
                </form>
            </Modal>

            {/* Verify Site Modal - High-End Minimalist Redesign */}
            <Modal isOpen={isVerifyModalOpen} onClose={() => !verifyLoading && !verifySuccess && setIsVerifyModalOpen(false)} title="" size="large" variant={theme}>
                <div className="text-left font-sans antialiased pb-4" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
                    {!verifyingSite ? null : verifySuccess ? (
                        <div className="py-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-16 h-16 mx-auto mb-6 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                                <Check className="w-8 h-8" strokeWidth={2.5} />
                            </div>
                            <h3 className={`text-2xl font-semibold mb-2 ${d.isDark ? 'text-white' : 'text-gray-900'}`}>Site Verified Successfully</h3>
                            <p className={`text-base font-normal ${d.isDark ? 'text-gray-400' : 'text-gray-500'} max-w-sm mx-auto`}>Access to ad tags has been unlocked for <span className={d.isDark ? 'text-gray-200' : 'text-gray-900'}>{verifyingSite.url}</span>.</p>
                            <button onClick={() => setIsVerifyModalOpen(false)} className={`mt-8 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${d.isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-900'}`}>
                                Continue to Dashboard
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8 mt-2">
                            {/* Header */}
                            <div>
                                <h2 className={`text-2xl font-semibold tracking-tight ${d.isDark ? 'text-white' : 'text-gray-900'}`}>Verify Ownership</h2>
                                <p className={`text-sm mt-1.5 font-normal ${d.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Select a method to confirm you own <span className={`font-medium ${d.isDark ? 'text-gray-200' : 'text-gray-800'}`}>{verifyingSite.url}</span>
                                </p>
                            </div>

                            {/* Error Banner */}
                            {verifyError && (
                                <div className="p-3.5 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex gap-3 items-center">
                                    <XCircle className="w-4 h-4 flex-shrink-0" />
                                    <span className="font-medium">{verifyError}</span>
                                </div>
                            )}

                            {/* Minimalist Tabs */}
                            <div className={`flex gap-3 border-b pb-4 overflow-x-auto ${d.isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                                {[
                                    { id: 'META', label: 'Meta Tag', icon: Code },
                                    { id: 'FILE', label: 'HTML File', icon: FileText },
                                    { id: 'DNS', label: 'DNS TXT', icon: LayoutTemplate },
                                    { id: 'ADS_TXT', label: 'Ads.txt (Required)', icon: FileText }
                                ].map(m => {
                                    const isActive = verifyMethod === m.id;
                                    return (
                                        <button

                                            key={m.id}
                                            onClick={() => setVerifyMethod(m.id)}
                                            className={`flex items-center gap-2 py-2 px-4 rounded-full text-sm font-medium transition-all duration-200 ${isActive ? (d.isDark ? 'bg-white text-black' : 'bg-black text-white') : (d.isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-black hover:bg-gray-100')}`}
                                            style={{ textTransform: 'none' }}
                                        >
                                            <m.icon className="w-4 h-4" />
                                            <span>{m.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Content Panes */}
                            <div className="min-h-[220px]">
                                {verifyMethod === 'META' && (
                                    <div className="space-y-5 animate-in fade-in duration-300">
                                        <div>
                                            <h4 className={`text-sm font-medium ${d.isDark ? 'text-gray-200' : 'text-gray-900'}`}>Add meta tag to your homepage</h4>
                                            <p className={`text-sm mt-1 mb-3 ${d.isDark ? 'text-gray-400' : 'text-gray-500'}`}>Copy the snippet below and paste it within the <code>&lt;head&gt;</code> section of your site's target URL.</p>
                                        </div>
                                        <div className={`relative rounded-lg border p-4 ${d.isDark ? 'bg-[#0a0a0a] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                                            <pre className={`text-[13px] font-mono whitespace-pre-wrap break-all ${d.isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                &lt;meta name="popreklam-verification" content="{verifyingSite.verificationToken || 'generating...'}" /&gt;
                                            </pre>
                                            <button type="button" onClick={() => handleCopy(`<meta name="popreklam-verification" content="${verifyingSite.verificationToken}" />`, 'meta')} className={`absolute top-3 right-3 p-1.5 rounded-md transition-colors ${copiedStates['meta'] ? 'text-emerald-500' : (d.isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-black hover:bg-white border border-transparent hover:border-gray-200 shadow-sm')}`}>
                                                {copiedStates['meta'] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {verifyMethod === 'FILE' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        <div>
                                            <h4 className={`text-sm font-medium ${d.isDark ? 'text-gray-200' : 'text-gray-900'}`}>Upload an HTML file to your server</h4>
                                            <p className={`text-sm mt-1 ${d.isDark ? 'text-gray-400' : 'text-gray-500'}`}>Create a file named <strong>{verifyingSite.verificationToken || 'token'}.txt</strong> and place it in your root directory.</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className={`block text-xs font-medium mb-1.5 uppercase tracking-wider ${d.isDark ? 'text-gray-500' : 'text-gray-400'}`}>Filename</label>
                                                <div className={`flex items-center justify-between p-3 rounded-lg border font-mono text-sm ${d.isDark ? 'bg-[#0a0a0a] border-gray-800 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                                    <span className="truncate">{verifyingSite.verificationToken || 'generating...'}.txt</span>
                                                    <button onClick={() => handleCopy(`${verifyingSite.verificationToken}.txt`, 'filename')} className={`ml-2 p-1.5 rounded-md flex-shrink-0 transition-colors ${copiedStates['filename'] ? 'text-emerald-500' : (d.isDark ? 'text-gray-500 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-black hover:bg-white')}`}>
                                                        {copiedStates['filename'] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className={`block text-xs font-medium mb-1.5 uppercase tracking-wider ${d.isDark ? 'text-gray-500' : 'text-gray-400'}`}>File Content</label>
                                                <div className={`flex items-center justify-between p-3 rounded-lg border font-mono text-sm ${d.isDark ? 'bg-[#0a0a0a] border-gray-800 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                                    <span className="truncate">{verifyingSite.verificationToken || 'generating...'}</span>
                                                    <button onClick={() => handleCopy(verifyingSite.verificationToken, 'filecontent')} className={`ml-2 p-1.5 rounded-md flex-shrink-0 transition-colors ${copiedStates['filecontent'] ? 'text-emerald-500' : (d.isDark ? 'text-gray-500 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-black hover:bg-white')}`}>
                                                        {copiedStates['filecontent'] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <p className={`text-xs ${d.isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                            Verify link: <a href={`${verifyingSite.url.replace(/\/$/, '')}/${verifyingSite.verificationToken}.txt`} target="_blank" rel="noreferrer" className={`hover:underline ${d.isDark ? 'text-gray-300' : 'text-gray-600'}`}>{verifyingSite.url.replace(/\/$/, '')}/{verifyingSite.verificationToken || 'generating...'}.txt</a>
                                        </p>
                                    </div>
                                )}

                                {verifyMethod === 'DNS' && (
                                    <div className="space-y-5 animate-in fade-in duration-300">
                                        <div>
                                            <h4 className={`text-sm font-medium ${d.isDark ? 'text-gray-200' : 'text-gray-900'}`}>Add a DNS record to your domain</h4>
                                            <p className={`text-sm mt-1 mb-4 ${d.isDark ? 'text-gray-400' : 'text-gray-500'}`}>Sign in to your domain provider and add the following <strong>TXT</strong> record.</p>
                                        </div>

                                        <div className={`rounded-lg border overflow-hidden ${d.isDark ? 'border-gray-800 bg-[#0a0a0a]' : 'border-gray-200 bg-gray-50'}`}>
                                            <table className="w-full text-sm text-left">
                                                <thead className={`text-xs uppercase tracking-wider ${d.isDark ? 'text-gray-500 border-b border-gray-800' : 'text-gray-500 border-b border-gray-200'}`}>
                                                    <tr>
                                                        <th className="px-4 py-3 font-medium">Type</th>
                                                        <th className="px-4 py-3 font-medium">Host</th>
                                                        <th className="px-4 py-3 font-medium">Value</th>
                                                    </tr>
                                                </thead>
                                                <tbody className={`font-mono text-[13px] ${d.isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    <tr>
                                                        <td className="px-4 py-4 border-r border-inherit">TXT</td>
                                                        <td className="px-4 py-4 border-r border-inherit">@</td>
                                                        <td className="px-4 py-3 flex items-center justify-between">
                                                            <span className="truncate mr-4">popreklam-site-verification={verifyingSite.verificationToken || 'generating...'}</span>
                                                            <button onClick={() => handleCopy(`popreklam-site-verification=${verifyingSite.verificationToken}`, 'dnsTxt')} className={`p-1.5 rounded-md flex-shrink-0 transition-colors ${copiedStates['dnsTxt'] ? 'text-emerald-500' : (d.isDark ? 'text-gray-500 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-black hover:bg-white shadow-sm border border-gray-200')}`}>
                                                                {copiedStates['dnsTxt'] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {verifyMethod === 'ADS_TXT' && (
                                    <div className="space-y-5 animate-in fade-in duration-300">
                                        <div>
                                            <h4 className={`text-sm font-medium ${d.isDark ? 'text-gray-200' : 'text-gray-900'}`}>Publish Ads.txt File</h4>
                                            <p className={`text-sm mt-1 mb-3 ${d.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Add the following line to the <code>ads.txt</code> file in your domain's root directory (e.g. <code>{verifyingSite.url.replace(/\/$/, '')}/ads.txt</code>). Premium advertisers look for this file to prevent fraud.
                                            </p>
                                        </div>
                                        <div className={`relative rounded-lg border p-4 ${d.isDark ? 'bg-[#0a0a0a] border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                                            <pre className={`text-[13px] font-mono whitespace-pre-wrap break-all ${d.isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                popreklam.com, {verifyingSite.publisherId || '{your_publisher_id}'}, DIRECT, f08e4c7b2a3d6e1f
                                            </pre>
                                            <button type="button" onClick={() => handleCopy(`popreklam.com, ${verifyingSite.publisherId || '{your_publisher_id}'}, DIRECT, f08e4c7b2a3d6e1f`, 'adstxt')} className={`absolute top-3 right-3 p-1.5 rounded-md transition-colors ${copiedStates['adstxt'] ? 'text-emerald-500' : (d.isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-black hover:bg-white border border-transparent hover:border-gray-200 shadow-sm')}`}>
                                                {copiedStates['adstxt'] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className={`p-3 rounded-lg text-xs leading-relaxed ${d.isDark ? 'bg-amber-900/10 border-amber-900/30 text-amber-500/90 border' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
                                            <strong>Note:</strong> It can take up to 24 hours for advertisers to crawl and recognize your newly hosted ads.txt file. Verification here ensures your exact line is correctly formatted.
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className={`flex justify-end gap-3 pt-6 mt-6 border-t ${d.isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                                <button type="button" onClick={() => setIsVerifyModalOpen(false)} disabled={verifyLoading} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${d.isDark ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-black hover:bg-gray-100'}`} style={{ textTransform: 'none' }}>
                                    Cancel
                                </button>
                                <button type="button" onClick={handleVerifySubmit} disabled={verifyLoading} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 ${d.isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`} style={{ textTransform: 'none' }}>
                                    {verifyLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {verifyLoading ? 'Verifying...' : 'Verify Now'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
