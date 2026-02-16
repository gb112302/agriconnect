import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, wishlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Reviews from '../components/Reviews';

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [inWishlist, setInWishlist] = useState(false);
    const { user } = useAuth();
    const { addToCart } = useCart();

    useEffect(() => {
        fetchProduct();
        if (user) {
            checkWishlistStatus();
        }
    }, [id, user]);

    const fetchProduct = async () => {
        try {
            const response = await productsAPI.getById(id);
            setProduct(response.data.product);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    const checkWishlistStatus = async () => {
        try {
            const response = await wishlistAPI.get();
            const wishlist = response.data.wishlist || [];
            const found = wishlist.some(item => item._id === id);
            setInWishlist(found);
        } catch (err) {
            console.error('Failed to check wishlist:', err);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart(product);
            alert('Product added to cart!');
        }
    };

    const handleToggleWishlist = async () => {
        try {
            if (inWishlist) {
                await wishlistAPI.remove(id);
                setInWishlist(false);
                alert('Removed from wishlist');
            } else {
                await wishlistAPI.add(id);
                setInWishlist(true);
                alert('Added to wishlist');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update wishlist');
        }
    };

    const refreshProduct = () => {
        fetchProduct();
    };

    if (loading) return <div className="text-center py-10">Loading product details...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    if (!product) return <div className="text-center py-10">Product not found</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigate('/products')}
                className="mb-4 text-indigo-600 hover:text-indigo-800 flex items-center"
            >
                ← Back to Products
            </button>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="h-96 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center relative">
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[selectedImage]?.url}
                                    alt={product.name}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="text-gray-400">No Image Available</div>
                            )}
                            {product.isAvailable ? (
                                <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full uppercase font-semibold">In Stock</span>
                            ) : (
                                <span className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full uppercase font-semibold">Out of Stock</span>
                            )}
                        </div>
                        {product.images && product.images.length > 1 && (
                            <div className="flex space-x-2 overflow-x-auto pb-2">
                                {product.images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`flex-shrink-0 h-20 w-20 rounded-md overflow-hidden border-2 ${selectedImage === index ? 'border-indigo-600' : 'border-transparent'}`}
                                    >
                                        <img src={img.url} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-start">
                                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                                {user && (
                                    <button
                                        onClick={handleToggleWishlist}
                                        className={`p-2 rounded-full ${inWishlist ? 'text-red-500' : 'text-gray-400'} hover:bg-gray-100`}
                                        title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                                    >
                                        <svg className="w-6 h-6" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                                Category: <span className="font-medium text-gray-900">{product.category}</span>
                                {product.subcategory && <span className="ml-2">({product.subcategory})</span>}
                            </div>
                        </div>

                        <div className="border-t border-b py-4">
                            <div className="flex items-baseline">
                                <span className="text-4xl font-bold text-gray-900">₹{product.price}</span>
                                <span className="ml-2 text-lg text-gray-500">per {product.unit}</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                                Available Quantity: {product.stockQuantity} {product.unit}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-600 leading-relaxed">{product.description}</p>
                        </div>

                        {product.variants && product.variants.length > 0 && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Variants</h3>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map((variant, idx) => (
                                        <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                            {variant.name}: ₹{variant.price}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Farmer Details</h3>
                            <div className="bg-gray-50 p-4 rounded-md">
                                <p className="font-semibold text-gray-900">{product.farmerId?.name}</p>
                                <p className="text-gray-600 text-sm">
                                    {product.farmerId?.location?.district}, {product.farmerId?.location?.state}
                                </p>
                            </div>
                        </div>

                        {user?.role === 'buyer' ? (
                            <button
                                onClick={handleAddToCart}
                                disabled={!product.isAvailable || product.stockQuantity <= 0}
                                className={`w-full py-4 px-8 rounded-lg text-lg font-semibold shadow-md transition-colors ${product.isAvailable && product.stockQuantity > 0
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {product.isAvailable && product.stockQuantity > 0 ? 'Add to Cart' : 'Currently Unavailable'}
                            </button>
                        ) : (
                            !user && (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full py-4 px-8 rounded-lg text-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transition-colors"
                                >
                                    Login to Buy
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <Reviews
                productId={product._id}
                averageRating={product.averageRating}
                numReviews={product.numReviews}
                onReviewAdded={refreshProduct}
            />
        </div>
    );
}

export default ProductDetails;
