const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private (Buyers only, must have purchased)
router.post('/', protect, async (req, res) => {
    try {
        const { productId, rating, comment, images } = req.body;

        // Check if user is a buyer
        if (req.user.role !== 'buyer') {
            return res.status(403).json({
                success: false,
                message: 'Only buyers can leave reviews'
            });
        }

        // Check if user has purchased this product
        const hasPurchased = await Order.findOne({
            buyerId: req.user.id,
            'items.productId': productId,
            status: { $in: ['delivered', 'completed'] }
        });

        if (!hasPurchased) {
            return res.status(403).json({
                success: false,
                message: 'You can only review products you have purchased'
            });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
            userId: req.user.id,
            productId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product'
            });
        }

        // Get product to find farmer
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const review = await Review.create({
            userId: req.user.id,
            productId,
            farmerId: product.farmerId,
            rating,
            comment,
            images: images || []
        });

        await review.populate('userId', 'name');

        res.status(201).json({
            success: true,
            review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/reviews/product/:productId
// @desc    Get all reviews for a product
// @access  Public
router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId })
            .populate('userId', 'name')
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

// @route   GET /api/reviews/farmer/:farmerId
// @desc    Get all reviews for a farmer
// @access  Public
router.get('/farmer/:farmerId', async (req, res) => {
    try {
        const reviews = await Review.find({ farmerId: req.params.farmerId })
            .populate('userId', 'name')
            .populate('productId', 'name')
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

// @route   GET /api/reviews/my-reviews
// @desc    Get current user's reviews
// @access  Private
router.get('/my-reviews', protect, async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.user.id })
            .populate('productId', 'name images')
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

// @route   PUT /api/reviews/:id
// @desc    Update own review
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        let review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user owns this review
        if (review.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this review'
            });
        }

        const { rating, comment, images } = req.body;

        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        review.images = images || review.images;

        await review.save();

        res.json({
            success: true,
            review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete own review
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user owns this review or is admin
        if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this review'
            });
        }

        await review.remove();

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
