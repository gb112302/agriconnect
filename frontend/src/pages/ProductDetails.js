import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsAPI, wishlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Reviews from '../components/Reviews';
import toast from 'react-hot-toast';
import './ProductDetails.css';

const TABS = ['Description', 'Details', 'Reviews'];

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [inWishlist, setInWishlist] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('Description');
    const { user } = useAuth();
    const { addToCart } = useCart();

    useEffect(() => {
        fetchProduct();
        if (user) checkWishlistStatus();
    }, [id, user]);

    const fetchProduct = async () => {
        try {
            const response = await productsAPI.getById(id);
            setProduct(response.data.product);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const checkWishlistStatus = async () => {
        try {
            const response = await wishlistAPI.get();
            setInWishlist((response.data.wishlist || []).some(item => item._id === id));
        } catch {}
    };

    const handleAddToCart = () => {
        if (product) {
            for (let i = 0; i < quantity; i++) addToCart(product);
            toast.success(`🛒 ${product.name} ×${quantity} added to cart!`);
        }
    };

    const handleToggleWishlist = async () => {
        try {
            if (inWishlist) {
                await wishlistAPI.remove(id);
                setInWishlist(false);
                toast('Removed from wishlist', { icon: '💔' });
            } else {
                await wishlistAPI.add(id);
                setInWishlist(true);
                toast.success('❤️ Added to wishlist!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update wishlist');
        }
    };

    if (loading) return <div className="loading">Loading product details...</div>;
    if (error)   return <div className="error" style={{ padding: '40px', textAlign: 'center' }}>{error}</div>;
    if (!product) return <div style={{ padding: '40px', textAlign: 'center' }}>Product not found</div>;

    const hasImages = product.images?.length > 0;
    const inStock = product.isAvailable && product.stockQuantity > 0;

    return (
        <div className="container" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
            {/* Breadcrumb */}
            <nav className="breadcrumb">
                <Link to="/products">Products</Link>
                <span>›</span>
                <span>{product.category}</span>
                <span>›</span>
                <span>{product.name}</span>
            </nav>

            <div className="pd-layout">
                {/* ── Left: Image Gallery ── */}
                <div className="pd-gallery">
                    <div className="pd-main-img">
                        {hasImages ? (
                            <img src={product.images[selectedImage]?.url} alt={product.name} />
                        ) : (
                            <div className="pd-no-img">🌿</div>
                        )}
                        <span className={`pd-stock-badge ${inStock ? 'in' : 'out'}`}>
                            {inStock ? '✓ In Stock' : '✕ Out of Stock'}
                        </span>
                    </div>
                    {hasImages && product.images.length > 1 && (
                        <div className="pd-thumbs">
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    className={`pd-thumb ${selectedImage === i ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(i)}
                                >
                                    <img src={img.url} alt={`Thumbnail ${i}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Right: Info ── */}
                <div className="pd-info">
                    <div className="pd-category-pill">{product.category}</div>
                    <div className="pd-name-row">
                        <h1>{product.name}</h1>
                        {user && (
                            <button
                                className={`pd-wishlist-btn ${inWishlist ? 'active' : ''}`}
                                onClick={handleToggleWishlist}
                                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                                {inWishlist ? '❤️' : '🤍'}
                            </button>
                        )}
                    </div>

                    {product.averageRating > 0 && (
                        <div className="pd-rating">
                            {'★'.repeat(Math.round(product.averageRating))}{'☆'.repeat(5 - Math.round(product.averageRating))}
                            <span>{product.averageRating.toFixed(1)}</span>
                            <span className="pd-review-count">({product.numReviews} reviews)</span>
                        </div>
                    )}

                    <div className="pd-price-row">
                        <span className="pd-price">₹{product.price}</span>
                        <span className="pd-unit">per {product.unit}</span>
                    </div>

                    <div className="pd-meta-grid">
                        <div className="pd-meta-item">
                            <span className="pd-meta-label">Available</span>
                            <span className="pd-meta-value">{product.stockQuantity} {product.unit}</span>
                        </div>
                        {product.subcategory && (
                            <div className="pd-meta-item">
                                <span className="pd-meta-label">Subcategory</span>
                                <span className="pd-meta-value">{product.subcategory}</span>
                            </div>
                        )}
                    </div>

                    {/* Farmer */}
                    {product.farmerId && (
                        <div className="pd-farmer-card">
                            <span className="pd-farmer-avatar">🧑‍🌾</span>
                            <div>
                                <span className="pd-farmer-name">{product.farmerId?.name}</span>
                                <span className="pd-farmer-location">
                                    📍 {product.farmerId?.location?.district}, {product.farmerId?.location?.state}
                                </span>
                            </div>
                            <Link to={`/farmer/${product.farmerId?._id}`} className="btn-outline-green" style={{ marginLeft: 'auto', fontSize: '12px', padding: '6px 12px' }}>
                                View Profile
                            </Link>
                        </div>
                    )}

                    {/* Quantity + CTA */}
                    {user?.role === 'buyer' && inStock && (
                        <div className="pd-buy-row">
                            <div className="cart-qty-controls" style={{ borderRadius: '10px' }}>
                                <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                                <span className="qty-value">{quantity}</span>
                                <button className="qty-btn" onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}>+</button>
                            </div>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 1, fontSize: '15px', padding: '14px' }}
                                onClick={handleAddToCart}
                            >
                                🛒 Add to Cart — ₹{(product.price * quantity).toFixed(2)}
                            </button>
                        </div>
                    )}
                    {!inStock && <div style={{ color: '#ef4444', fontWeight: 600, padding: '12px 0' }}>⚠️ This product is currently out of stock.</div>}
                    {!user && (
                        <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }} onClick={() => navigate('/login')}>
                            🔑 Login to Buy
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="pd-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        className={`pd-tab${activeTab === tab ? ' active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="pd-tab-content card">
                {activeTab === 'Description' && (
                    <p style={{ lineHeight: 1.8, color: '#374151' }}>{product.description || 'No description available.'}</p>
                )}
                {activeTab === 'Details' && (
                    <div className="pd-details-grid">
                        {[
                            ['Category', product.category],
                            ['Subcategory', product.subcategory],
                            ['Unit', product.unit],
                            ['Stock', `${product.stockQuantity} ${product.unit}`],
                            ['Price', `₹${product.price} / ${product.unit}`],
                            ['Availability', inStock ? 'In Stock' : 'Out of Stock'],
                        ].filter(([, v]) => v).map(([k, v]) => (
                            <div key={k} className="pd-detail-row">
                                <span className="pd-detail-key">{k}</span>
                                <span className="pd-detail-val">{v}</span>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'Reviews' && (
                    <Reviews
                        productId={product._id}
                        averageRating={product.averageRating}
                        numReviews={product.numReviews}
                        onReviewAdded={fetchProduct}
                    />
                )}
            </div>
        </div>
    );
}

export default ProductDetails;
