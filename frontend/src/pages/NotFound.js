import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
    const navigate = useNavigate();
    return (
        <div className="nf-page">
            <div className="nf-content">
                <div className="nf-number">404</div>
                <div className="nf-icon">🌾</div>
                <h1>Oops! Page Not Found</h1>
                <p>The page you're looking for seems to have been harvested already.</p>
                <div className="nf-actions">
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>← Go Back</button>
                    <Link to="/" className="btn btn-outline">🏠 Home</Link>
                    <Link to="/products" className="btn btn-outline">🛒 Products</Link>
                </div>
            </div>
        </div>
    );
}

export default NotFound;
