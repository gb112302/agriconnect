const mongoose = require('mongoose');

const bulkRequestSchema = new mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    requestedQuantity: {
        type: Number,
        required: [true, 'Requested quantity is required'],
        min: 1
    },
    message: {
        type: String,
        trim: true
    },
    farmerResponse: {
        message: String,
        customPrice: Number,
        respondedAt: Date
    },
    status: {
        type: String,
        enum: ['pending', 'negotiating', 'accepted', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('BulkRequest', bulkRequestSchema);
