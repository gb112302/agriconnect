const express = require('express');
const router = express.Router();
const BulkRequest = require('../models/BulkRequest');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/bulk-requests
// @desc    Create bulk order request
// @access  Private (Buyer only)
router.post('/', protect, authorize('buyer'), async (req, res) => {
    try {
        const { productId, requestedQuantity, message } = req.body;

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const bulkRequest = await BulkRequest.create({
            buyerId: req.user.id,
            productId,
            requestedQuantity,
            message
        });

        res.status(201).json({
            success: true,
            bulkRequest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/bulk-requests/farmer
// @desc    Get bulk requests for farmer's products
// @access  Private (Farmer only)
router.get('/farmer', protect, authorize('farmer'), async (req, res) => {
    try {
        // Get all farmer's products
        const farmerProducts = await Product.find({ farmerId: req.user.id });
        const productIds = farmerProducts.map(p => p._id);

        // Find bulk requests for these products
        const bulkRequests = await BulkRequest.find({
            productId: { $in: productIds }
        })
            .populate('buyerId', 'name email phone location')
            .populate('productId', 'name price')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: bulkRequests.length,
            bulkRequests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/bulk-requests/buyer
// @desc    Get buyer's bulk requests
// @access  Private (Buyer only)
router.get('/buyer', protect, authorize('buyer'), async (req, res) => {
    try {
        const bulkRequests = await BulkRequest.find({ buyerId: req.user.id })
            .populate('productId', 'name price imageURL')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: bulkRequests.length,
            bulkRequests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/bulk-requests/:id/respond
// @desc    Farmer responds to bulk request
// @access  Private (Farmer only)
router.put('/:id/respond', protect, authorize('farmer'), async (req, res) => {
    try {
        const { message, customPrice, status } = req.body;

        const bulkRequest = await BulkRequest.findById(req.params.id)
            .populate('productId');

        if (!bulkRequest) {
            return res.status(404).json({
                success: false,
                message: 'Bulk request not found'
            });
        }

        // Verify farmer owns the product
        if (bulkRequest.productId.farmerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to respond to this request'
            });
        }

        bulkRequest.farmerResponse = {
            message,
            customPrice,
            respondedAt: Date.now()
        };
        bulkRequest.status = status || 'negotiating';

        await bulkRequest.save();

        res.json({
            success: true,
            bulkRequest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
