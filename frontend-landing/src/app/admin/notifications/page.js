'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { adminToast } from '@/components/admin/Toast';
import { Plus, Trash2, Edit2, X, Megaphone, Check, Calendar, Users } from 'lucide-react';

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'INFO',
        targetGroup: 'ALL',
        expiresAt: '',
    });

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await adminAPI.getAnnouncements();
            setNotifications(data);
        } catch (error) {
            adminToast.error('Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingId(item.id);
            setFormData({
                title: item.title,
                message: item.message,
                type: item.type,
                targetGroup: item.targetGroup,
                expiresAt: item.expiresAt ? new Date(item.expiresAt).toISOString().slice(0, 16) : '',
            });
        } else {
            setEditingId(null);
            setFormData({
                title: '',
                message: '',
                type: 'INFO',
                targetGroup: 'ALL',
                expiresAt: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
            };

            if (editingId) {
                await adminAPI.updateAnnouncement(editingId, payload);
                adminToast.success('Announcement updated');
            } else {
                await adminAPI.createAnnouncement(payload);
                adminToast.success('Announcement created');
            }
            setIsModalOpen(false);
            fetchNotifications();
        } catch (error) {
            adminToast.error(error.message || 'Failed to save announcement');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await adminAPI.deleteAnnouncement(id);
            adminToast.success('Announcement deleted');
            fetchNotifications();
        } catch (error) {
            adminToast.error('Failed to delete announcement');
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>Announcements</h1>
                    <p style={{ color: '#94a3b8', fontSize: '14px' }}>Manage global and targeted notifications</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: '#8b5cf6', color: '#fff', border: 'none',
                        padding: '10px 16px', borderRadius: '8px', fontWeight: 600,
                        cursor: 'pointer', transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#7c3aed'}
                    onMouseLeave={e => e.currentTarget.style.background = '#8b5cf6'}
                >
                    <Plus size={16} /> New Announcement
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading announcements...</div>
            ) : notifications.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', padding: '60px 20px', textAlign: 'center' }}>
                    <Megaphone size={40} color="#475569" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ color: '#cbd5e1', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>No Announcements</h3>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>Create your first announcement to notify your users.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {notifications.map(item => (
                        <div key={item.id} style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '12px', padding: '20px',
                            display: 'flex', gap: '20px', alignItems: 'flex-start'
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <h3 style={{ color: '#f8fafc', fontSize: '16px', fontWeight: 600, margin: 0 }}>{item.title}</h3>
                                    <span style={{
                                        fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                                        background: item.type === 'INFO' ? 'rgba(56,189,248,0.1)' : item.type === 'SUCCESS' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                                        color: item.type === 'INFO' ? '#38bdf8' : item.type === 'SUCCESS' ? '#22c55e' : '#f59e0b'
                                    }}>
                                        {item.type}
                                    </span>
                                    <span style={{
                                        fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                                        background: 'rgba(139,92,246,0.1)', color: '#a78bfa',
                                        display: 'flex', alignItems: 'center', gap: '4px'
                                    }}>
                                        <Users size={12} /> {item.targetGroup}
                                    </span>
                                </div>
                                <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                                    {item.message}
                                </p>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={14} /> Created: {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                    {item.expiresAt && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: new Date(item.expiresAt) < new Date() ? '#ef4444' : '#64748b' }}>
                                            <Calendar size={14} /> Expires: {new Date(item.expiresAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => handleOpenModal(item)}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: 'none',
                                        width: '32px', height: '32px', borderRadius: '6px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                    }}
                                    title="Edit"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    style={{
                                        background: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'none',
                                        width: '32px', height: '32px', borderRadius: '6px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                    }}
                                    title="Delete"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
                }}>
                    <div style={{
                        background: '#0f0f24', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '24px',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
                                {editingId ? 'Edit Announcement' : 'New Announcement'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', marginBottom: '6px' }}>Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    style={{
                                        width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#fff', padding: '10px 12px', borderRadius: '8px', fontSize: '14px', outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', marginBottom: '6px' }}>Message</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    style={{
                                        width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#fff', padding: '10px 12px', borderRadius: '8px', fontSize: '14px', outline: 'none',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', marginBottom: '6px' }}>Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        style={{
                                            width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#fff', padding: '10px 12px', borderRadius: '8px', fontSize: '14px', outline: 'none'
                                        }}
                                    >
                                        <option value="INFO">Info</option>
                                        <option value="SUCCESS">Success</option>
                                        <option value="WARNING">Warning</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', marginBottom: '6px' }}>Target Audience</label>
                                    <select
                                        value={formData.targetGroup}
                                        onChange={e => setFormData({ ...formData, targetGroup: e.target.value })}
                                        style={{
                                            width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#fff', padding: '10px 12px', borderRadius: '8px', fontSize: '14px', outline: 'none'
                                        }}
                                    >
                                        <option value="ALL">All Users</option>
                                        <option value="ADVERTISER">Advertisers Only</option>
                                        <option value="PUBLISHER">Publishers Only</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', marginBottom: '6px' }}>Expires At (Optional)</label>
                                <input
                                    type="datetime-local"
                                    value={formData.expiresAt}
                                    onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                                    style={{
                                        width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#fff', padding: '10px 12px', borderRadius: '8px', fontSize: '14px', outline: 'none',
                                        colorScheme: 'dark'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{
                                        background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)',
                                        padding: '10px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        background: '#8b5cf6', color: '#fff', border: 'none',
                                        padding: '10px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                                    }}
                                >
                                    <Check size={16} /> Save Announcement
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
