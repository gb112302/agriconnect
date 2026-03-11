import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import './FarmerProfile.css';

function FarmerProfile() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Demo farmer data (replace with API call if endpoint exists)
    const farmer = {
        name: 'Ramesh Kumar',
        location: 'Nashik, Maharashtra',
        memberSince: 'January 2023',
        rating: 4.8,
        reviews: 127,
        products: 34,
        sales: 812,
        bio: 'Organic farmer specializing in fresh vegetables and seasonal fruits. 15+ years of experience in sustainable farming practices.',
        avatar: '🧑‍🌾',
        verified: true,
        badge: 'Top Seller',
    };

    useEffect(() => {
        const fetchFarmerProducts = async () => {
            try {
                const response = await productsAPI.getAll({ farmer: id });
                setProducts(response.data.products || []);
            } catch (err) {
                setError('Could not load products for this farmer.');
            } finally {
                setLoading(false);
            }
        };
        fetchFarmerProducts();
    }, [id]);

    const handleAddToCart = (product) => {
        addToCart(product);
        toast.success(`${product.name} added to cart!`);
    };

    return (
        <div className="farmer-profile-page">
            {/* Profile Header */}
            <div className="fp-hero">
                <div className="fp-avatar">{farmer.avatar}</div>
                <div className="fp-info">
                    <div className="fp-name-row">
                        <h1>{farmer.name}</h1>
                        {farmer.verified && <span className="fp-verified">✓ Verified</span>}
                        {farmer.badge && <span className="fp-badge">{farmer.badge}</span>}
                    </div>
                    <p className="fp-location">📍 {farmer.location}</p>
                    <p className="fp-bio">{farmer.bio}</p>
                    <p className="fp-since">Member since {farmer.memberSince}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="fp-stats">
                <div className="fp-stat">
                    <span className="fp-stat-number">⭐ {farmer.rating}</span>
                    <span className="fp-stat-label">{farmer.reviews} Reviews</span>
                </div>
                <div className="fp-stat">
                    <span className="fp-stat-number">{farmer.products}</span>
                    <span className="fp-stat-label">Products Listed</span>
                </div>
                <div className="fp-stat">
                    <span className="fp-stat-number">{farmer.sales}+</span>
                    <span className="fp-stat-label">Items Sold</span>
                </div>
            </div>

            {/* Products */}
            <div className="container">
                <h2 className="fp-section-title">🌾 Products by {farmer.name}</h2>

                {loading && (
                    <div className="loading">Loading products...</div>
                )}

                {error && (
                    <div className="fp-empty">
                        <span>🌾</span>
                        <p>No products found for this farmer yet.</p>
                        <Link to="/products" className="btn btn-primary">Browse All Products</Link>
                    </div>
                )}

                {!loading && !error && products.length === 0 && (
                    <div className="fp-empty">
                        <span>🌾</span>
                        <p>This farmer hasn't listed any products yet.</p>
                    </div>
                )}

                {!loading && products.length > 0 && (
                    <div className="products-grid">
                        {products.map(product => (
                            <div key={product._id} className="product-card">
                                {product.images?.length > 0 ? (
                                    <img src={product.images[0].url} alt={product.name} className="fp-product-img" />
                                ) : (
                                    <div className="fp-no-img">🌿</div>
                                )}
                                <h3>{product.name}</h3>
                                <p className="price">₹{product.price}/{product.unit}</p>
                                <div className="fp-product-actions">
                                    <Link to={`/products/${product._id}`} className="btn btn-secondary" style={{ fontSize: '13px', padding: '8px 14px' }}>View</Link>
                                    <button
                                        className="btn btn-primary"
                                        style={{ fontSize: '13px', padding: '8px 14px' }}
                                        onClick={() => handleAddToCart(product)}
                                        disabled={product.stockQuantity <= 0}
                                    >
                                        {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FarmerProfile;
