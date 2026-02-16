const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: [true, 'Review comment is required'],
        trim: true
    },
    images: [{
        url: String,
        publicId: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create indexes for faster queries
reviewSchema.index({ productId: 1 });
reviewSchema.index({ farmerId: 1 });
reviewSchema.index({ userId: 1 });

// Update the updatedAt field on save
reviewSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// After saving a review, update product rating
reviewSchema.post('save', async function () {
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.productId);
    if (product) {
        await product.calculateAverageRating();
    }
});

// After deleting a review, update product rating
reviewSchema.post('remove', async function () {
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.productId);
    if (product) {
        await product.calculateAverageRating();
    }
});

module.exports = mongoose.model('Review', reviewSchema);
