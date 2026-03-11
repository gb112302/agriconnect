import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';

function Dashboard() {
    const { user } = useAuth();
    const { t } = useTranslation();

    const farmerCards = [
        { icon: '🌾', label: t('dashboard_page.my_products'),  desc: t('dashboard_page.manage_listings'), link: '/products'  },
        { icon: '📦', label: t('dashboard_page.orders'),       desc: t('dashboard_page.view_orders'),     link: '/orders'    },
        { icon: '💬', label: t('dashboard_page.messages'),     desc: t('dashboard_page.chat_buyers'),     link: '/chat'      },
        { icon: '📊', label: t('dashboard_page.analytics'),    desc: t('dashboard_page.revenue'),         link: '/analytics' },
    ];

    const buyerCards = [
        { icon: '🛍️', label: t('dashboard_page.browse_products'), desc: t('dashboard_page.shop_fresh'),   link: '/products' },
        { icon: '❤️', label: t('dashboard_page.wishlist'),        desc: t('dashboard_page.saved_items'),   link: '/wishlist' },
        { icon: '📦', label: t('dashboard_page.my_orders'),       desc: t('dashboard_page.track_orders'),  link: '/orders'   },
        { icon: '💬', label: t('dashboard_page.messages'),        desc: t('dashboard_page.chat_farmers'),  link: '/chat'     },
    ];

    const cards = user?.role === 'farmer' ? farmerCards : buyerCards;
    const accent = user?.role === 'farmer' ? '#2e7d32' : '#1976d2';

    return (
        <div className="dashboard-page">
            {/* Welcome Banner */}
            <div className="db-banner">
                <div className="db-banner-inner">
                    <div className="db-avatar">{user?.role === 'farmer' ? '🧑‍🌾' : '🛒'}</div>
                    <div>
                        <h1>{t('dashboard_page.welcome_back')}, <span>{user?.name}!</span></h1>
                        <p>
                            {user?.role === 'farmer'
                                ? t('dashboard_page.farmer_desc')
                                : t('dashboard_page.buyer_desc')}
                        </p>
                        <div className="db-meta">
                            <span>📧 {user?.email}</span>
                            {user?.location?.district && (
                                <span>📍 {user?.location?.district}, {user?.location?.state}</span>
                            )}
                            <span className="db-role-pill">{user?.role}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Access Cards */}
            <div className="container">
                <h2 className="db-section-title">{t('dashboard_page.quick_access')}</h2>
                <div className="db-cards-grid">
                    {cards.map(card => (
                        <Link to={card.link} key={card.label} className="db-card" style={{ '--accent': accent }}>
                            <span className="db-card-icon">{card.icon}</span>
                            <h3>{card.label}</h3>
                            <p>{card.desc}</p>
                            <span className="db-card-arrow">→</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
