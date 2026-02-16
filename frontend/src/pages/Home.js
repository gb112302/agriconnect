import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

function Home() {
    const { isAuthenticated } = useAuth();
    const { t } = useTranslation();

    return (
        <div>
            <div className="hero">
                <h1>{t('app_name')}</h1>
                <p>{t('tagline')}</p>
                <p>{t('dashboard.farmer_welcome')} & {t('dashboard.buyer_welcome')}</p>
                {!isAuthenticated && (
                    <div style={{ marginTop: '30px' }}>
                        <Link to="/register" className="btn btn-primary" style={{ marginRight: '10px', textDecoration: 'none' }}>
                            {t('nav.register')}
                        </Link>
                        <Link to="/login" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                            {t('nav.login')}
                        </Link>
                    </div>
                )}
            </div>

            <div className="container">
                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <h2>How It Works</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginTop: '30px' }}>
                        <div className="card">
                            <h3>🌾 {t('dashboard.farmer_welcome')}</h3>
                            <p>List your products, set your prices, and reach buyers directly</p>
                        </div>
                        <div className="card">
                            <h3>🛒 {t('dashboard.buyer_welcome')}</h3>
                            <p>Browse fresh produce, place orders, and support local farmers</p>
                        </div>
                        <div className="card">
                            <h3>📦 Bulk Orders</h3>
                            <p>Request bulk quantities and get competitive quotes from farmers</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
