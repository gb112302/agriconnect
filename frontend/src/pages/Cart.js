import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import './Cart.css';

function Cart() {
    const { t } = useTranslation();
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [clearConfirm, setClearConfirm] = useState(false);

    const handleRemove = (item) => {
        removeFromCart(item._id);
        toast.success(t('cart.removed_toast', { name: item.name }));
    };

    const handleClear = () => {
        clearCart();
        toast(t('cart.cleared_toast'), { icon: '🗑️' });
        setClearConfirm(false);
    };

    if (cart.length === 0) {
        return (
            <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
                <div className="cart-empty-state">
                    <div className="cart-empty-icon">🛒</div>
                    <h2>{t('cart.empty')}</h2>
                    <p>{t('cart.empty_sub')}</p>
                    <Link to="/products" className="btn btn-primary">{t('footer.browse_products')}</Link>
                </div>
            </div>
        );
    }

    const subtotal = getCartTotal();
    const delivery = subtotal > 500 ? 0 : 49;
    const total = subtotal + delivery;

    return (
        <div className="container" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
            <div className="cart-page-header">
                <h1>🛒 {t('cart.title')} <span className="cart-count-badge">
                    {t('cart.item_count', { count: cart.length })}
                </span></h1>
                <button
                    className="btn btn-outline"
                    onClick={() => setClearConfirm(true)}
                    style={{ fontSize: '13px', padding: '8px 14px', minHeight: 0 }}
                >
                    🗑️ {t('cart.clear_btn')}
                </button>
            </div>

            {clearConfirm && (
                <div className="cart-confirm-bar">
                    <span>{t('cart.clear_confirm')}</span>
                    <button className="btn btn-danger" style={{ padding: '6px 14px', fontSize: '13px', minHeight: 0 }} onClick={handleClear}>{t('cart.clear_yes')}</button>
                    <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '13px', minHeight: 0 }} onClick={() => setClearConfirm(false)}>{t('cart.clear_cancel')}</button>
                </div>
            )}

            <div className="cart-layout">
                {/* Items */}
                <div className="cart-items-col">
                    {cart.map((item) => (
                        <div key={item._id} className="cart-card">
                            {/* Product Image */}
                            <div className="cart-img">
                                {item.images?.length > 0 ? (
                                    <img src={item.images[0].url} alt={item.name} />
                                ) : (
                                    <div className="cart-img-fallback">🌿</div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="cart-card-info">
                                <h3>{item.name}</h3>
                                <p className="cart-card-unit">₹{item.price} / {item.unit}</p>
                                {item.farmer?.name && (
                                    <p className="cart-card-farmer">🧑‍🌾 {item.farmer.name}</p>
                                )}
                            </div>

                            {/* Quantity Controls */}
                            <div className="cart-qty-controls">
                                <button
                                    className="qty-btn"
                                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                >−</button>
                                <span className="qty-value">{item.quantity}</span>
                                <button
                                    className="qty-btn"
                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                >+</button>
                            </div>

                            {/* Subtotal + Remove */}
                            <div className="cart-card-right">
                                <span className="cart-item-total">₹{(item.price * item.quantity).toFixed(2)}</span>
                                <button
                                    className="cart-remove-btn"
                                    onClick={() => handleRemove(item)}
                                    aria-label={t('cart.remove')}
                                >✕</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="cart-summary-col">
                    <div className="cart-summary card">
                        <h3>📋 {t('cart.summary')}</h3>
                        <div className="summary-row">
                            <span>{t('cart.subtotal')} ({t('cart.item_count', { count: cart.length })})</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>{t('cart.delivery')}</span>
                            <span className={delivery === 0 ? 'free-delivery' : ''}>
                                {delivery === 0 ? `✅ ${t('cart.free_delivery')}` : `₹${delivery}`}
                            </span>
                        </div>
                        {delivery > 0 && (
                            <p className="free-delivery-hint">{t('cart.free_delivery_hint', { amount: (500 - subtotal).toFixed(0) })}</p>
                        )}
                        <div className="summary-divider" />
                        <div className="summary-row summary-total">
                            <span>{t('cart.total')}</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '16px', fontSize: '16px', padding: '14px' }}
                            onClick={() => navigate('/checkout')}
                        >
                            {t('cart.checkout')}
                        </button>
                        <Link to="/products" className="btn btn-outline" style={{ display: 'block', textAlign: 'center', marginTop: '10px', textDecoration: 'none' }}>
                            ← {t('cart.continue')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;
