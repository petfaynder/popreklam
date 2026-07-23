'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { advertiserAPI } from '@/lib/api';
import { ArrowLeft, Check, AlertTriangle } from 'lucide-react';
import useTheme from '@/hooks/useTheme';
import { getDashboardTheme } from '@/lib/themeUtils';

// Components
import GeneralInfo from './components/GeneralInfo';
import AdFormatSelect from './components/AdFormatSelect';
import CreativesSection from './components/CreativesSection';
import TargetingSection from './components/TargetingSection';
import ZoneTargeting from './components/ZoneTargeting';
import BudgetSchedule from './components/BudgetSchedule';
import TrafficEstimator from './components/TrafficEstimator';

export default function CreateCampaign() {
    const router = useRouter();
    const theme = useTheme();
    const d = getDashboardTheme(theme);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        targetUrl: '',
        postbackUrl: '',
        adFormat: 'POPUNDER',
        // Creatives
        creativeTitle: '',
        creativeDesc: '',
        creativeIcon: '',
        creativeImage: '',
        // Budget & Bidding
        totalBudget: '',
        dailyBudget: '',
        bidAmount: '',
        biddingStrategy: 'CPM',    // 'CPM' | 'SMART_CPM' | 'SMART_CPC'
        smartCpmMaxBid: '',
        freqCap: 3,
        freqInterval: 24,
        pacing: 'EVEN',
        schedule: null,
        // Targeting
        countries: [],
        devices: [],
        os: [],
        browsers: [],
        connectionType: [],
        languages: [],
        blockProxy: false,
        carriers: [],
        includeZones: '',
        excludeZones: '',
        // Audience
        audienceInclude: [],
        audienceExclude: [],
        feedAudienceIds: [],
        // Content Types
        trafficTypes: ['MAINSTREAM'],
        // Click Limits
        dailyClicksLimit: '',
        totalClicksLimit: '',
    });

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleArrayField = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value]
        }));
    };

    // Validation Logic
    const validateForm = () => {
        // For SmartCPM: bid is smartCpmMaxBid, not bidAmount
        const effectiveBid = formData.biddingStrategy === 'SMART_CPM'
            ? formData.smartCpmMaxBid
            : formData.bidAmount;

        if (!formData.name || !formData.targetUrl || !formData.totalBudget || !effectiveBid) {
            return 'Please fill in all required fields (Name, URL, Budget, Bid).';
        }

        if (formData.biddingStrategy === 'SMART_CPM' && parseFloat(formData.smartCpmMaxBid) <= 0) {
            return 'SmartCPM requires a valid maximum CPM bid greater than 0.';
        }

        if (formData.adFormat !== 'POPUNDER') {
            if (!formData.creativeTitle || !formData.creativeDesc) {
                return 'Please provide a Title and Description for your ad creative.';
            }
        }

        return null;
    };

    const handleSubmit = async () => {
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            // Scroll to top to see error
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        try {
            setLoading(true);
            setError('');

            const campaignData = {
                name: formData.name,
                targetUrl: formData.targetUrl,
                postbackUrl: formData.postbackUrl || null,
                adFormat: formData.adFormat,
                totalBudget: parseFloat(formData.totalBudget),
                dailyBudget: formData.dailyBudget ? parseFloat(formData.dailyBudget) : null,
                // For SmartCPM: bidAmount mirrors smartCpmMaxBid (backend requires bidAmount always)
                bidAmount: formData.biddingStrategy === 'SMART_CPM'
                    ? parseFloat(formData.smartCpmMaxBid || 0)
                    : parseFloat(formData.bidAmount),
                biddingStrategy: formData.biddingStrategy || 'CPM',
                smartCpmMaxBid: formData.biddingStrategy === 'SMART_CPM'
                    ? parseFloat(formData.smartCpmMaxBid)
                    : null,
                cpaGoal: formData.cpaGoal ? parseFloat(formData.cpaGoal) : null,
                autoOptimize: Boolean(formData.autoOptimize),
                freqCap: parseInt(formData.freqCap) || 3,
                freqInterval: parseInt(formData.freqInterval) || 24,
                pacing: formData.pacing || 'EVEN',
                schedule: formData.schedule || null,
                targeting: {
                    countries: formData.countries,
                    devices: formData.devices,
                    os: formData.os,
                    browsers: formData.browsers,
                    connectionType: formData.connectionType,
                    languages: formData.languages,
                    blockProxy: formData.blockProxy,
                    carriers: formData.carriers,
                    includeZones: formData.includeZones,
                    excludeZones: formData.excludeZones,
                    trafficTypes: formData.trafficTypes,
                },
                audienceInclude: formData.audienceInclude || [],
                audienceExclude: formData.audienceExclude || [],
                feedAudienceIds: formData.feedAudienceIds || [],
                dailyClicksLimit: formData.dailyClicksLimit ? parseInt(formData.dailyClicksLimit) : undefined,
                totalClicksLimit: formData.totalClicksLimit ? parseInt(formData.totalClicksLimit) : undefined,
                // If A/B variants exist, send array; otherwise single creative
                creatives: formData.creativeVariants && formData.creativeVariants.length > 1
                    ? formData.creativeVariants.map(v => ({
                        label: v.label,
                        weight: v.weight,
                        title: v.title,
                        description: v.description,
                        icon: v.iconUrl,
                        image: v.imageUrl,
                    }))
                    : {
                        title: formData.creativeTitle,
                        description: formData.creativeDesc,
                        icon: formData.creativeIcon,
                        image: formData.creativeImage
                    }
            };

            await advertiserAPI.createCampaign(campaignData);
            router.push('/advertiser/campaigns');
        } catch (err) {
            setError(err.message || 'Failed to create campaign');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = !validateForm(); // Basic check for UI button state (might not catch everything but good enough for enable/disable)

    return (
        <div className={`min-h-screen ${d.mainPadding} ${d.shell} block`}>
            <div className="max-w-7xl mx-auto w-full">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className={`flex items-center gap-2 mb-2 text-sm font-medium hover:underline ${d.muted}`}
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                        </button>
                        <h1 className={`text-3xl font-bold ${d.heading}`}>Create Campaign</h1>
                    </div>
                    <div className="hidden md:block">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold shadow-lg transition-all ${!loading
                                ? 'bg-gradient-to-r from-lime-500 to-green-600 text-white hover:shadow-lime-500/25'
                                : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {loading ? 'Launching...' : 'Launch Campaign'}
                            <Check className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500">
                        <AlertTriangle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column (Form) */}
                    <div className="lg:col-span-2 space-y-6">
                        <GeneralInfo formData={formData} updateField={updateField} />
                        <AdFormatSelect formData={formData} updateField={updateField} />
                        <CreativesSection formData={formData} updateField={updateField} setFormData={setFormData} />
                        <TargetingSection
                            formData={formData}
                            toggleArrayField={toggleArrayField}
                            setFormData={setFormData}
                            updateField={updateField}
                        />
                        <ZoneTargeting formData={formData} updateField={updateField} />
                        <BudgetSchedule formData={formData} updateField={updateField} />
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="lg:col-span-1">
                        <TrafficEstimator formData={formData} />

                        {/* Mobile Launch Button */}
                        <div className="md:hidden mt-6 mb-12">
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold shadow-lg transition-all ${!loading
                                    ? 'bg-gradient-to-r from-lime-500 to-green-600 text-white'
                                    : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {loading ? 'Launching...' : 'Launch Campaign'}
                                <Check className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
