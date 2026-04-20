const API_URL = '/api';

async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);

    // Safely parse JSON — guard against plain-text rate limit or error pages
    let data;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        data = await response.json();
    } else {
        const text = await response.text();
        // Try to parse anyway (some servers omit content-type)
        try {
            data = JSON.parse(text);
        } catch {
            // Non-JSON body (e.g. "Too many requests" plain text or HTML)
            if (!response.ok) {
                throw new Error(text || `HTTP ${response.status}`);
            }
            return text;
        }
    }

    if (!response.ok) {
        // 401 = invalid/expired token → clear session and redirect to login
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
                window.location.href = '/login';
            }
        }
        throw new Error(data.error || data.message || 'API request failed');
    }

    return data;
}

// ==================== AUTH API ====================
export const authAPI = {
    login: async (email, password, role, recaptchaToken) => {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, role, recaptchaToken }),
        });
        if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
    },

    register: async (email, password, role, companyName, referralCode, recaptchaToken) => {
        const response = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, role, companyName, ...(referralCode ? { referralCode } : {}), recaptchaToken }),
        });
        if (response.token) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }
        return response;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    forgotPassword: async (email, recaptchaToken) => {
        return await apiRequest('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email, recaptchaToken }),
        });
    },

    resetPassword: async (token, password) => {
        return await apiRequest('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, password }),
        });
    },
};

// ==================== PUBLISHER API ====================
export const publisherAPI = {
    getDashboard: () => apiRequest('/publisher/dashboard'),

    getSites: () => apiRequest('/publisher/sites'),
    createSite: (siteData) => apiRequest('/publisher/sites', {
        method: 'POST',
        body: JSON.stringify(siteData),
    }),
    updateSite: (id, siteData) => apiRequest(`/publisher/sites/${id}`, {
        method: 'PUT',
        body: JSON.stringify(siteData),
    }),
    deleteSite: (id) => apiRequest(`/publisher/sites/${id}`, { method: 'DELETE' }),
    verifySite: (id, method) => apiRequest(`/publisher/sites/${id}/verify`, {
        method: 'POST',
        body: JSON.stringify({ method })
    }),
    verifyAdsTxt: (id) => apiRequest(`/publisher/sites/${id}/verify-ads-txt`, { method: 'POST' }),

    // Payment Methods
    getPaymentMethods: () => apiRequest('/publisher/payments/methods'),
    addPaymentMethod: (methodData) => apiRequest('/publisher/payments/methods', {
        method: 'POST',
        body: JSON.stringify(methodData)
    }),
    updatePaymentMethod: (id, methodData) => apiRequest(`/publisher/payments/methods/${id}`, {
        method: 'PUT',
        body: JSON.stringify(methodData)
    }),
    deletePaymentMethod: (id) => apiRequest(`/publisher/payments/methods/${id}`, { method: 'DELETE' }),

    // Payments & Withdrawals
    getPayments: (filters) => {
        const params = new URLSearchParams(filters);
        return apiRequest(`/publisher/payments/history?${params}`);
    },
    requestWithdrawal: (amount, paymentMethodId) => apiRequest('/publisher/payments/withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount, paymentMethodId }),
    }),
    cancelWithdrawal: (id) => apiRequest(`/publisher/payments/${id}/cancel`, { method: 'POST' }),
    downloadInvoice: (id) => {
        const token = localStorage.getItem('token');
        const url = `${API_URL}/publisher/payments/invoices/${id}/download`;
        fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.text())
            .then(html => { const win = window.open('', '_blank'); win.document.write(html); win.document.close(); })
            .catch((err) => console.error('Failed to open invoice:', err));
    },

    getStats: (filters) => {
        const params = new URLSearchParams(filters);
        return apiRequest(`/publisher/stats?${params}`);
    },
    getStatistics: (period = 30) => apiRequest(`/publisher/stats/overview?period=${period}`),
    getRevenueTrends: (params = {}) => {
        const query = new URLSearchParams(params);
        return apiRequest(`/publisher/stats/revenue-trends?${query}`);
    },
    getTopPages: (limit = 10) => apiRequest(`/publisher/stats/top-pages?limit=${limit}`),
    getGeographicStats: () => apiRequest('/publisher/stats/geographic'),
    getDeviceBreakdown: () => apiRequest('/publisher/stats/device-breakdown'),
    getYieldRecommendations: () => apiRequest('/publisher/stats/recommendations'),

    // Account / Settings
    updateProfile: (profileData) => apiRequest('/publisher/settings/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
    changePassword: (passwordData) => apiRequest('/publisher/settings/password', { method: 'PUT', body: JSON.stringify(passwordData) }),
    updatePaymentSettings: (settings) => apiRequest('/publisher/settings/payment', { method: 'PUT', body: JSON.stringify(settings) }),
    generateApiToken: () => apiRequest('/publisher/settings/api-token', { method: 'POST' }),

    // Support
    createSupportTicket: (ticketData) => apiRequest('/publisher/support/tickets', { method: 'POST', body: JSON.stringify(ticketData) }),
    getSupportTickets: () => apiRequest('/publisher/support/tickets'),
    replyToTicket: (id, message) => apiRequest(`/publisher/support/tickets/${id}/reply`, { method: 'POST', body: JSON.stringify({ message }) }),

    // Referrals
    getReferralInfo: () => apiRequest('/publisher/referrals/info'),
    getReferralStats: () => apiRequest('/publisher/referrals/stats'),
    getReferrals: (params = {}) => apiRequest('/publisher/referrals?' + new URLSearchParams(params)),

    // Push Notification Analytics
    getPushOverview: (days = 30) => apiRequest(`/push/publisher/overview?days=${days}`),
    getPushSiteStats: (siteId, days = 30) => apiRequest(`/push/stats/${siteId}?days=${days}`),

    // Notifications
    getNotifications: () => apiRequest('/publisher/notifications'),
    markNotificationAsRead: (id) => apiRequest(`/publisher/notifications/${id}/read`, { method: 'POST' }),
};

