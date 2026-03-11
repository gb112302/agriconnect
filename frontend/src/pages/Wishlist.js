import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { wishlistAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Wishlist.css';

function Wishlist() {
    const { t } = useTranslation();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();

    useEffect(() => {
        if (isAuthenticated) fetchWishlist();
    }, [isAuthenticated]);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const response = await wishlistAPI.get();
            setWishlist(response.data.wishlist || []);
        } catch (err) {
            setError(err.response?.data?.message || t('wishlist.error', { defaultValue: 'Failed to load wishlist' }));
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId, name) => {
        try {
            await wishlistAPI.remove(productId);
            setWishlist(wishlist.filter(item => item._id !== productId));
            toast.success(t('wishlist.removed_toast', { name, defaultValue: `${name} removed from wishlist` }));
        } catch (err) {
            toast.error(err.response?.data?.message || t('wishlist.remove_error', { defaultValue: 'Failed to remove item' }));
        }
    };

    const handleMoveToCart = (product) => {
        addToCart(product);
        toast.success(`🛒 ${t('wishlist.moved_toast', { name: product.name, defaultValue: `${product.name} moved to cart!` })}`);
    };

    if (loading) return <div className="loading">{t('wishlist.loading', { defaultValue: 'Loading wishlist...' })}</div>;

    return (
        <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px' }}>
            <h1 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 800, color: '#1b5e20', marginBottom: '24px' }}>
                ❤️ {t('wishlist.title')}
            </h1>

            {error && <div className="error">{error}</div>}

            {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: '56px', marginBottom: '16px' }}>💔</div>
                    <h3 style={{ color: '#374151', marginBottom: '8px' }}>{t('wishlist.empty')}</h3>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>{t('wishlist.desc')}</p>
                    <a href="/products" className="btn btn-primary">{t('wishlist.browse_products')}</a>
                </div>
            ) : (
                <div className="wishlist-grid">
                    {wishlist.map((product) => (
                        <div key={product._id} className="wishlist-item">
                            <div className="product-image">
                                {product.images?.length > 0 ? (
                                    <img src={product.images[0].url} alt={product.name} />
                                ) : (
                                    <div className="no-image">🌿</div>
                                )}
                            </div>
                            <div className="product-info">
                                <h3>{product.name}</h3>
                                <p className="product-price">₹{product.price}/{product.unit}</p>
                                <p className="product-category">{product.category}</p>
                                {product.averageRating > 0 && (
                                    <div className="product-rating">
                                        ⭐ {product.averageRating.toFixed(1)} ({t('wishlist.reviews', { count: product.numReviews })})
                                    </div>
                                )}
                                <p className={`product-stock-tag ${product.stockQuantity > 0 ? 'in-stock' : 'out-stock'}`}>
                                    {product.stockQuantity > 0 
                                        ? `✓ ${t('wishlist.in_stock', { count: product.stockQuantity })}` 
                                        : `✕ ${t('wishlist.out_stock')}`}
                                </p>
                            </div>
                            <div className="wishlist-actions">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleMoveToCart(product)}
                                    disabled={product.stockQuantity <= 0}
                                >
                                    🛒 {t('wishlist.move_to_cart')}
                                </button>
                                <a href={`/products/${product._id}`} className="btn btn-outline">{t('wishlist.view_product')}</a>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleRemove(product._id, product.name)}
                                >
                                    ✕ {t('wishlist.remove')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Wishlist;
