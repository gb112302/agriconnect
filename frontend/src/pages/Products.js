import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const { addToCart } = useCart();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await productsAPI.getAll();
            setProducts(response.data);
        } catch (err) {
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        alert('Product added to cart!');
    };

    if (loading) return <div className="loading">Loading products...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="container">
            <h1>Products</h1>

            {products.length === 0 ? (
                <div className="card">
                    <p>No products available yet.</p>
                </div>
            ) : (
                <div className="products-grid">
                    {products.map((product) => (
                        <div key={product._id} className="product-card">
                            <h3>{product.name}</h3>
                            <p>{product.description}</p>
                            <div className="price">₹{product.price}/{product.unit}</div>
                            <p><strong>Available:</strong> {product.quantity} {product.unit}</p>
                            <p><strong>Farmer:</strong> {product.farmer?.name}</p>
                            <p><strong>Location:</strong> {product.farmer?.location?.district}</p>

                            {user?.role === 'buyer' && (
                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%', marginTop: '10px' }}
                                    onClick={() => handleAddToCart(product)}
                                >
                                    Add to Cart
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Products;
