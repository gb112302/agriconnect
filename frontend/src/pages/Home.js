import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

function Home() {
    const { isAuthenticated } = useAuth();
    const { t } = useTranslation();

    const CATEGORIES = [
        { icon: '🍅', label: t('home.browse_category') !== 'Browse by Category' ? 'Vegetables'  : 'Vegetables',  key: 'Vegetables',  color: '#ef4444' },
        { icon: '🍎', key: 'Fruits',      color: '#f59e0b' },
        { icon: '🌾', key: 'Grains',      color: '#84cc16' },
        { icon: '🥛', key: 'Dairy',       color: '#06b6d4' },
        { icon: '🌿', key: 'Herbs',       color: '#10b981' },
        { icon: '🫘', key: 'Pulses',      color: '#8b5cf6' },
        { icon: '🌻', key: 'Oilseeds',   color: '#f97316' },
        { icon: '🍯', key: 'Honey',       color: '#eab308' },
    ];

    const WHY_ITEMS = [
        { icon: '🚜', title: t('home.why_direct'),   desc: t('home.why_direct_desc') },
        { icon: '✅', title: t('home.why_verified'), desc: t('home.why_verified_desc') },
        { icon: '🔒', title: t('home.why_secure'),   desc: t('home.why_secure_desc') },
        { icon: '🚚', title: t('home.why_fast'),     desc: t('home.why_fast_desc') },
    ];

    const STATS = [
        ['5,000+', t('home.stats_farmers')],
        ['12,000+', t('home.stats_buyers')],
        ['₹2Cr+', t('home.stats_trade')],
        ['28', t('home.stats_states')],
    ];

    return (
        <div>
            {/* ── Hero ── */}
            <div className="hero">
                <h1>{t('app_name')}</h1>
                <p>{t('tagline')}</p>
                <p style={{ fontSize: '15px', opacity: 0.8 }}>
                    {t('dashboard.farmer_welcome')} &amp; {t('dashboard.buyer_welcome')}
                </p>

                {!isAuthenticated && (
                    <div className="hero-actions">
                        <Link to="/register" className="btn btn-primary">🚜 {t('nav.register')}</Link>
                        <Link to="/login"    className="btn btn-secondary">🔑 {t('nav.login')}</Link>
                    </div>
                )}

                {/* Stats Strip */}
                <div className="stats-strip">
                    {STATS.map(([n, l]) => (
                        <div key={l} className="stat-item">
                            <span className="stat-number">{n}</span>
                            <span className="stat-label">{l}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Browse by Category ── */}
            <div className="container">
                <div className="home-section">
                    <h2 className="home-section-title">{t('home.browse_category')}</h2>
                    <p className="home-section-sub">{t('home.browse_sub')}</p>
                    <div className="category-grid">
                        {CATEGORIES.map(cat => (
                            <Link
                                to={`/products?category=${cat.key}`}
                                key={cat.key}
                                className="category-card"
                                style={{ '--cat-color': cat.color }}
                            >
                                <span className="category-icon">{cat.icon}</span>
                                <span className="category-label">{cat.key}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ── How It Works ── */}
                <div className="how-it-works">
                    <h2>{t('home.how_it_works')}</h2>
                    <div className="hiw-grid">
                        <div className="hiw-card">
                            <span className="card-icon">🌾</span>
                            <h3>{t('dashboard.farmer_welcome')}</h3>
                            <p>{t('home.hiw_farmer_desc')}</p>
                        </div>
                        <div className="hiw-card">
                            <span className="card-icon">🛒</span>
                            <h3>{t('dashboard.buyer_welcome')}</h3>
                            <p>{t('home.hiw_buyer_desc')}</p>
                        </div>
                        <div className="hiw-card">
                            <span className="card-icon">📦</span>
                            <h3>{t('home.hiw_bulk')}</h3>
                            <p>{t('home.hiw_bulk_desc')}</p>
                        </div>
                    </div>
                </div>

                {/* ── Why Choose Us ── */}
                <div className="home-section">
                    <h2 className="home-section-title">{t('home.why_title')}</h2>
                    <p className="home-section-sub">{t('home.why_sub')}</p>
                    <div className="why-grid">
                        {WHY_ITEMS.map(item => (
                            <div key={item.title} className="why-card">
                                <div className="why-icon">{item.icon}</div>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── CTA Banner ── */}
                {!isAuthenticated && (
                    <div className="cta-banner">
                        <h2>{t('home.cta_title')}</h2>
                        <p>{t('home.cta_sub')}</p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
                            <Link to="/register?role=farmer" className="btn btn-primary">🌾 {t('home.join_farmer')}</Link>
                            <Link to="/register?role=buyer"  className="btn btn-secondary">🛒 {t('home.join_buyer')}</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;
