import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

function Cart() {
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (cart.length === 0) {
        return (
            <div className="container">
                <h1>Shopping Cart</h1>
                <div className="card">
                    <p>Your cart is empty</p>
                    <button className="btn btn-primary" onClick={() => navigate('/products')}>
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <h1>Shopping Cart</h1>

            {cart.map((item) => (
                <div key={item._id} className="cart-item">
                    <div>
                        <h3>{item.name}</h3>
                        <p>₹{item.price}/{item.unit}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        >
                            -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                            className="btn btn-secondary"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        >
                            +
                        </button>
                        <button
                            className="btn"
                            style={{ background: '#f44336', color: 'white' }}
                            onClick={() => removeFromCart(item._id)}
                        >
                            Remove
                        </button>
                    </div>

                    <div>
                        <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
                    </div>
                </div>
            ))}

            <div className="cart-total">
                <p>Total: ₹{getCartTotal().toFixed(2)}</p>
                <button
                    className="btn btn-primary"
                    style={{ marginTop: '10px' }}
                    onClick={handleCheckout}
                >
                    Checkout
                </button>
            </div>
        </div>
    );
}

export default Cart;
