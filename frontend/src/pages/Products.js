import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductUpload from '../components/ProductUpload';

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const { user } = useAuth();
    const { addToCart } = useCart();

    // Filters
    const [filters, setFilters] = useState({
        category: '',
        search: '',
        minPrice: '',
        maxPrice: '',
        sort: 'newest'
    });

    // Modal state for adding product
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        subcategory: '',
        stockQuantity: '',
        unit: 'kg',
        images: [],
        location: {
            state: user?.location?.state || '',
            district: user?.location?.district || ''
        }
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [filters]);

    const fetchCategories = async () => {
        try {
            const response = await productsAPI.getCategories();
            setCategories(response.data.categories);
        } catch (err) {
            console.error('Failed to load categories', err);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await productsAPI.getAll(filters);
            setProducts(response.data.products);
        } catch (err) {
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        alert('Product added to cart!');
    };

    const handleImageUpload = (uploadedImages) => {
        setNewProduct(prev => ({
            ...prev,
            images: [...prev.images, ...uploadedImages]
        }));
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            await productsAPI.create(newProduct);
            setShowAddModal(false);
            setNewProduct({
                name: '',
                description: '',
                price: '',
                category: '',
                subcategory: '',
                stockQuantity: '',
                unit: 'kg',
                images: [],
                location: {
                    state: user?.location?.state || '',
                    district: user?.location?.district || ''
                }
            });
            fetchProducts();
            alert('Product added successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add product');
        }
    };

    const renderAddProductModal = () => (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Product</h3>
                    <form onSubmit={handleAddProduct} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Product Name"
                                className="border p-2 rounded w-full"
                                value={newProduct.name}
                                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                required
                            />
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    placeholder="Price"
                                    className="border p-2 rounded w-full"
                                    value={newProduct.price}
                                    onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                    required
                                />
                                <select
                                    className="border p-2 rounded"
                                    value={newProduct.unit}
                                    onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                                >
                                    {['kg', 'g', 'quintal', 'ton', 'liter', 'ml', 'piece', 'dozen', 'bundle'].map(u => (
                                        <option key={u} value={u}>{u}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <textarea
                            placeholder="Description"
                            className="border p-2 rounded w-full"
                            value={newProduct.description}
                            onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                                className="border p-2 rounded w-full"
                                value={newProduct.category}
                                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Subcategory"
                                className="border p-2 rounded w-full"
                                value={newProduct.subcategory}
                                onChange={e => setNewProduct({ ...newProduct, subcategory: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="number"
                                placeholder="Stock Quantity"
                                className="border p-2 rounded w-full"
                                value={newProduct.stockQuantity}
                                onChange={e => setNewProduct({ ...newProduct, stockQuantity: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                            <ProductUpload onUploadComplete={handleImageUpload} />
                        </div>

                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            >
                                Add Product
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Marketplace</h1>
                {user?.role === 'farmer' && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        + Add Product
                    </button>
                )}
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-lg shadow mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        name="search"
                        placeholder="Search products..."
                        className="border p-2 rounded"
                        value={filters.search}
                        onChange={handleFilterChange}
                    />
                    <select
                        name="category"
                        className="border p-2 rounded"
                        value={filters.category}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <div className="flex space-x-2">
                        <input
                            type="number"
                            name="minPrice"
                            placeholder="Min Price"
                            className="border p-2 rounded w-full"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                        />
                        <input
                            type="number"
                            name="maxPrice"
                            placeholder="Max Price"
                            className="border p-2 rounded w-full"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <select
                        name="sort"
                        className="border p-2 rounded"
                        value={filters.sort}
                        onChange={handleFilterChange}
                    >
                        <option value="newest">Newest First</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="rating">Top Rated</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-8">Loading products...</div>
            ) : error ? (
                <div className="text-center text-red-500 py-8">{error}</div>
            ) : products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No products found matching your criteria.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="h-48 overflow-hidden bg-gray-200 relative">
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={product.images[0].url}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        No Image
                                    </div>
                                )}
                                {product.averageRating > 0 && (
                                    <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                                        <span>★ {product.averageRating}</span>
                                        <span className="ml-1 text-gray-700">({product.numReviews})</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
                                <p className="text-sm text-gray-600 mb-3 h-10 overflow-hidden line-clamp-2">{product.description}</p>

                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-lg font-bold text-green-600">₹{product.price}<span className="text-sm font-normal text-gray-500">/{product.unit}</span></span>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                                        {product.stockQuantity > 0 ? `${product.stockQuantity} ${product.unit} left` : 'Out of Stock'}
                                    </span>
                                </div>

                                <div className="text-xs text-gray-500 mb-4 flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {product.farmer?.location?.district}, {product.farmer?.location?.state}
                                </div>

                                <div className="flex gap-2">
                                    <Link to={`/products/${product._id}`} className="flex-1 text-center py-2 px-4 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 transition-colors">
                                        View Details
                                    </Link>

                                    {user?.role === 'buyer' && (
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            disabled={product.stockQuantity <= 0}
                                            className={`w-full py-2 px-4 rounded transition-colors ${product.stockQuantity > 0
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showAddModal && renderAddProductModal()}
        </div>
    );
}

export default Products;

