const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private (Buyer only)
router.post('/', protect, authorize('buyer'), async (req, res) => {
    try {
        const { items, deliveryAddress } = req.body;

        // Validate stock availability
        for (let item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product ${item.productId} not found`
                });
            }
            if (product.stockQuantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`
                });
            }
        }

        // Calculate total amount
        const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

        // Create order
        const order = await Order.create({
            buyerId: req.user.id,
            items,
            totalAmount,
            deliveryAddress
        });

        // Update product stock
        for (let item of items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stockQuantity: -item.quantity }
            });
        }

        res.status(201).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/orders/buyer
// @desc    Get all orders for logged-in buyer
// @access  Private (Buyer only)
router.get('/buyer', protect, authorize('buyer'), async (req, res) => {
    try {
        const orders = await Order.find({ buyerId: req.user.id })
            .populate('items.productId', 'name imageURL')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/orders/farmer
// @desc    Get all orders for logged-in farmer's products
// @access  Private (Farmer only)
router.get('/farmer', protect, authorize('farmer'), async (req, res) => {
    try {
        // Get all farmer's products
        const farmerProducts = await Product.find({ farmerId: req.user.id });
        const productIds = farmerProducts.map(p => p._id);

        // Find orders containing farmer's products
        const orders = await Order.find({
            'items.productId': { $in: productIds }
        })
            .populate('buyerId', 'name email phone location')
            .populate('items.productId', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Farmer only)
router.put('/:id/status', protect, authorize('farmer'), async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
