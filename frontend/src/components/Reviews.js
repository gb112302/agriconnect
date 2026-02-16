import React, { useState, useEffect } from 'react';
import { reviewsAPI } from '../services/api';
import ReactStars from 'react-rating-stars-component';
import { useAuth } from '../context/AuthContext';

const Reviews = ({ productId, averageRating, numReviews, onReviewAdded }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '', images: [] });
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        if (productId) {
            fetchReviews();
        }
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const response = await reviewsAPI.getByProduct(productId);
            setReviews(response.data.reviews);
        } catch (err) {
            console.error('Failed to load reviews', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await reviewsAPI.create({ ...newReview, productId });
            setNewReview({ rating: 5, comment: '', images: [] });
            setShowForm(false);
            fetchReviews();
            if (onReviewAdded) onReviewAdded();
            alert('Review submitted successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        }
    };

    const ratingChanged = (newRating) => {
        setNewReview(prev => ({ ...prev, rating: newRating }));
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 mt-8">
            <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>

            <div className="flex items-center mb-8">
                <div className="mr-8 text-center">
                    <div className="text-5xl font-bold text-gray-900">{averageRating || 0}</div>
                    <div className="flex justify-center my-2">
                        <ReactStars
                            count={5}
                            value={Number(averageRating) || 0}
                            edit={false}
                            size={24}
                            activeColor="#fbbf24"
                        />
                    </div>
                    <div className="text-gray-500">{numReviews} Reviews</div>
                </div>

                <div className="flex-grow border-l pl-8">
                    {/* Simplified distribution bars could go here */}
                    <div className="text-sm text-gray-500">
                        Share your thoughts with other customers
                    </div>
                    {user?.role === 'buyer' ? (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                        >
                            Write a Review
                        </button>
                    ) : (
                        <p className="mt-4 text-sm text-gray-500">Only buyers can leave reviews</p>
                    )}
                </div>
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-lg font-semibold mb-3">Write a Review</h4>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Rating</label>
                        <ReactStars
                            count={5}
                            onChange={ratingChanged}
                            size={30}
                            activeColor="#fbbf24"
                            value={newReview.rating}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Comment</label>
                        <textarea
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            rows="4"
                            value={newReview.comment}
                            onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                            required
                            placeholder="What did you like or dislike?"
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Submit Review
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <p className="text-gray-500">No reviews yet.</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className="border-b pb-6">
                            <div className="flex items-center mb-2">
                                <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold mr-3">
                                        {review.userId?.name.charAt(0)}
                                    </div>
                                    <span className="font-semibold">{review.userId?.name}</span>
                                </div>
                                <span className="mx-2 text-gray-300">•</span>
                                <span className="text-gray-500 text-sm">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center mb-2">
                                <ReactStars
                                    count={5}
                                    value={review.rating}
                                    edit={false}
                                    size={18}
                                    activeColor="#fbbf24"
                                />
                            </div>
                            <p className="text-gray-600">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Reviews;
