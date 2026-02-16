import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


// Auth API
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    selectRole: (role) => api.post('/auth/select-role', { role }),
    switchRole: (role) => api.post('/auth/switch-role', { role }),
    getProfile: () => api.get('/auth/profile'),
};


// Products API
// Products API
export const productsAPI = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    create: (productData) => api.post('/products', productData),
    update: (id, productData) => api.put(`/products/${id}`, productData),
    delete: (id) => api.delete(`/products/${id}`),
    getCategories: () => api.get('/products/categories'),
    getByFarmer: (farmerId) => api.get(`/products/farmer/${farmerId}`),
    uploadImage: (formData) => api.post('/products/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteImage: (publicId) => api.delete(`/products/delete-image/${publicId}`),
};

// Orders API
export const ordersAPI = {
    getAll: () => api.get('/orders'),
    getById: (id) => api.get(`/orders/${id}`),
    create: (orderData) => api.post('/orders', orderData),
    updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// Reviews API
export const reviewsAPI = {
    create: (reviewData) => api.post('/reviews', reviewData),
    getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
    getByFarmer: (farmerId) => api.get(`/reviews/farmer/${farmerId}`),
    getMyReviews: () => api.get('/reviews/my-reviews'),
    update: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
    delete: (id) => api.delete(`/reviews/${id}`),
};

// Bulk Requests API
export const bulkRequestsAPI = {
    getAll: () => api.get('/bulk-requests'),
    getById: (id) => api.get(`/bulk-requests/${id}`),
    create: (requestData) => api.post('/bulk-requests', requestData),
    respond: (id, responseData) => api.post(`/bulk-requests/${id}/respond`, responseData),
};

// Payments API
export const paymentsAPI = {
    createPaymentIntent: (data) => api.post('/payments/create-payment-intent', data),
    verifyPayment: (data) => api.post('/payments/verify-payment', data),
    getHistory: () => api.get('/payments/history'),
    refund: (paymentId) => api.post(`/payments/refund/${paymentId}`),
};

// Analytics API
export const analyticsAPI = {
    getSalesOverview: () => api.get('/analytics/sales-overview'),
    getSalesByPeriod: (period) => api.get(`/analytics/sales-by-period?period=${period}`),
    getTopProducts: () => api.get('/analytics/top-products'),
    getRevenueChart: () => api.get('/analytics/revenue-chart'),
    getBuyerAnalytics: () => api.get('/analytics/buyer-analytics'),
};

// Admin API
export const adminAPI = {
    getUsers: () => api.get('/admin/users'),
    updateUserStatus: (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive }),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getPlatformStats: () => api.get('/admin/platform-stats'),
    approveProduct: (id, isAvailable) => api.put(`/admin/products/${id}/approve`, { isAvailable }),
    getFlaggedReviews: () => api.get('/admin/reviews/flagged'),
};

// Wishlist API
export const wishlistAPI = {
    add: (productId) => api.post(`/auth/wishlist/add/${productId}`),
    remove: (productId) => api.delete(`/auth/wishlist/remove/${productId}`),
    get: () => api.get('/auth/wishlist'),
};

export default api;
