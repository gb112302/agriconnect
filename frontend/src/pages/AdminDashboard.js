import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../services/api';

function AdminDashboard() {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [flaggedReviews, setFlaggedReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        let filtered = allUsers;
        if (searchTerm) {
            const lc = searchTerm.toLowerCase();
            filtered = filtered.filter(u => u.name?.toLowerCase().includes(lc) || u.email?.toLowerCase().includes(lc));
        }
        if (roleFilter) {
            filtered = filtered.filter(u => u.role === roleFilter);
        }
        setUsers(filtered);
    }, [searchTerm, roleFilter, allUsers]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, statsRes, reviewsRes] = await Promise.all([
                adminAPI.getUsers(),
                adminAPI.getPlatformStats(),
                adminAPI.getFlaggedReviews()
            ]);
            setAllUsers(usersRes.data.users);
            setUsers(usersRes.data.users);
            setStats(statsRes.data.stats);
            setFlaggedReviews(reviewsRes.data.reviews);
        } catch (error) {
            console.error('Failed to load admin data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserStatusUpdate = async (id, currentStatus) => {
        try {
            await adminAPI.updateUserStatus(id, !currentStatus);
            const updated = u => u._id === id ? { ...u, isActive: !currentStatus } : u;
            setAllUsers(prev => prev.map(updated));
        } catch (error) { console.error('Failed to update user status', error); }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm(t('admin.delete_confirm'))) return;
        try {
            await adminAPI.deleteUser(id);
            setAllUsers(prev => prev.filter(u => u._id !== id));
        } catch (error) { console.error('Failed to delete user', error); }
    };

    if (loading) return <div className="loading">{t('admin.loading')}</div>;

    const STAT_CARDS = [
        { label: t('admin.total_users'),    val: stats?.totalUsers    || 0, icon: '👥', color: '#1976d2' },
        { label: t('admin.total_orders'),   val: stats?.totalOrders   || 0, icon: '📦', color: '#2e7d32' },
        { label: t('admin.total_revenue'),  val: `₹${stats?.totalRevenue  || 0}`, icon: '💰', color: '#7b1fa2' },
        { label: t('admin.total_products'), val: stats?.totalProducts || 0, icon: '🌾', color: '#e65100' },
    ];

    return (
        <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px' }}>
            <h1 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 800, color: '#1b5e20', marginBottom: '24px' }}>
                🛡️ {t('admin.dashboard')}
            </h1>

            {/* Stats */}
            <div style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', display: 'grid', gap: '16px', marginBottom: '32px' }}>
                {STAT_CARDS.map(s => (
                    <div key={s.label} className="card" style={{ borderLeft: `5px solid ${s.color}`, margin: 0, padding: '20px 24px' }}>
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
                        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280' }}>{s.label}</div>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: s.color, marginTop: '4px' }}>{s.val}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="admin-tabs">
                {['users', 'moderation'].map(tab => (
                    <button
                        key={tab}
                        className={`admin-tab${activeTab === tab ? ' active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'users' ? `👥 ${t('admin.users')}` : `🚩 ${t('admin.moderation_title')} (${flaggedReviews.length})`}
                    </button>
                ))}
            </div>

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div>
                    {/* Search + filter */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <div className="admin-search-bar" style={{ flex: 2 }}>
                            <input
                                type="text"
                                placeholder={`🔍 ${t('crop_prices.search_placeholder')}`}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <select
                                value={roleFilter}
                                onChange={e => setRoleFilter(e.target.value)}
                                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #d1d5db', borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontSize: '14px', minHeight: '44px' }}
                            >
                                <option value="">{t('admin.all_roles')}</option>
                                <option value="farmer">🌾 {t('roles.farmer')}</option>
                                <option value="buyer">🛒 {t('roles.buyer')}</option>
                                <option value="admin">🛡️ {t('roles.admin')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb' }}>
                                        {[t('admin.name'), t('admin.email'), t('admin.role'), t('admin.status'), t('admin.actions')].map(h => (
                                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length === 0 ? (
                                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>{t('admin.no_users')}</td></tr>
                                    ) : users.map((user) => (
                                        <tr key={user._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '14px' }}>{user.name}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{user.email}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px', background: '#f0fdf4', color: '#14532d', textTransform: 'capitalize' }}>{t(`roles.${user.role}`)}</span>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px', background: user.isActive ? '#dcfce7' : '#fee2e2', color: user.isActive ? '#14532d' : '#7f1d1d' }}>
                                                    {user.isActive ? t('admin.active') : t('admin.inactive')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    <button
                                                        onClick={() => handleUserStatusUpdate(user._id, user.isActive)}
                                                        className="btn btn-outline"
                                                        style={{ padding: '6px 12px', fontSize: '12px', minHeight: 0 }}
                                                    >
                                                        {user.isActive ? t('admin.deactivate') : t('admin.activate')}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        className="btn btn-danger"
                                                        style={{ padding: '6px 12px', fontSize: '12px', minHeight: 0 }}
                                                    >
                                                        {t('admin.delete')}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ padding: '12px 16px', fontSize: '13px', color: '#9ca3af', borderTop: '1px solid #f0f0f0' }}>
                            {t('admin.showing_users', { count: users.length, total: allUsers.length })}
                        </div>
                    </div>
                </div>
            )}

            {/* Moderation Tab */}
            {activeTab === 'moderation' && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <h3 style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', fontSize: '16px', fontWeight: 700 }}>🚩 {t('admin.moderation_title')}</h3>
                    {flaggedReviews.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>✅ {t('admin.no_moderation')}</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb' }}>
                                        {[t('admin.product'), t('admin.reviewer'), t('admin.rating'), t('admin.comment'), t('admin.date')].map(h => (
                                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {flaggedReviews.map((review) => (
                                        <tr key={review._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600 }}>{review.productId?.name || 'N/A'}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{review.userId?.name || 'N/A'}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{ background: '#fef9c3', color: '#78350f', padding: '3px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>{review.rating} ⭐</span>
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{review.comment}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '12px', color: '#9ca3af' }}>{new Date(review.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
