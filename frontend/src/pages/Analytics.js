import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function Analytics() {
    const [salesOverview, setSalesOverview] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [revenueData, setRevenueData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [overviewRes, topProductsRes, revenueRes] = await Promise.all([
                analyticsAPI.getSalesOverview(),
                analyticsAPI.getTopProducts(),
                analyticsAPI.getRevenueChart()
            ]);

            setSalesOverview(overviewRes.data);
            setTopProducts(topProductsRes.data);
            setRevenueData(revenueRes.data);
        } catch (error) {
            console.error('Failed to load analytics', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading analytics...</div>;

    const barData = {
        labels: revenueData?.map(d => d.date) || [],
        datasets: [
            {
                label: 'Revenue (₹)',
                data: revenueData?.map(d => d.amount) || [],
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
        ],
    };

    const pieData = {
        labels: topProducts.map(p => p.name),
        datasets: [
            {
                label: '# of Sales',
                data: topProducts.map(p => p.sales),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Farmer Analytics Dashboard</h1>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">₹{salesOverview?.totalRevenue || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{salesOverview?.totalOrders || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Avg. Order Value</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">₹{salesOverview?.avgOrderValue || 0}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                    <Bar options={{ responsive: true }} data={barData} />
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Top Products</h3>
                    <div className="w-full max-w-xs mx-auto">
                        <Pie data={pieData} />
                    </div>
                </div>
            </div>

            {/* Top Products Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold">Product Performance</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {topProducts.map((product) => (
                            <tr key={product._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sales}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{product.revenue}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Analytics;