// ==================== ADVERTISER API ====================
export const advertiserAPI = {
    getDashboard: () => apiRequest('/advertiser/dashboard'),

    getCampaigns: () => apiRequest('/advertiser/campaigns'),
    createCampaign: (campaignData) => apiRequest('/advertiser/campaigns', { method: 'POST', body: JSON.stringify(campaignData) }),
    updateCampaign: (id, campaignData) => apiRequest(`/advertiser/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(campaignData) }),
    deleteCampaign: (id) => apiRequest(`/advertiser/campaigns/${id}`, { method: 'DELETE' }),
    pauseCampaign: (id) => apiRequest(`/advertiser/campaigns/${id}/pause`, { method: 'PUT' }),
    resumeCampaign: (id) => apiRequest(`/advertiser/campaigns/${id}/resume`, { method: 'PUT' }),

    // Billing & Deposits
    getBilling: () => apiRequest('/advertiser/billing'),
    addPaymentMethod: (methodData) => apiRequest('/advertiser/billing/payment-methods', { method: 'POST', body: JSON.stringify(methodData) }),
    deletePaymentMethod: (id) => apiRequest(`/advertiser/billing/payment-methods/${id}`, { method: 'DELETE' }),
    createDeposit: (amount, paymentMethodId) => apiRequest('/advertiser/billing/deposit', { method: 'POST', body: JSON.stringify({ amount, paymentMethodId }) }),
    configureAutoRecharge: (enabled, threshold, amount) => apiRequest('/advertiser/billing/auto-recharge', { method: 'POST', body: JSON.stringify({ enabled, threshold, amount }) }),
    getInvoices: (filters) => {
        const params = new URLSearchParams(filters);
        return apiRequest(`/advertiser/billing/invoices?${params}`);
    },
    downloadInvoice: (id) => {
        const token = localStorage.getItem('token');
        const url = `${API_URL}/advertiser/billing/invoices/${id}/download`;
        fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.text())
            .then(html => { const win = window.open('', '_blank'); win.document.write(html); win.document.close(); })
            .catch((err) => console.error('Failed to open invoice:', err));
    },

    getStats: (filters) => {
        const params = new URLSearchParams(filters);
        return apiRequest(`/advertiser/stats?${params}`);
    },
    getCampaignPerformance: (params = {}) => {
        const query = new URLSearchParams(params);
        return apiRequest(`/advertiser/stats/campaign-performance?${query}`);
    },
    getROIAnalysis: () => apiRequest('/advertiser/stats/roi-analysis'),
    getGeographicPerformance: (params = {}) => {
        const query = new URLSearchParams(params);
        return apiRequest(`/advertiser/stats/geographic?${query}`);
    },
    getDevicePerformance: (params = {}) => {
        const query = new URLSearchParams(params);
        return apiRequest(`/advertiser/stats/device-performance?${query}`);
    },
    getZonePerformance: (params = {}) => {
        const query = new URLSearchParams(params);
        return apiRequest(`/advertiser/stats/zones?${query}`);
    },
    getBrowserPerformance: (params = {}) => {
        const query = new URLSearchParams(params);
        return apiRequest(`/advertiser/stats/browser-performance?${query}`);
    },
    getOSPerformance: (params = {}) => {
        const query = new URLSearchParams(params);
        return apiRequest(`/advertiser/stats/os-performance?${query}`);
    },
    getInPagePushStats: (params = {}) => {
        const query = new URLSearchParams(params);
        return apiRequest(`/advertiser/stats/inpage-push?${query}`);
    },
    getFilterOptions: () => apiRequest('/advertiser/stats/filter-options'),
    getPushStats: (params = {}) => {
        // Uses the push controller endpoint at /api/push/advertiser/stats
        const query = new URLSearchParams(params);
        return apiRequest(`/push/advertiser/stats?${query}`);
    },
    exportCSV: (params = {}) => {
        const query = new URLSearchParams(params);
        const token = localStorage.getItem('token');
        return `${API_URL}/advertiser/stats/export-csv?${query}&token=${token}`;
    },

    // Account / Settings
    getProfile: () => apiRequest('/advertiser/settings/profile'),
    updateProfile: (profileData) => apiRequest('/advertiser/settings/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
    changePassword: (passwordData) => apiRequest('/advertiser/settings/password', { method: 'PUT', body: JSON.stringify(passwordData) }),
    updateBillingInfo: (billingData) => apiRequest('/advertiser/settings/billing', { method: 'PUT', body: JSON.stringify(billingData) }),
    generateApiToken: () => apiRequest('/advertiser/settings/api-token', { method: 'POST' }),

    // Support
    createSupportTicket: (ticketData) => apiRequest('/advertiser/support/tickets', { method: 'POST', body: JSON.stringify(ticketData) }),
    getSupportTickets: () => apiRequest('/advertiser/support/tickets'),
    replyToTicket: (id, message) => apiRequest('/advertiser/support/tickets/' + id + '/reply', { method: 'POST', body: JSON.stringify({ message }) }),

    // Referrals
    getReferralInfo: () => apiRequest('/advertiser/referrals/info'),
    getReferralStats: () => apiRequest('/advertiser/referrals/stats'),
    getReferrals: (params = {}) => apiRequest('/advertiser/referrals?' + new URLSearchParams(params)),

    // A/B Creative Management
    getCreatives: (campaignId) => apiRequest(`/advertiser/campaigns/${campaignId}/creatives`),
    addCreative: (campaignId, data) => apiRequest(`/advertiser/campaigns/${campaignId}/creatives`, { method: 'POST', body: JSON.stringify(data) }),
    updateCreative: (campaignId, creativeId, data) => apiRequest(`/advertiser/campaigns/${campaignId}/creatives/${creativeId}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCreative: (campaignId, creativeId) => apiRequest(`/advertiser/campaigns/${campaignId}/creatives/${creativeId}`, { method: 'DELETE' }),

    // Bid Recommendation
    getBidRecommendation: (countries, format) => {
        const params = new URLSearchParams({ countries: countries.join(','), format });
        return apiRequest(`/advertiser/campaigns/bid-recommendation?${params}`);
    },

    // Priority System
    getPriority: () => apiRequest('/advertiser/priority'),
    getTierHistory: () => apiRequest('/advertiser/priority/history'),

    // Audiences
    getAudiences: () => apiRequest('/advertiser/audiences'),
    createAudience: (data) => apiRequest('/advertiser/audiences', { method: 'POST', body: JSON.stringify(data) }),
    updateAudience: (id, data) => apiRequest(`/advertiser/audiences/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteAudience: (id) => apiRequest(`/advertiser/audiences/${id}`, { method: 'DELETE' }),
    getAudienceSize: (id) => apiRequest(`/advertiser/audiences/${id}/size`),
    getEligibleCampaigns: () => apiRequest('/advertiser/audiences/eligible-campaigns'),

    // Push Notification Analytics
    getPushStats: (params = {}) => {
        const query = new URLSearchParams(params);
        return apiRequest(`/push/advertiser/stats?${query}`);
    },

    // Notifications
    getNotifications: () => apiRequest('/advertiser/notifications'),
    markNotificationAsRead: (id) => apiRequest(`/advertiser/notifications/${id}/read`, { method: 'POST' }),
};

// ==================== ADMIN API ====================
export const adminAPI = {
    getDashboard: () => apiRequest('/admin/dashboard'),
    getNotifications: () => apiRequest('/admin/notifications'),

    // Sites Management
    getSites: (params = {}) => apiRequest('/admin/sites?' + new URLSearchParams(params)),
    approveSite: (id) => apiRequest('/admin/sites/' + id + '/approve', { method: 'POST' }),
    rejectSite: (id, reason) => apiRequest('/admin/sites/' + id + '/reject', { method: 'POST', body: JSON.stringify({ reason }) }),
    updateSite: (id, data) => apiRequest('/admin/sites/' + id, { method: 'PUT', body: JSON.stringify(data) }),
    forceVerifySite: (id) => apiRequest('/admin/sites/' + id + '/force-verify', { method: 'POST' }),
    forceVerifyAdsTxt: (id) => apiRequest('/admin/sites/' + id + '/force-verify-ads-txt', { method: 'POST' }),

    // Campaigns Management
    getCampaigns: (params = {}) => apiRequest('/admin/campaigns?' + new URLSearchParams(params)),
    approveCampaign: (id) => apiRequest('/admin/campaigns/' + id + '/approve', { method: 'POST' }),
    rejectCampaign: (id, reason) => apiRequest('/admin/campaigns/' + id + '/reject', { method: 'POST', body: JSON.stringify({ reason }) }),

    // User Management
    getUsers: (params = {}) => apiRequest('/admin/users?' + new URLSearchParams(params)),
    getUserDetail: (id) => apiRequest('/admin/users/' + id),
    updateUserStatus: (id, status, reason) => apiRequest('/admin/users/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status, reason }) }),
    adjustUserBalance: (id, amount, type, reason) => apiRequest('/admin/users/' + id + '/balance', { method: 'PUT', body: JSON.stringify({ amount, type, reason }) }),

    // Payments
    getPayments: (params = {}) => apiRequest('/admin/payments?' + new URLSearchParams(params)),
    approvePayment: (id) => apiRequest('/admin/payments/' + id + '/approve', { method: 'POST' }),
    rejectPayment: (id, reason) => apiRequest('/admin/payments/' + id + '/reject', { method: 'POST', body: JSON.stringify({ reason }) }),

    // Stats & Reports
    getStats: (params = {}) => apiRequest('/admin/stats?' + new URLSearchParams(params)),
    getReports: (params = {}) => apiRequest('/admin/reports?' + new URLSearchParams(params)),
    getTransactions: (params = {}) => apiRequest('/admin/transactions?' + new URLSearchParams(params)),

    // Analytics
    getRevenueTimeline: (period = 30) => apiRequest('/admin/analytics/revenue?period=' + period),
    getTopPublishers: (period = 30, limit = 10) => apiRequest('/admin/analytics/top-publishers?period=' + period + '&limit=' + limit),
    getTopAdvertisers: (period = 30, limit = 10) => apiRequest('/admin/analytics/top-advertisers?period=' + period + '&limit=' + limit),
    getGeoBreakdown: (period = 30) => apiRequest('/admin/analytics/geo?period=' + period),
    getFormatBreakdown: (period = 30) => apiRequest('/admin/analytics/formats?period=' + period),
    getPlatformHealth: () => apiRequest('/admin/analytics/health'),
    getExportCsvUrl: (period = 30) => API_URL + '/admin/analytics/export-csv?period=' + period + '&token=' + (localStorage.getItem('token') || ''),

    // Support Tickets
    getTickets: (params = {}) => apiRequest('/admin/support/tickets?' + new URLSearchParams(params)),
    getTicket: (id) => apiRequest('/admin/support/tickets/' + id),
    replyTicket: (id, message) => apiRequest('/admin/support/tickets/' + id + '/reply', { method: 'POST', body: JSON.stringify({ message }) }),
    addTicketNote: (id, message) => apiRequest('/admin/support/tickets/' + id + '/note', { method: 'POST', body: JSON.stringify({ message }) }),
    updateTicketStatus: (id, status) => apiRequest('/admin/support/tickets/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status }) }),
    updateTicketPriority: (id, priority) => apiRequest('/admin/support/tickets/' + id + '/priority', { method: 'PUT', body: JSON.stringify({ priority }) }),
    getTicketStats: () => apiRequest('/admin/support/stats'),
    getCannedResponses: () => apiRequest('/admin/support/canned-responses'),

    // Settings
    getSettings: (group) => apiRequest('/admin/settings' + (group ? '?group=' + group : '')),
    updateSetting: (key, value) => apiRequest('/admin/settings/' + key, { method: 'PUT', body: JSON.stringify({ value }) }),
    bulkUpdateSettings: (settings) => apiRequest('/admin/settings/bulk', { method: 'POST', body: JSON.stringify({ settings }) }),
    resetSetting: (key) => apiRequest('/admin/settings/' + key + '/reset', { method: 'POST' }),
    seedSettings: () => apiRequest('/admin/settings/seed', { method: 'POST' }),

    // Audit Log
    getAuditLog: (params = {}) => apiRequest('/admin/audit?' + new URLSearchParams(params)),

    // Referrals
    getReferralOverview: () => apiRequest('/admin/referrals/stats'),
    getReferralSettings: () => apiRequest('/admin/referrals/settings'),
    updateReferralSettings: (data) => apiRequest('/admin/referrals/settings', { method: 'PUT', body: JSON.stringify(data) }),
    getAllReferrals: (params = {}) => apiRequest('/admin/referrals?' + new URLSearchParams(params)),
    approveReferralBonus: (id) => apiRequest('/admin/referrals/' + id + '/approve', { method: 'POST' }),

    // Traffic Insights
    getTrafficInsights: () => apiRequest('/admin/traffic/realtime'),

    // System Health
    getSystemHealthStatus: () => apiRequest('/admin/health/status'),

    // Adsterra Backfill Stats
    getAdsterraStats: (days = 7) => apiRequest('/admin/adsterra/stats?days=' + days),
    triggerAdsterraSync: () => apiRequest('/admin/adsterra/sync', { method: 'POST' }),

    // Announcements
    getAnnouncements: () => apiRequest('/admin/notifications/announcements'),
    createAnnouncement: (data) => apiRequest('/admin/notifications/announcements', { method: 'POST', body: JSON.stringify(data) }),
    updateAnnouncement: (id, data) => apiRequest(`/admin/notifications/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteAnnouncement: (id) => apiRequest(`/admin/notifications/announcements/${id}`, { method: 'DELETE' }),
};
