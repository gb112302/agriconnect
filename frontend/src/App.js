import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EmailVerification from './pages/EmailVerification';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Chat from './pages/Chat';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Analytics from './pages/Analytics';
import AdminDashboard from './pages/AdminDashboard';
import Wishlist from './pages/Wishlist';
import FarmerProfile from './pages/FarmerProfile';
import Profile from './pages/Profile';
import CropPrices from './pages/CropPrices';
import Weather from './pages/Weather';
import FarmingTips from './pages/FarmingTips';
import NotFound from './pages/NotFound';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import './App.css';
import './dark.css';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function AppContent() {
    return (
        <div className="App">
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/verify-email/:token" element={<EmailVerification />} />
                <Route path="/farmer/:id" element={<FarmerProfile />} />
                <Route path="/crop-prices" element={<CropPrices />} />
                <Route path="/weather" element={<Weather />} />
                <Route path="/farming-tips" element={<FarmingTips />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                <Route path="/products/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute requiredRole="buyer"><Cart /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute requiredRole="buyer"><Checkout /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute requiredRole="farmer"><Analytics /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
            <ScrollToTop />
        </div>
    );
}

function App() {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <CartProvider>
                        <AppContent />
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 3500,
                                style: {
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    borderRadius: '10px',
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                                },
                                success: {
                                    iconTheme: { primary: '#2e7d32', secondary: '#fff' },
                                    style: { background: '#f0fdf4', color: '#14532d', border: '1px solid #bbf7d0' },
                                },
                                error: {
                                    iconTheme: { primary: '#dc2626', secondary: '#fff' },
                                    style: { background: '#fef2f2', color: '#7f1d1d', border: '1px solid #fecaca' },
                                },
                            }}
                        />
                    </CartProvider>
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
}

export default App;
