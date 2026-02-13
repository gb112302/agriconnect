import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Navbar() {
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
                    AgriConnect
                </Link>
                <ul className="nav-links">
                    {!isAuthenticated ? (
                        <>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/register">Register</Link></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/dashboard">Dashboard</Link></li>
                            <li><Link to="/products">Products</Link></li>
                            {user?.role === 'buyer' && (
                                <li>
                                    <Link to="/cart">
                                        Cart ({getCartCount()})
                                    </Link>
                                </li>
                            )}
                            <li>
                                <span style={{ color: 'white', marginRight: '10px' }}>
                                    {user?.name} ({user?.role})
                                </span>
                            </li>
                            <li>
                                <button onClick={handleLogout}>Logout</button>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
