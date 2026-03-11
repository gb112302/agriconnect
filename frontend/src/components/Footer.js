import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';

function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">

                    {/* Brand Section */}
                    <div className="footer-section">
                        <h3 className="footer-brand">🌾 {t('app_name')}</h3>
                        <p className="footer-desc">
                            {t('footer.desc')}
                        </p>
                    </div>

                    {/* Contact Support */}
                    <div className="footer-section">
                        <h3 className="footer-title">📞 {t('footer.contact_support')}</h3>
                        <div className="footer-links">
                            <a href="tel:+919016614829" className="footer-link">
                                📱 +91 90166 14829
                            </a>
                            <a href="mailto:gb2302gb@gmail.com" className="footer-link">
                                📧 gb2302gb@gmail.com
                            </a>
                            <a href="https://wa.me/919016614829" target="_blank" rel="noopener noreferrer" className="footer-link footer-whatsapp">
                                💬 {t('footer.whatsapp_support')}
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h3 className="footer-title">🔗 {t('footer.quick_links')}</h3>
                        <div className="footer-links">
                            <Link to="/products" className="footer-link">→ {t('footer.browse_products')}</Link>
                            <Link to="/register" className="footer-link">→ {t('footer.register_farmer')}</Link>
                            <Link to="/register" className="footer-link">→ {t('footer.register_buyer')}</Link>
                            <Link to="/login" className="footer-link">→ {t('nav.login')}</Link>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} {t('app_name')}. {t('footer.all_rights')}</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
