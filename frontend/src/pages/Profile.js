import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Profile.css';

function Profile() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        state: user?.location?.state || '',
        district: user?.location?.district || '',
    });

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        // In a real app, call authAPI.updateProfile(form)
        toast.success(t('profile.updated_toast'));
        setEditing(false);
    };

    const ROLE_CONFIG = {
        farmer: { emoji: '🧑‍🌾', color: '#2e7d32', bg: '#f0fdf4' },
        buyer:  { emoji: '🛒',    color: '#1976d2', bg: '#eff6ff' },
        admin:  { emoji: '🛡️',   color: '#7b1fa2', bg: '#fdf4ff' },
    };
    const rc = ROLE_CONFIG[user?.role] || ROLE_CONFIG.buyer;

    return (
        <div className="profile-page">
            {/* Profile Hero */}
            <div className="profile-hero" style={{ background: `linear-gradient(135deg, #1b5e20, #2e7d32)` }}>
                <div className="profile-avatar" style={{ background: rc.bg, color: rc.color }}>
                    {rc.emoji}
                </div>
                <div className="profile-hero-info">
                    <h1>{user?.name}</h1>
                    {user?.role && (
                        <span className="profile-role-badge" style={{ background: rc.bg, color: rc.color }}>
                            {t(`roles.${user.role}`)}
                        </span>
                    )}
                    <p>📧 {user?.email}</p>
                    {user?.location?.district && (
                        <p>📍 {user.location.district}, {user.location.state}</p>
                    )}
                </div>
            </div>

            <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
                <div className="profile-card card">
                    <div className="profile-card-header">
                        <h2>👤 {t('profile.title')}</h2>
                        {!editing && (
                            <button className="btn btn-outline" onClick={() => setEditing(true)}>
                                ✏️ {t('profile.edit_btn')}
                            </button>
                        )}
                    </div>

                    {!editing ? (
                        <div className="profile-info-grid">
                            <div className="profile-info-item">
                                <span className="profile-label">{t('profile.full_name')}</span>
                                <span className="profile-value">{user?.name || '—'}</span>
                            </div>
                            <div className="profile-info-item">
                                <span className="profile-label">{t('profile.email')}</span>
                                <span className="profile-value">{user?.email || '—'}</span>
                            </div>
                            <div className="profile-info-item">
                                <span className="profile-label">{t('profile.phone')}</span>
                                <span className="profile-value">{user?.phone || '—'}</span>
                            </div>
                            <div className="profile-info-item">
                                <span className="profile-label">{t('profile.role')}</span>
                                <span className="profile-value" style={{ textTransform: 'capitalize', color: rc.color, fontWeight: 700 }}>
                                    {user?.role ? t(`roles.${user.role}`) : '—'}
                                </span>
                            </div>
                            <div className="profile-info-item">
                                <span className="profile-label">{t('profile.state')}</span>
                                <span className="profile-value">{user?.location?.state || '—'}</span>
                            </div>
                            <div className="profile-info-item">
                                <span className="profile-label">{t('profile.district')}</span>
                                <span className="profile-value">{user?.location?.district || '—'}</span>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} className="profile-edit-form">
                            <div className="modal-grid">
                                <div className="form-group">
                                    <label>{t('profile.full_name')}</label>
                                    <input name="name" value={form.name} onChange={handleChange} placeholder={t('profile.placeholder_name')} />
                                </div>
                                <div className="form-group">
                                    <label>{t('profile.phone')}</label>
                                    <input name="phone" value={form.phone} onChange={handleChange} placeholder={t('profile.placeholder_phone')} />
                                </div>
                                <div className="form-group">
                                    <label>{t('profile.state')}</label>
                                    <input name="state" value={form.state} onChange={handleChange} placeholder={t('profile.state')} />
                                </div>
                                <div className="form-group">
                                    <label>{t('profile.district')}</label>
                                    <input name="district" value={form.district} onChange={handleChange} placeholder={t('profile.district')} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                                <button type="submit" className="btn btn-primary">{t('profile.save_btn')}</button>
                                <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>{t('profile.cancel_btn')}</button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Quick links */}
                <div className="profile-quick-links">
                    <h3>{t('profile.quick_actions')}</h3>
                    <div className="pql-grid">
                        {[
                            { icon: '📦', label: t('nav.orders'), link: '/orders' },
                            { icon: '❤️', label: t('nav.wishlist'), link: '/wishlist' },
                            { icon: '💬', label: t('dashboard_page.messages'), link: '/chat' },
                            { icon: '🏠', label: t('nav.dashboard'), link: '/dashboard' },
                        ].map(item => (
                            <button key={item.link} className="pql-btn" onClick={() => navigate(item.link)}>
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
