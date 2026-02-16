import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import LanguageSelector from './LanguageSelector';

function Navbar() {
    const { t } = useTranslation();
    const { isAuthenticated, user, logout } = useAuth();
    const { getCartCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav>
            <div className="nav-container">
                <Link to="/" className="logo">
                    {t('app_name')}
                </Link>
                <ul className="nav-links">
                    {!isAuthenticated ? (
                        <>
                            <li><Link to="/">{t('nav.home')}</Link></li>
                            <li><Link to="/login">{t('nav.login')}</Link></li>
                            <li><Link to="/register">{t('nav.register')}</Link></li>
                            <li><LanguageSelector /></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/dashboard">{t('nav.dashboard')}</Link></li>
                            <li><Link to="/products">{t('nav.products')}</Link></li>
                            {user?.role === 'buyer' && (
                                <li>
                                    <Link to="/cart">
                                        {t('nav.cart')} ({getCartCount()})
                                    </Link>
                                </li>
                            )}
                            <li>
                                <span style={{ color: 'white', marginRight: '10px' }}>
                                    {user?.name} ({user?.role})
                                </span>
                            </li>
                            <li>
                                <button onClick={handleLogout}>{t('nav.logout')}</button>
                            </li>
                            <li><LanguageSelector /></li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
