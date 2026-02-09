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
        enum: ['Grains', 'Vegetables', 'Fruits', 'Pulses', 'Spices'],
        required: [true, 'Category is required']
    },
    imageURL: {
        type: String,
        default: ''
    },
    stockQuantity: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: 0
    },
    unit: {
        type: String,
        default: 'kg'
    },
    location: {
        state: String,
        district: String
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
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

module.exports = mongoose.model('Product', productSchema);
