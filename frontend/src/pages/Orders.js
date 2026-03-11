import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function OrderTimeline({ status }) {
    const { t } = useTranslation();
    const TIMELINE_STEPS = [
        { key: 'pending',    icon: '📋', label: t('orders.timeline.pending') },
        { key: 'processing', icon: '⚙️', label: t('orders.timeline.processing') },
        { key: 'shipped',    icon: '🚚', label: t('orders.timeline.shipped') },
        { key: 'delivered',  icon: '✅', label: t('orders.timeline.delivered') },
    ];
    const current = TIMELINE_STEPS.findIndex(s => s.key === status);

    return (
        <div className="order-timeline">
            {TIMELINE_STEPS.map((step, i) => {
                const isDone   = i < current;
                const isActive = i === current;
                return (
                    <div key={step.key} className={`timeline-step${isDone ? ' done' : ''}${isActive ? ' active' : ''}`}>
                        <div className="timeline-dot">{isDone ? '✓' : step.icon}</div>
                        <div className="timeline-label">{step.label}</div>
                    </div>
                );
            })}
        </div>
    );
}

const STATUS_COLORS = {
    pending:    { bg: '#fef9c3', color: '#78350f' },
    processing: { bg: '#dbeafe', color: '#1e40af' },
    shipped:    { bg: '#ede9fe', color: '#5b21b6' },
    delivered:  { bg: '#dcfce7', color: '#14532d' },
    cancelled:  { bg: '#fee2e2', color: '#7f1d1d' },
};

function Orders() {
    const { t, i18n } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const { user } = useAuth();

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            let response;
            if (user.role === 'buyer') response = await ordersAPI.getBuyerOrders();
            else if (user.role === 'farmer') response = await ordersAPI.getFarmerOrders();
            setOrders(response.data.orders);
        } catch (err) {
            setError(t('orders.error'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">{t('orders.loading')}</div>;
    if (error) return <div className="error" style={{ padding: '40px', textAlign: 'center' }}>{error}</div>;

    const currentLang = i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'gu' ? 'gu-IN' : 'en-IN';

    return (
        <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px' }}>
            <h1 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 800, color: '#1b5e20', marginBottom: '24px' }}>
                {user.role === 'farmer' ? `📦 ${t('orders.received')}` : `📦 ${t('orders.title')}`}
            </h1>

            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '56px', marginBottom: '16px' }}>📭</div>
                    <h3 style={{ color: '#374151', marginBottom: '8px' }}>{t('orders.no_orders')}</h3>
                    {user.role === 'buyer' && (
                        <Link to="/products" className="btn btn-primary" style={{ marginTop: '16px', textDecoration: 'none' }}>
                            {t('orders.start_shopping')}
                        </Link>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {orders.map((order) => {
                        const statusStyle = STATUS_COLORS[order.status] || { bg: '#f3f4f6', color: '#374151' };
                        const isExpanded = expandedOrder === order._id;

                        return (
                            <div key={order._id} className="order-card card">
                                {/* Summary row */}
                                <div
                                    className="order-card-header"
                                    onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div>
                                        <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                                        <span className="order-date">
                                            {new Date(order.createdAt).toLocaleDateString(currentLang, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span className="order-amount">₹{order.totalAmount}</span>
                                        <span
                                            className="order-status-pill"
                                            style={{ background: statusStyle.bg, color: statusStyle.color }}
                                        >
                                            {t(`orders.timeline.${order.status}`, { defaultValue: order.status.charAt(0).toUpperCase() + order.status.slice(1) })}
                                        </span>
                                        <span style={{ color: '#9ca3af', fontSize: '18px' }}>{isExpanded ? '▲' : '▼'}</span>
                                    </div>
                                </div>

                                {/* Expanded Timeline + details */}
                                {isExpanded && order.status !== 'cancelled' && (
                                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px', marginTop: '4px' }}>
                                        <OrderTimeline status={order.status} />
                                        <div style={{ textAlign: 'right', marginTop: '12px' }}>
                                            <Link to={`/orders/${order._id}`} className="btn-outline-green">
                                                {t('orders.view_full')}
                                            </Link>
                                        </div>
                                    </div>
                                )}
                                {isExpanded && order.status === 'cancelled' && (
                                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px', marginTop: '4px', color: '#ef4444', fontSize: '14px', textAlign: 'center' }}>
                                        {t('orders.cancelled_msg')}
                                        <div style={{ textAlign: 'right', marginTop: '8px' }}>
                                            <Link to={`/orders/${order._id}`} className="btn-outline-green">{t('orders.view')}</Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Orders;
