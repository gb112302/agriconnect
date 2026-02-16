const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/analytics/sales-overview
// @desc    Get sales overview for farmer
// @access  Private (Farmers only)
router.get('/sales-overview', protect, async (req, res) => {
    try {
        if (req.user.role !== 'farmer') {
            return res.status(403).json({
                success: false,
                message: 'Only farmers can access analytics'
            });
        }

        // Get farmer's products
        const products = await Product.find({ farmerId: req.user.id });
        const productIds = products.map(p => p._id);

        // Get all orders containing farmer's products
        const orders = await Order.find({
            'items.productId': { $in: productIds }
        });

        // Calculate metrics
        const totalOrders = orders.length;
        const completedOrders = orders.filter(o => o.status === 'delivered').length;
        const totalRevenue = orders
            .filter(o => o.status === 'delivered')
            .reduce((sum, order) => sum + order.totalAmount, 0);

        const pendingOrders = orders.filter(o => o.status === 'pending').length;

        res.json({
            success: true,
            analytics: {
                totalOrders,
                completedOrders,
                pendingOrders,
                totalRevenue,
                totalProducts: products.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/analytics/sales-by-period
// @desc    Get sales data by period
// @access  Private (Farmers only)
router.get('/sales-by-period', protect, async (req, res) => {
    try {
        if (req.user.role !== 'farmer') {
            return res.status(403).json({
                success: false,
                message: 'Only farmers can access analytics'
            });
        }

        const { period = 'month' } = req.query; // day, week, month

        const products = await Product.find({ farmerId: req.user.id });
        const productIds = products.map(p => p._id);

        let dateFilter;
        const now = new Date();

        if (period === 'day') {
            dateFilter = new Date(now.setDate(now.getDate() - 30));
        } else if (period === 'week') {
            dateFilter = new Date(now.setDate(now.getDate() - 12 * 7));
        } else {
            dateFilter = new Date(now.setMonth(now.getMonth() - 12));
        }

        const orders = await Order.find({
            'items.productId': { $in: productIds },
            createdAt: { $gte: dateFilter },
            status: 'delivered'
        }).sort({ createdAt: 1 });

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/analytics/top-products
// @desc    Get best selling products
// @access  Private (Farmers only)
router.get('/top-products', protect, async (req, res) => {
    try {
        if (req.user.role !== 'farmer') {
            return res.status(403).json({
                success: false,
                message: 'Only farmers can access analytics'
            });
        }

        const products = await Product.find({ farmerId: req.user.id })
            .sort({ numReviews: -1, averageRating: -1 })
            .limit(10);

        res.json({
            success: true,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/analytics/revenue-chart
// @desc    Get revenue over time for charts
// @access  Private (Farmers only)
router.get('/revenue-chart', protect, async (req, res) => {
    try {
        if (req.user.role !== 'farmer') {
            return res.status(403).json({
                success: false,
                message: 'Only farmers can access analytics'
            });
        }

        const products = await Product.find({ farmerId: req.user.id });
        const productIds = products.map(p => p._id);

        const revenueData = await Order.aggregate([
            {
                $match: {
                    'items.productId': { $in: productIds },
                    status: 'delivered'
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        res.json({
            success: true,
            revenueData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
