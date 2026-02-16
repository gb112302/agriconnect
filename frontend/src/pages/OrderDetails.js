import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function OrderDetails() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        setLoading(true);
        try {
            const response = await ordersAPI.getById(id);
            setOrder(response.data.order);
        } catch (err) {
            setError('Failed to load order details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!window.confirm(`Are you sure you want to update status to ${newStatus}?`)) return;

        setUpdatingStatus(true);
        try {
            const response = await ordersAPI.updateStatus(id, newStatus);
            setOrder(response.data.order);
            alert('Order status updated successfully');
        } catch (err) {
            alert('Failed to update status');
            console.error(err);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const getStatusStep = (status) => {
        const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
        const index = steps.indexOf(status);
        return index === -1 ? 0 : index + 1;
    };

    if (loading) return <div className="text-center py-10">Loading order details...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    if (!order) return <div className="text-center py-10">Order not found</div>;

    const currentStep = getStatusStep(order.status);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <Link to="/orders" className="text-indigo-600 hover:text-indigo-800">
                    &larr; Back to Orders
                </Link>
                <h1 className="text-2xl font-bold">Order #{order._id.slice(-6).toUpperCase()}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Order Information */}
                <div className="md:col-span-2 space-y-6">

                    {/* Progress Tracker */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Order Status</h2>
                        <div className="relative">
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                                <div style={{ width: `${(currentStep / 5) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500"></div>
                            </div>
                            <div className="flex justify-between text-xs sm:text-sm">
                                <div className={`text-center ${currentStep >= 1 ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>Pending</div>
                                <div className={`text-center ${currentStep >= 2 ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>Confirmed</div>
                                <div className={`text-center ${currentStep >= 3 ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>Processing</div>
                                <div className={`text-center ${currentStep >= 4 ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>Shipped</div>
                                <div className={`text-center ${currentStep >= 5 ? 'text-green-600 font-bold' : 'text-gray-400'}`}>Delivered</div>
                            </div>
                        </div>
                        {order.status === 'cancelled' && (
                            <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
                                This order has been cancelled.
                            </div>
                        )}
                    </div>

                    {/* Items List */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b">
                            <h2 className="text-lg font-semibold">Items</h2>
                        </div>
                        <div className="divide-y">
                            {order.items.map((item, index) => (
                                <div key={index} className="p-4 flex items-center">
                                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                        {/* Placeholder image if not available or populated */}
                                        <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-400">
                                            Img
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <div className="flex justify-between font-medium text-gray-900">
                                            <h3>{item.productId?.name || 'Product Info Unavailable'}</h3>
                                            <p className="ml-4">₹{item.totalPrice}</p>
                                        </div>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Details */}
                <div className="space-y-6">
                    {/* Actions for Farmer */}
                    {user.role === 'farmer' && order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold mb-4">Update Status</h2>
                            <div className="flex flex-col space-y-2">
                                {order.status === 'pending' && (
                                    <button
                                        onClick={() => handleStatusUpdate('confirmed')}
                                        disabled={updatingStatus}
                                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Confirm Order
                                    </button>
                                )}
                                {order.status === 'confirmed' && (
                                    <button
                                        onClick={() => handleStatusUpdate('processing')}
                                        disabled={updatingStatus}
                                        className="bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 disabled:opacity-50"
                                    >
                                        Start Processing
                                    </button>
                                )}
                                {order.status === 'processing' && (
                                    <button
                                        onClick={() => handleStatusUpdate('shipped')}
                                        disabled={updatingStatus}
                                        className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        Mark Shipped
                                    </button>
                                )}
                                {order.status === 'shipped' && (
                                    <button
                                        onClick={() => handleStatusUpdate('delivered')}
                                        disabled={updatingStatus}
                                        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
                                    >
                                        Mark Delivered
                                    </button>
                                )}
                                <button
                                    onClick={() => handleStatusUpdate('cancelled')}
                                    disabled={updatingStatus}
                                    className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 mt-4 disabled:opacity-50"
                                >
                                    Cancel Order
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Order Summary */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Summary</h2>
                        <div className="flow-root">
                            <div className="-my-4 divide-y divide-gray-200">
                                <div className="flex items-center justify-between py-4">
                                    <dt className="text-gray-600">Subtotal</dt>
                                    <dd className="font-medium text-gray-900">₹{order.totalAmount}</dd>
                                </div>
                                <div className="flex items-center justify-between py-4">
                                    <dt className="text-gray-600">Shipping</dt>
                                    <dd className="font-medium text-gray-900">Free</dd>
                                </div>
                                <div className="flex items-center justify-between py-4 border-t border-gray-200">
                                    <dt className="text-base font-bold text-gray-900">Total</dt>
                                    <dd className="text-base font-bold text-gray-900">₹{order.totalAmount}</dd>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
                        <address className="not-italic text-sm text-gray-600">
                            <p>{order.deliveryAddress?.street}</p>
                            <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.zip}</p>
                        </address>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold mb-4">Customer Info</h2>
                        <div className="text-sm text-gray-600">
                            <p className="font-medium text-gray-900">{order.buyerId?.name || 'Guest'}</p>
                            <p>{order.buyerId?.email}</p>
                            <p>{order.buyerId?.phone}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderDetails;
