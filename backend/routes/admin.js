const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminMiddleware');

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private (Admin only)
router.get('/users', protect, isAdmin, async (req, res) => {
    try {
        const { role, isActive, search } = req.query;

        let query = {};
        if (role) query.role = role;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Activate/deactivate user
// @access  Private (Admin only)
router.put('/users/:id/status', protect, isAdmin, async (req, res) => {
    try {
        const { isActive } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isActive = isActive;
        await user.save();

        res.json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/users/:id', protect, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.remove();

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/admin/platform-stats
// @desc    Get overall platform statistics
// @access  Private (Admin only)
router.get('/platform-stats', protect, isAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalFarmers = await User.countDocuments({ role: 'farmer' });
        const totalBuyers = await User.countDocuments({ role: 'buyer' });
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $match: { status: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email role createdAt');

        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('buyerId', 'name')
            .populate('items.productId', 'name');

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalFarmers,
                totalBuyers,
                totalProducts,
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                recentUsers,
                recentOrders
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/admin/reports
// @desc    Generate various reports
// @access  Private (Admin only)
router.get('/reports', protect, isAdmin, async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;

        let report = {};

        if (type === 'sales') {
            const salesData = await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate)
                        }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        totalSales: { $sum: '$totalAmount' },
                        orderCount: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
            report = { type: 'sales', data: salesData };
        }

        res.json({
            success: true,
            report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/admin/products/:id/approve
// @desc    Approve/reject products
// @access  Private (Admin only)
router.put('/products/:id/approve', protect, isAdmin, async (req, res) => {
    try {
        const { isAvailable } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        product.isAvailable = isAvailable;
        await product.save();

        res.json({
            success: true,
            message: `Product ${isAvailable ? 'approved' : 'rejected'} successfully`,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/admin/reviews/flagged
// @desc    Get flagged reviews for moderation
// @access  Private (Admin only)
router.get('/reviews/flagged', protect, isAdmin, async (req, res) => {
    try {
        // For now, get reviews with rating 1 or 2 (could add a flagged field later)
        const reviews = await Review.find({ rating: { $lte: 2 } })
            .populate('userId', 'name email')
            .populate('productId', 'name')
            .populate('farmerId', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
