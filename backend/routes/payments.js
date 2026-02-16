const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @route   POST /api/payments/create-payment-intent
// @desc    Create Stripe payment intent
// @access  Private
router.post('/create-payment-intent', protect, async (req, res) => {
    try {
        const { amount, orderId } = req.body;

        // Create payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to paise/cents
            currency: 'inr',
            metadata: {
                orderId: orderId,
                userId: req.user.id
            }
        });

        // Create payment record
        const payment = await Payment.create({
            orderId,
            userId: req.user.id,
            amount,
            paymentMethod: 'stripe',
            paymentIntentId: paymentIntent.id,
            status: 'pending'
        });

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentId: payment._id
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/payments/verify-payment
// @desc    Verify payment completion
// @access  Private
router.post('/verify-payment', protect, async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        // Retrieve payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        // Find payment record
        const payment = await Payment.findOne({ paymentIntentId });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment record not found'
            });
        }

        // Update payment status
        if (paymentIntent.status === 'succeeded') {
            payment.status = 'completed';
            payment.transactionId = paymentIntent.id;
            await payment.save();

            // Update order payment status
            const order = await Order.findById(payment.orderId);
            if (order) {
                order.paymentStatus = 'completed';
                order.paymentId = payment._id;
                await order.save();
            }

            res.json({
                success: true,
                message: 'Payment verified successfully',
                payment
            });
        } else {
            payment.status = 'failed';
            await payment.save();

            res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/payments/payment-history
// @desc    Get user's payment history
// @access  Private
router.get('/payment-history', protect, async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user.id })
            .populate('orderId')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: payments.length,
            payments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/payments/refund/:paymentId
// @desc    Process refund
// @access  Private (Admin/Farmer)
router.post('/refund/:paymentId', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'farmer') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to process refunds'
            });
        }

        const payment = await Payment.findById(req.params.paymentId);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        if (payment.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Can only refund completed payments'
            });
        }

        // Process refund with Stripe
        const refund = await stripe.refunds.create({
            payment_intent: payment.paymentIntentId
        });

        payment.status = 'refunded';
        await payment.save();

        // Update order status
        const order = await Order.findById(payment.orderId);
        if (order) {
            order.paymentStatus = 'refunded';
            order.status = 'cancelled';
            await order.save();
        }

        res.json({
            success: true,
            message: 'Refund processed successfully',
            refund
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
