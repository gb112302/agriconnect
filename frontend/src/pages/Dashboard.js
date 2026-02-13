import React from 'react';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="container">
            <h1>Welcome, {user?.name}!</h1>
            <div className="card">
                <h2>Your Dashboard</h2>
                <p><strong>Role:</strong> {user?.role}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Phone:</strong> {user?.phone}</p>
                <p><strong>Location:</strong> {user?.location?.district}, {user?.location?.state}</p>
            </div>

            <div style={{ marginTop: '30px' }}>
                {user?.role === 'farmer' ? (
                    <div className="card">
                        <h3>Farmer Dashboard</h3>
                        <p>Manage your products, view orders, and respond to bulk requests.</p>
                        <button className="btn btn-primary" onClick={() => window.location.href = '/products'}>
                            Manage Products
                        </button>
                    </div>
                ) : (
                    <div className="card">
                        <h3>Buyer Dashboard</h3>
                        <p>Browse products, manage your cart, and place orders.</p>
                        <button className="btn btn-primary" onClick={() => window.location.href = '/products'}>
                            Browse Products
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
