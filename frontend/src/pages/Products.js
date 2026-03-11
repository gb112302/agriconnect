import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import ProductUpload from '../components/ProductUpload';
import { SkeletonList } from '../components/Skeleton';
import toast from 'react-hot-toast';

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { t } = useTranslation();

    const [filters, setFilters] = useState({
        category: '',
        search: '',
        minPrice: '',
        maxPrice: '',
        sort: 'newest'
    });

    const [showAddModal, setShowAddModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '', description: '', price: '', category: '',
        subcategory: '', stockQuantity: '', unit: 'kg', images: [],
        location: { state: user?.location?.state || '', district: user?.location?.district || '' }
    });

    useEffect(() => { fetchProducts(); fetchCategories(); }, [filters]);

    const fetchCategories = async () => {
        try {
            const response = await productsAPI.getCategories();
            setCategories(response.data.categories);
        } catch (err) { console.error('Failed to load categories', err); }
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
        toast.success(`🛒 ${product.name} added to cart!`);
    };

    const handleImageUpload = (uploadedImages) => {
        setNewProduct(prev => ({ ...prev, images: [...prev.images, ...uploadedImages] }));
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading('Adding product...');
        try {
            await productsAPI.create(newProduct);
            toast.success('Product added successfully! 🌾', { id: loadingToast });
            setShowAddModal(false);
            setNewProduct({
                name: '', description: '', price: '', category: '',
                subcategory: '', stockQuantity: '', unit: 'kg', images: [],
                location: { state: user?.location?.state || '', district: user?.location?.district || '' }
            });
            fetchProducts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add product', { id: loadingToast });
        }
    };

    const renderAddProductModal = () => (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>🌾 {t('products_page.add_new_product')}</h3>
                    <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
                </div>
                <form onSubmit={handleAddProduct} className="modal-form">
                    <div className="modal-grid">
                        <div className="form-group">
                            <label>{t('products_page.product_name')}</label>
                            <input type="text" placeholder="e.g. Organic Tomatoes" value={newProduct.name}
                                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
                        </div>
                        <div className="form-group" style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ flex: 1 }}>
                                <label>{t('products_page.price_label')}</label>
                                <input type="number" placeholder="0" value={newProduct.price}
                                    onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required />
                            </div>
                            <div>
                                <label>{t('products_page.unit')}</label>
                                <select value={newProduct.unit} onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}>
                                    {['kg', 'g', 'quintal', 'ton', 'liter', 'ml', 'piece', 'dozen', 'bundle'].map(u => (
                                        <option key={u} value={u}>{u}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>{t('products_page.description')}</label>
                        <textarea placeholder="Describe your product..." value={newProduct.description}
                            onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} required rows={3} />
                    </div>
                    <div className="modal-grid">
                        <div className="form-group">
                            <label>{t('products_page.category')}</label>
                            <select value={newProduct.category}
                                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} required>
                                <option value="">{t('products_page.select_category')}</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{t('products_page.stock_qty')}</label>
                            <input type="number" placeholder="0" value={newProduct.stockQuantity}
                                onChange={e => setNewProduct({ ...newProduct, stockQuantity: e.target.value })} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>{t('products_page.product_images')}</label>
                        <ProductUpload onUploadComplete={handleImageUpload} />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>{t('products_page.cancel')}</button>
                        <button type="submit" className="btn btn-primary">{t('products_page.add_product_btn')}</button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px' }}>
            <div className="products-page-header">
                <h1>🛒 {t('products_page.marketplace')}</h1>
                {user?.role === 'farmer' && (
                    <button onClick={() => setShowAddModal(true)} className="btn btn-primary">{t('products_page.add_product')}</button>
                )}
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="form-group" style={{ margin: 0, flex: 2 }}>
                    <input type="text" name="search" placeholder={`🔍 ${t('products_page.search_placeholder')}`}
                        value={filters.search} onChange={handleFilterChange} />
                </div>
                <div className="form-group" style={{ margin: 0, flex: 1 }}>
                    <select name="category" value={filters.category} onChange={handleFilterChange}>
                        <option value="">{t('products_page.all_categories')}</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="form-group" style={{ margin: 0, display: 'flex', gap: '8px', flex: 1 }}>
                    <input type="number" name="minPrice" placeholder={t('products_page.min')} value={filters.minPrice} onChange={handleFilterChange} />
                    <input type="number" name="maxPrice" placeholder={t('products_page.max')} value={filters.maxPrice} onChange={handleFilterChange} />
                </div>
                <div className="form-group" style={{ margin: 0, flex: 1 }}>
                    <select name="sort" value={filters.sort} onChange={handleFilterChange}>
                        <option value="newest">{t('products_page.newest')}</option>
                        <option value="price_asc">{t('products_page.price_asc')}</option>
                        <option value="price_desc">{t('products_page.price_desc')}</option>
                        <option value="rating">{t('products_page.top_rated')}</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <SkeletonList count={8} />
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#ef4444' }}>{error}</div>
            ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌾</div>
                    {t('products_page.no_products')}
                </div>
            ) : (
                <div className="products-grid">
                    {products.map((product) => (
                        <div key={product._id} className="product-card">
                            <div className="product-card-img">
                                {product.images?.length > 0 ? (
                                    <img src={product.images[0].url} alt={product.name} />
                                ) : (
                                    <div className="product-card-no-img">🥦</div>
                                )}
                                {product.averageRating > 0 && (
                                    <span className="product-rating-badge">★ {product.averageRating}</span>
                                )}
                            </div>
                            <div className="product-card-body">
                                <div className="product-card-category">{product.category}</div>
                                <h3>{product.name}</h3>
                                <p className="product-card-desc">{product.description}</p>
                                <div className="product-card-price-row">
                                    <span className="price">₹{product.price}<small>/{product.unit}</small></span>
                                    <span className="product-stock-badge">
                                        {product.stockQuantity > 0
                                            ? `${product.stockQuantity} ${t('products_page.left')}`
                                            : t('products_page.out_of_stock')}
                                    </span>
                                </div>
                                {product.farmer?.location && (
                                    <div className="product-location">📍 {product.farmer.location.district}, {product.farmer.location.state}</div>
                                )}
                                <div className="product-card-actions">
                                    <Link to={`/products/${product._id}`} className="btn btn-outline-green">{t('products_page.view')}</Link>
                                    {user?.role === 'buyer' && (
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            disabled={product.stockQuantity <= 0}
                                            className="btn btn-primary"
                                            style={{ flex: 1 }}
                                        >
                                            {product.stockQuantity > 0 ? `🛒 ${t('products_page.add_to_cart')}` : t('products_page.out_of_stock')}
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
