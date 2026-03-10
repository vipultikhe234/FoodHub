import React from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { useDashboardStats } from '../hooks/useDashboardStats';

const STATUS_COLORS = {
    pending: 'bg-yellow-50 text-yellow-600',
    preparing: 'bg-blue-50 text-blue-600',
    dispatched: 'bg-purple-50 text-purple-600',
    delivered: 'bg-green-50 text-green-600',
    cancelled: 'bg-red-50 text-red-500',
};

const Dashboard = () => {
    const { orders, stats, loading, error, handleStatusChange } = useDashboardStats();

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse italic">Syncing Platform Data...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center h-full space-y-4 text-center p-12">
            <p className="text-5xl">⚠️</p>
            <h2 className="text-xl font-black text-red-500 italic">Failed to Load Dashboard</h2>
            <p className="text-gray-400 font-bold text-sm max-w-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="bg-gray-900 text-white font-black px-8 py-4 rounded-[20px] uppercase tracking-widest text-xs hover:bg-orange-500 transition-all">
                Retry
            </button>
        </div>
    );

    const totalOrders = stats?.total_orders ?? orders.length;
    const totalRevenue = stats?.total_revenue ?? orders.reduce((s, o) => s + parseFloat(o.total_price || 0), 0);
    const totalUsers = stats?.total_users ?? '—';
    const totalProducts = stats?.total_products ?? '—';
    const recentCount = stats?.recent_orders_count ?? 0;

    // Real 7-day bar chart
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().split('T')[0];
        const dayOrders = orders.filter(o => o.created_at?.startsWith(key));
        return {
            day: d.toLocaleDateString('en-US', { weekday: 'short' }),
            total: dayOrders.reduce((s, o) => s + parseFloat(o.total_price || 0), 0),
            count: dayOrders.length,
        };
    });
    const maxBar = Math.max(...last7Days.map(d => d.total), 1);

    const statusBreakdown = ['pending', 'preparing', 'dispatched', 'delivered', 'cancelled'].map(s => ({
        status: s,
        count: orders.filter(o => o.status === s).length,
    }));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Command Center</h1>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">
                        Live Data · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
                <Link to="/orders" className="flex items-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-gray-900/20">
                    View All Orders ➔
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard label="Total Revenue" value={`₹${Number(totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon="💰" sub="All paid orders" accent="bg-green-500" />
                <StatCard label="Total Orders" value={totalOrders} icon="📦" sub={`+${recentCount} this week`} accent="bg-blue-500" />
                <StatCard label="Active Users" value={totalUsers} icon="👥" sub="Registered customers" accent="bg-purple-500" />
                <StatCard label="Products Live" value={totalProducts} icon="🍔" sub="In catalogue" accent="bg-orange-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-[40px] border border-gray-50 dark:border-gray-700 overflow-hidden">
                    <div className="px-8 py-6 flex justify-between items-center border-b border-gray-50 dark:border-gray-700">
                        <div>
                            <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight italic">Recent Orders</h3>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mt-0.5">Last {Math.min(orders.length, 6)} transactions</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Live</span>
                        </div>
                    </div>

                    {orders.length === 0 ? (
                        <div className="p-16 text-center">
                            <p className="text-5xl grayscale opacity-10 mb-4">📭</p>
                            <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] italic">No orders yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50 dark:divide-gray-700">
                            {orders.slice(0, 6).map((order) => (
                                <div key={order.id} className="px-8 py-4 flex items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                                    <div className="w-9 h-9 bg-gray-900 dark:bg-gray-600 rounded-[12px] flex items-center justify-center text-white font-black italic text-sm shrink-0">
                                        {order.user?.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-black text-gray-900 dark:text-white text-[11px] uppercase tracking-tight">{order.user?.name || 'Guest'}</p>
                                            <span className="text-[8px] font-bold text-gray-300 italic">#{String(order.id).padStart(4, '0')}</span>
                                        </div>
                                        <p className="text-[9px] text-gray-400 font-bold truncate">{order.user?.email || '—'}</p>
                                    </div>
                                    <div className="text-right shrink-0 mr-3">
                                        <p className="font-black text-gray-900 dark:text-white italic">₹{parseFloat(order.total_price).toFixed(2)}</p>
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-500'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    {/* Inline status change */}
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        className="bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-[10px] font-black rounded-[12px] p-2 outline-none focus:ring-2 focus:ring-orange-500 dark:text-white uppercase cursor-pointer shrink-0"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="preparing">Preparing</option>
                                        <option value="dispatched">Dispatched</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                    {/* 7-day chart */}
                    <div className="bg-gray-900 rounded-[40px] p-7 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-[60px]"></div>
                        <p className="text-[9px] font-black text-orange-400 uppercase tracking-[0.4em] mb-1 italic relative z-10">Revenue</p>
                        <h3 className="text-xl font-black italic relative z-10 mb-5">7-Day Trend</h3>
                        <div className="flex items-end gap-2 h-24 relative z-10">
                            {last7Days.map((d, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar">
                                    <div
                                        className="w-full bg-orange-500/30 rounded-t-lg group-hover/bar:bg-orange-500 transition-all duration-300"
                                        style={{ height: `${Math.max((d.total / maxBar) * 100, 4)}%` }}
                                        title={`$${d.total.toFixed(2)} · ${d.count} orders`}
                                    ></div>
                                    <span className="text-[8px] font-black text-gray-600 uppercase">{d.day.slice(0, 2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status breakdown */}
                    <div className="bg-white dark:bg-gray-800 rounded-[32px] p-7 border border-gray-50 dark:border-gray-700">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-5 italic">Order Status</p>
                        {orders.length === 0 ? (
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic text-center py-4">No data yet</p>
                        ) : (
                            <div className="space-y-3">
                                {statusBreakdown.filter(s => s.count > 0).map(({ status, count }) => (
                                    <div key={status} className="flex items-center gap-3">
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full w-20 text-center shrink-0 ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-500'}`}>
                                            {status}
                                        </span>
                                        <div className="flex-1 h-2 bg-gray-50 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gray-900 dark:bg-orange-500 rounded-full transition-all duration-700"
                                                style={{ width: `${totalOrders > 0 ? (count / totalOrders) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[11px] font-black text-gray-900 dark:text-white italic w-5 text-right shrink-0">{count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
