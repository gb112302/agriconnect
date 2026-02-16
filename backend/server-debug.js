const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

console.log('🔍 Starting AgriConnect Backend Server...');

// Middleware
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL, 'https://agriconnectgb.netlify.app']
        : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('✅ Middleware loaded');

// Database connection with in-memory fallback
async function connectDB() {
    try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        console.log('⚠️  Using in-memory database for development...');
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose.connect(uri);
        console.log('✅ In-memory MongoDB connected successfully');
    } catch (err) {
        console.error('❌ Database connection error:', err.message);
    }
}

connectDB();

// Load routes with error handling
console.log('📦 Loading routes...');

try {
    app.use('/api/auth', require('./routes/auth'));
    console.log('✅ Auth routes loaded');
} catch (e) {
    console.error('❌ Auth routes error:', e.message);
}

try {
    app.use('/api/products', require('./routes/products'));
    console.log('✅ Products routes loaded');
} catch (e) {
    console.error('❌ Products routes error:', e.message);
}

try {
    app.use('/api/orders', require('./routes/orders'));
    console.log('✅ Orders routes loaded');
} catch (e) {
    console.error('❌ Orders routes error:', e.message);
}

try {
    app.use('/api/bulk-requests', require('./routes/bulkRequests'));
    console.log('✅ Bulk requests routes loaded');
} catch (e) {
    console.error('❌ Bulk requests routes error:', e.message);
}

try {
    app.use('/api/reviews', require('./routes/reviews'));
    console.log('✅ Reviews routes loaded');
} catch (e) {
    console.error('❌ Reviews routes error:', e.message);
}

try {
    app.use('/api/payments', require('./routes/payments'));
    console.log('✅ Payments routes loaded');
} catch (e) {
    console.error('❌ Payments routes error:', e.message);
}

try {
    app.use('/api/analytics', require('./routes/analytics'));
    console.log('✅ Analytics routes loaded');
} catch (e) {
    console.error('❌ Analytics routes error:', e.message);
}

try {
    app.use('/api/admin', require('./routes/admin'));
    console.log('✅ Admin routes loaded');
} catch (e) {
    console.error('❌ Admin routes error:', e.message);
}

// Skip chat routes with socket.io for now
console.log('⚠️  Skipping chat routes (socket.io) for debugging');

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'AgriConnect API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API available at http://localhost:${PORT}/api`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
});
