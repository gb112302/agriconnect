import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import LanguageSelector from './LanguageSelector';
import Notifications from './Notifications';

function Navbar() {
    const { t } = useTranslation();
    const { isAuthenticated, user, logout } = useAuth();
    const { getCartCount } = useCart();
    const { darkMode, toggleDarkMode } = useTheme();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMenuOpen(false);
    };

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav>
            <div className="nav-container">
                <Link to="/" className="logo" onClick={closeMenu}>
                    {t('app_name')}
                </Link>

                {/* Right-side controls */}
                <div className="nav-controls">
                    {/* Dark mode toggle */}
                    <button
                        className="theme-toggle"
                        onClick={toggleDarkMode}
                        aria-label="Toggle dark mode"
                        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>

                    {/* Notification bell (authenticated only) */}
                    {isAuthenticated && <Notifications />}

                    {/* Hamburger toggle (mobile) */}
                    <button
                        className={`hamburger${menuOpen ? ' open' : ''}`}
                        onClick={() => setMenuOpen(prev => !prev)}
                        aria-label="Toggle navigation menu"
                        aria-expanded={menuOpen}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>

                {/* Nav links */}
                <ul className={`nav-links${menuOpen ? ' nav-open' : ''}`}>
                    {!isAuthenticated ? (
                        <>
                            <li><Link to="/" onClick={closeMenu}>{t('nav.home')}</Link></li>
                            <li><Link to="/crop-prices" onClick={closeMenu}>📈 {t('nav_extra.crop_prices')}</Link></li>
                            <li><Link to="/weather" onClick={closeMenu}>🌦️ {t('nav_extra.weather')}</Link></li>
                            <li><Link to="/farming-tips" onClick={closeMenu}>🌱 {t('nav_extra.farm_tips')}</Link></li>
                            <li><Link to="/login" onClick={closeMenu}>{t('nav.login')}</Link></li>
                            <li><Link to="/register" onClick={closeMenu}>{t('nav.register')}</Link></li>
                            <li><LanguageSelector /></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/dashboard" onClick={closeMenu}>{t('nav.dashboard')}</Link></li>
                            <li><Link to="/products" onClick={closeMenu}>{t('nav.products')}</Link></li>
                            <li><Link to="/crop-prices" onClick={closeMenu}>📈 {t('nav_extra.crop_prices')}</Link></li>
                            <li><Link to="/weather" onClick={closeMenu}>🌦️ {t('nav_extra.weather')}</Link></li>
                            <li><Link to="/farming-tips" onClick={closeMenu}>🌱 {t('nav_extra.farm_tips')}</Link></li>
                            {user?.role === 'buyer' && (
                                <li>
                                    <Link to="/cart" onClick={closeMenu}>
                                        🛒 {t('nav.cart')} ({getCartCount()})
                                    </Link>
                                </li>
                            )}
                            {user?.role === 'buyer' && (
                                <li><Link to="/wishlist" onClick={closeMenu}>❤️ {t('nav.wishlist')}</Link></li>
                            )}
                            <li><Link to="/orders" onClick={closeMenu}>📦 {t('nav.orders')}</Link></li>
                            {user?.role === 'farmer' && (
                                <li><Link to="/analytics" onClick={closeMenu}>📊 {t('nav.analytics')}</Link></li>
                            )}
                            {user?.role === 'admin' && (
                                <li><Link to="/admin" onClick={closeMenu}>🛡️ {t('nav.admin')}</Link></li>
                            )}
                            <li><Link to="/profile" onClick={closeMenu}>🧑 {t('nav.profile')}</Link></li>
                            <li>
                                <span className="nav-user-greeting">
                                    {user?.name} {user?.role && `· ${t(`roles.${user.role}`)}`}
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
