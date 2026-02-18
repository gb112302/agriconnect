import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">

                    {/* Brand Section */}
                    <div className="footer-section">
                        <h3 className="footer-brand">🌾 AgriConnect</h3>
                        <p className="footer-desc">
                            Connecting farmers directly with buyers. Fresh produce, fair prices, sustainable farming.
                        </p>
                    </div>

                    {/* Contact Support */}
                    <div className="footer-section">
                        <h3 className="footer-title">📞 Contact Support</h3>
                        <div className="footer-links">
                            <a href="tel:+919016614829" className="footer-link">
                                📱 +91 90166 14829
                            </a>
                            <a href="mailto:gb2302gb@gmail.com" className="footer-link">
                                📧 gb2302gb@gmail.com
                            </a>
                            <a href="https://wa.me/919016614829" target="_blank" rel="noopener noreferrer" className="footer-link footer-whatsapp">
                                💬 WhatsApp Support
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h3 className="footer-title">🔗 Quick Links</h3>
                        <div className="footer-links">
                            <Link to="/products" className="footer-link">→ Browse Products</Link>
                            <Link to="/register" className="footer-link">→ Register as Farmer</Link>
                            <Link to="/register" className="footer-link">→ Register as Buyer</Link>
                            <Link to="/login" className="footer-link">→ Login</Link>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} AgriConnect. All rights reserved. | Made with 🌾 for Indian Farmers</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
