import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { wishlistAPI } from '../services/api';
import './Wishlist.css';

function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
        }
    }, [isAuthenticated]);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const response = await wishlistAPI.get();
            setWishlist(response.data.wishlist || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        try {
            await wishlistAPI.remove(productId);
            setWishlist(wishlist.filter(item => item._id !== productId));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove item');
        }
    };

    const handleViewProduct = (productId) => {
        window.location.href = `/products/${productId}`;
    };

    if (loading) {
        return <div className="loading">Loading wishlist...</div>;
    }

    return (
        <div className="wishlist-container">
            <h2>My Wishlist</h2>

            {error && <div className="error">{error}</div>}

            {wishlist.length === 0 ? (
                <div className="empty-wishlist">
                    <p>Your wishlist is empty</p>
                    <button onClick={() => window.location.href = '/products'}>
                        Browse Products
                    </button>
                </div>
            ) : (
                <div className="wishlist-grid">
                    {wishlist.map((product) => (
                        <div key={product._id} className="wishlist-item">
                            <div className="product-image">
                                {product.images && product.images.length > 0 ? (
                                    <img src={product.images[0].url} alt={product.name} />
                                ) : (
                                    <div className="no-image">No Image</div>
                                )}
                            </div>
                            <div className="product-info">
                                <h3>{product.name}</h3>
                                <p className="product-price">₹{product.price}/{product.unit}</p>
                                <p className="product-category">{product.category}</p>
                                {product.averageRating > 0 && (
                                    <div className="product-rating">
                                        ⭐ {product.averageRating.toFixed(1)} ({product.numReviews} reviews)
                                    </div>
                                )}
                            </div>
                            <div className="wishlist-actions">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleViewProduct(product._id)}
                                >
                                    View Product
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleRemove(product._id)}
                                >
                                    Remove
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
