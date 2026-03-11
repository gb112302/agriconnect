import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { paymentsAPI, ordersAPI } from '../services/api';

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51OEXAMPLE');

const CheckoutForm = () => {
    const { t } = useTranslation();
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
                    setError(t('checkout.err_init'));
                });
        }
    }, [totalAmount, cart, t]);

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
                alert(t('checkout.success_msg'));
                navigate('/orders'); // Redirect to orders page
            } catch (err) {
                console.error('Order creation failed:', err);
                setError(t('checkout.err_order'));
            } finally {
                setProcessing(false);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('checkout.shipping_address')}</h3>
                <div className="grid grid-cols-1 gap-4">
                    <input
                        type="text"
                        placeholder={t('auth.full_name')}
                        className="border p-2 rounded w-full"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder={t('checkout.street')}
                        className="border p-2 rounded w-full"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder={t('checkout.city')}
                            className="border p-2 rounded w-full"
                            value={address.city}
                            onChange={(e) => setAddress({ ...address, city: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder={t('checkout.state')}
                            className="border p-2 rounded w-full"
                            value={address.state}
                            onChange={(e) => setAddress({ ...address, state: e.target.value })}
                            required
                        />
                    </div>
                    <input
                        type="text"
                        placeholder={t('checkout.zip')}
                        className="border p-2 rounded w-full"
                        value={address.zip}
                        onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('checkout.payment_details')}</h3>
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
                {processing ? t('checkout.processing') : t('checkout.pay_btn', { amount: totalAmount })}
            </button>
        </form>
    );
};

function Checkout() {
    const { t } = useTranslation();
    const { cart, getCartTotal } = useCart();

    if (cart.length === 0) {
        return <div className="text-center py-20">{t('cart.empty')}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">{t('checkout.title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">{t('checkout.order_summary')}</h2>
                    <div className="bg-white rounded-lg shadow p-6 space-y-4">
                        {cart.map((item) => (
                            <div key={item._id} className="flex justify-between items-center border-b pb-2">
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-500">{item.quantity} x ₹{item.price}</p>
                                </div>
                                <p className="font-semibold">₹{(item.quantity * item.price).toFixed(2)}</p>
                            </div>
                        ))}
                        <div className="flex justify-between items-center pt-2 text-xl font-bold">
                            <span>{t('cart.total')}</span>
                            <span>₹{getCartTotal().toFixed(2)}</span>
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
