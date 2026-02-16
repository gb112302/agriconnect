const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    category: {
        type: String,
        enum: ['Grains', 'Vegetables', 'Fruits', 'Pulses', 'Spices', 'Dairy', 'Organic', 'Seeds', 'Fertilizers', 'Equipment'],
        required: [true, 'Category is required']
    },
    subcategory: {
        type: String,
        trim: true
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        }
    }],
    stockQuantity: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: 0
    },
    unit: {
        type: String,
        default: 'kg',
        enum: ['kg', 'g', 'quintal', 'ton', 'liter', 'ml', 'piece', 'dozen', 'bundle']
    },
    location: {
        state: String,
        district: String
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    variants: [{
        name: String,
        price: Number,
        stockQuantity: Number
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

// Update the updatedAt field on save
productSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual populate for reviews
productSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'productId'
});

// Method to calculate average rating
productSchema.methods.calculateAverageRating = async function () {
    const Review = mongoose.model('Review');
    const stats = await Review.aggregate([
        { $match: { productId: this._id } },
        {
            $group: {
                _id: '$productId',
                avgRating: { $avg: '$rating' },
                numReviews: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        this.averageRating = Math.round(stats[0].avgRating * 10) / 10;
        this.numReviews = stats[0].numReviews;
    } else {
        this.averageRating = 0;
        this.numReviews = 0;
    }

    await this.save();
};

module.exports = mongoose.model('Product', productSchema);
