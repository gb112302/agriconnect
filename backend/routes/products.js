const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const { upload, uploadToCloudinary, deleteImage } = require('../config/cloudinaryConfig');

// @route   POST /api/products/upload-image
// @desc    Upload product image
// @access  Private (Farmer only)
router.post('/upload-image', protect, authorize('farmer'), upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const result = await uploadToCloudinary(req.file.buffer);

        res.json({
            success: true,
            image: {
                url: result.secure_url,
                publicId: result.public_id
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/products/delete-image/:publicId
// @desc    Delete product image
// @access  Private (Farmer only)
router.delete('/delete-image/:publicId', protect, authorize('farmer'), async (req, res) => {
    try {
        const { publicId } = req.params;
        await deleteImage(publicId);

        res.json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/products/categories
// @desc    Get all categories
// @access  Public
router.get('/categories', async (req, res) => {
    try {
        const categories = Product.schema.path('category').enumValues;
        res.json({
            success: true,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/products
// @desc    Get all products with advanced filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            category,
            subcategory,
            state,
            district,
            search,
            minPrice,
            maxPrice,
            rating,
            sort
        } = req.query;

        let query = { isAvailable: true };

        // Apply filters
        if (category) query.category = category;
        if (subcategory) query.subcategory = subcategory;
        if (state) query['location.state'] = state;
        if (district) query['location.district'] = district;

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (rating) {
            query.averageRating = { $gte: Number(rating) };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Sort
        let sortOption = { createdAt: -1 };
        if (sort === 'price_asc') sortOption = { price: 1 };
        if (sort === 'price_desc') sortOption = { price: -1 };
        if (sort === 'rating') sortOption = { averageRating: -1 };
        if (sort === 'popularity') sortOption = { numReviews: -1 };

        const products = await Product.find(query)
            .populate('farmerId', 'name location')
            .sort(sortOption);

        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('farmerId', 'name email phone location')
            .populate({
                path: 'reviews',
                populate: { path: 'userId', select: 'name' }
            });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Farmer only)
router.post('/', protect, authorize('farmer'), async (req, res) => {
    try {
        const productData = {
            ...req.body,
            farmerId: req.user.id
        };

        const product = await Product.create(productData);

        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Farmer only - own products)
router.put('/:id', protect, authorize('farmer'), async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check ownership
        if (product.farmerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this product'
            });
        }

        product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Farmer only - own products)
router.delete('/:id', protect, authorize('farmer'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check ownership
        if (product.farmerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this product'
            });
        }

        // Delete images from Cloudinary
        if (product.images && product.images.length > 0) {
            for (const image of product.images) {
                if (image.publicId) {
                    await deleteImage(image.publicId);
                }
            }
        }

        await product.deleteOne();

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/products/farmer/:farmerId
// @desc    Get all products by specific farmer
// @access  Public
router.get('/farmer/:farmerId', async (req, res) => {
    try {
        const products = await Product.find({
            farmerId: req.params.farmerId,
            isAvailable: true
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
