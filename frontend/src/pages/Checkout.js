import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { paymentsAPI, ordersAPI } from '../services/api';

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51OEXAMPLE');

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const { cart, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        zip: ''
    });

    const totalAmount = getCartTotal();

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads
        if (totalAmount > 0) {
            paymentsAPI.createPaymentIntent({
                amount: totalAmount,
                currency: 'inr',
                items: cart
            })
                .then(res => {
                    setClientSecret(res.data.clientSecret);
                })
                .catch(err => {
                    console.error('Error creating payment intent:', err);
                    setError('Failed to initialize payment');
                });
        }
    }, [totalAmount, cart]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);

        const cardElement = elements.getElement(CardElement);

        const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
            billing_details: {
                name: name,
                address: {
                    line1: address.street,
                    city: address.city,
                    state: address.state,
                    postal_code: address.zip,
                },
            },
        });

        if (paymentMethodError) {
            setError(paymentMethodError.message);
            setProcessing(false);
            return;
        }

        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: paymentMethod.id
        });

        if (confirmError) {
            setError(confirmError.message);
            setProcessing(false);
        } else {
            // Payment successful, create order
            try {
                // Verify payment on backend
                await paymentsAPI.verifyPayment({
                    paymentIntentId: paymentIntent.id
                });

                // Group cart items by farmer to create separate orders if necessary
                // For simplicity, assuming one order for now or backend handles splitting
                // Adjust this based on your backend Order creation logic

                const orderData = {
                    items: cart.map(item => ({
                        product: item._id,
                        quantity: item.quantity,
                        price: item.price
                    })),
                    totalAmount: totalAmount,
                    shippingAddress: address,
                    paymentId: paymentIntent.id,
                    paymentStatus: 'completed'
                };

                await ordersAPI.create(orderData);

                clearCart();
                alert('Payment Successful! Order placed.');
                navigate('/orders'); // Redirect to orders page
            } catch (err) {
                console.error('Order creation failed:', err);
                setError('Payment successful but order creation failed. Please contact support.');
            } finally {
                setProcessing(false);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
                <div className="grid grid-cols-1 gap-4">
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="border p-2 rounded w-full"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Street Address"
                        className="border p-2 rounded w-full"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="City"
                            className="border p-2 rounded w-full"
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="State"
                            className="border p-2 rounded w-full"
                            value={address.state}
                            onChange={(e) => setAddress({ ...address, state: e.target.value })}
                            required
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="ZIP Code"
                        className="border p-2 rounded w-full"
                        value={address.zip}
                        onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
                <div className="border p-4 rounded bg-white">
                    <CardElement options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }} />
                </div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <button
                type="submit"
                disabled={!stripe || processing || !clientSecret}
                className={`w-full py-3 px-4 rounded shadow-md text-white font-bold transition-colors ${processing || !stripe || !clientSecret
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
            >
                {processing ? 'Processing...' : `Pay ₹${totalAmount}`}
            </button>
        </form>
    );
};

function Checkout() {
    const { cart, getCartTotal } = useCart();
    const [stripeKey, setStripeKey] = useState(null);

    useEffect(() => {
        // Fetch publishable key from backend if you prefer, or use env
        // For now using env variable access directly in styling
        if (process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY) {
            // Just triggering re-render if needed or verifying key presence
        }
    }, []);

    if (cart.length === 0) {
        return <div className="text-center py-20">Your cart is empty</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                    <div className="bg-white rounded-lg shadow p-6 space-y-4">
                        {cart.map((item) => (
                            <div key={item._id} className="flex justify-between items-center border-b pb-2">
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-500">{item.quantity} x ₹{item.price}</p>
                                </div>
                                <p className="font-semibold">₹{item.quantity * item.price}</p>
                            </div>
                        ))}
                        <div className="flex justify-between items-center pt-2 text-xl font-bold">
                            <span>Total</span>
                            <span>₹{getCartTotal()}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <Elements stripe={stripePromise}>
                        <CheckoutForm />
                    </Elements>
                </div>
            </div>
        </div>
    );
}

export default Checkout;
