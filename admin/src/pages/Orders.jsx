import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePayment from '../components/StripePayment';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const STATUS_CONFIG = {
    // ... rest of STATUS_CONFIG
    pending: { color: 'bg-yellow-50 text-yellow-600', dot: 'bg-yellow-400', label: 'Pending' },
    preparing: { color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500', label: 'Preparing' },
    dispatched: { color: 'bg-purple-50 text-purple-600', dot: 'bg-purple-500', label: 'Dispatched' },
    delivered: { color: 'bg-green-50 text-green-600', dot: 'bg-green-500', label: 'Delivered' },
    cancelled: { color: 'bg-red-50 text-red-600', dot: 'bg-red-500', label: 'Cancelled' },
};

const PAY_STATUS = {
    paid: 'bg-green-50 text-green-600',
    pending: 'bg-gray-100 text-gray-500',
    failed: 'bg-red-50 text-red-500',
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [stripeModal, setStripeModal] = useState({ show: false, orderId: null });
    const [clientSecret, setClientSecret] = useState('');
    const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const response = await orderService.getAllOrders();
            setOrders(response.data.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        const order = orders.find(o => o.id === id);
        if (!order) return;

        // Special handling for COD orders being marked as delivered
        if (newStatus === 'delivered' && order.payment_status !== 'paid') {
            setUpdatingId(id);
            try {
                const response = await orderService.initiatePayment(id);
                setClientSecret(response.data.data.client_secret);
                setPendingStatusUpdate({ id, status: newStatus });
                setStripeModal({ show: true, orderId: id });
                return;
            } catch (error) {
                alert(`❌ Failed to initiate payment: ${error.response?.data?.message || error.message}`);
                setUpdatingId(null);
                return;
            }
        }

        const prevStatus = order.status;
        // Optimistic update
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
        setUpdatingId(id);
        try {
            await orderService.updateStatus(id, newStatus);
        } catch (error) {
            // Revert on failure
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: prevStatus } : o));
            const msg = error.response?.data?.message
                || error.response?.data?.errors?.status?.[0]
                || 'Status update failed';
            alert(`❌ ${msg}`);
        } finally {
            setUpdatingId(null);
        }
    };

    const handlePaymentSuccess = async () => {
        if (!pendingStatusUpdate) return;
        const { id, status } = pendingStatusUpdate;

        try {
            // After successful payment, the backend update will have been done by Stripe handler 
            // but we still need to set the order status to Delivered
            await orderService.updateStatus(id, status);
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status, payment_status: 'paid' } : o));
            setStripeModal({ show: false, orderId: null });
            setPendingStatusUpdate(null);
        } catch (error) {
            const msg = error.response?.data?.message || 'Update failed';
            alert(`❌ Payment was successful, but failed to update order delivery status: ${msg}`);
        } finally {
            setUpdatingId(null);
        }
    };

    const handlePaymentStatusChange = async (id, newPayStatus) => {
        const prevPayStatus = orders.find(o => o.id === id)?.payment_status;
        setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: newPayStatus } : o));
        setUpdatingId(id);
        try {
            await orderService.updatePaymentStatus(id, newPayStatus);
        } catch (error) {
            setOrders(prev => prev.map(o => o.id === id ? { ...o, payment_status: prevPayStatus } : o));
            alert(`❌ Payment status update failed: ${error.response?.data?.message || 'Unknown error'}`);
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(o => o.status === filterStatus);

    const statusCounts = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, {});

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse italic">Syncing Order Pipeline...</p>
        </div>
    );

    return (
        <Elements stripe={stripePromise}>
            <div className="space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Order Pipeline</h1>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">{orders.length} Total Orders in System</p>
                    </div>
                    <button
                        onClick={fetchOrders}
                        className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-300 px-6 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:border-orange-500 hover:text-orange-500 transition-all"
                    >
                        ↻ Refresh
                    </button>
                </div>

                {/* Status KPI Cards */}
                <div className="grid grid-cols-5 gap-4">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <button
                            key={key}
                            onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}
                            className={`p-5 rounded-[28px] border-2 transition-all text-left ${filterStatus === key
                                ? 'border-gray-900 bg-gray-900 text-white shadow-2xl shadow-gray-900/20 scale-105'
                                : 'border-gray-50 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-200'
                                }`}
                        >
                            <div className={`flex items-center gap-2 mb-3`}>
                                <span className={`w-2 h-2 rounded-full ${filterStatus === key ? 'bg-orange-500' : cfg.dot}`}></span>
                                <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${filterStatus === key ? 'text-gray-400' : 'text-gray-400'}`}>{cfg.label}</span>
                            </div>
                            <p className={`text-3xl font-black italic tracking-tighter ${filterStatus === key ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                {statusCounts[key] || 0}
                            </p>
                        </button>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 flex-wrap">
                    {['all', ...Object.keys(STATUS_CONFIG)].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${filterStatus === status
                                ? 'bg-gray-900 text-white shadow-lg'
                                : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {status} {status !== 'all' && statusCounts[status] ? `(${statusCounts[status]})` : ''}
                        </button>
                    ))}
                </div>

                {/* Orders Table */}
                <div className="bg-white dark:bg-gray-800 rounded-[48px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-50 dark:border-gray-700/50 overflow-hidden">
                    {filteredOrders.length === 0 ? (
                        <div className="p-24 text-center">
                            <p className="text-6xl grayscale opacity-10 mb-6">📭</p>
                            <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] italic">No Orders in This Pipeline Stage</p>
                        </div>
                    ) : (
                        <table className="min-w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-700/30 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    <th className="px-10 py-7">Order</th>
                                    <th className="py-7 px-4">Customer</th>
                                    <th className="py-7 px-4">Value</th>
                                    <th className="py-7 px-4">Payment</th>
                                    <th className="py-7 px-4">Status</th>
                                    <th className="py-7 px-4">Update</th>
                                    <th className="px-6 py-7 text-right">Detail</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => {
                                    const isExpanded = expandedId === order.id;
                                    const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                                    const isUpdating = updatingId === order.id;

                                    return (
                                        <React.Fragment key={order.id}>
                                            <tr className={`group border-t border-gray-50 dark:border-gray-700 transition-all duration-300 ${isExpanded ? 'bg-gray-50/30 dark:bg-gray-700/10' : 'hover:bg-gray-50/20 dark:hover:bg-gray-700/10'}`}>
                                                <td className="px-10 py-6">
                                                    <div>
                                                        <p className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-lg italic leading-none">#ORD-{String(order.id).padStart(4, '0')}</p>
                                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1">{order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gray-900 dark:bg-gray-600 rounded-full flex items-center justify-center text-white font-black italic text-sm shrink-0">
                                                            {order.user?.name?.[0]?.toUpperCase() || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-900 dark:text-white text-[11px] uppercase tracking-widest">{order.user?.name || 'Guest'}</p>
                                                            <p className="text-[9px] text-gray-400 font-bold italic truncate max-w-[130px]">{order.user?.email || '—'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-4">
                                                    <span className="text-2xl font-black italic tracking-tighter text-gray-900 dark:text-white">₹{parseFloat(order.total_price).toFixed(2)}</span>
                                                </td>
                                                <td className="py-6 px-4">
                                                    <div className="flex flex-col gap-1">
                                                        <select
                                                            value={order.payment_status || 'pending'}
                                                            onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                                                            disabled={updatingId === order.id}
                                                            className={`appearance-none px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest w-fit outline-none cursor-pointer border-none ${PAY_STATUS[order.payment_status] || PAY_STATUS.pending} hover:brightness-95 transition-all focus:ring-0`}
                                                        >
                                                            <option value="pending" className="bg-white text-gray-700">Pending</option>
                                                            <option value="paid" className="bg-white text-gray-700">Paid</option>
                                                            <option value="failed" className="bg-white text-gray-700">Failed</option>
                                                            <option value="refunded" className="bg-white text-gray-700">Refunded</option>
                                                        </select>
                                                        <span className="text-[8px] text-gray-300 font-black uppercase tracking-wider italic flex items-center gap-1">
                                                            {order.payment?.payment_method === 'cod' && order.payment_status !== 'paid' && (
                                                                <span className="w-1 h-1 rounded-full bg-orange-400 animate-pulse"></span>
                                                            )}
                                                            {order.payment?.payment_method || 'COD'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-4">
                                                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${statusCfg.color}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} ${order.status === 'pending' ? 'animate-pulse' : ''}`}></span>
                                                        {statusCfg.label}
                                                    </span>
                                                </td>
                                                <td className="py-6 px-4">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        disabled={isUpdating}
                                                        className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[9px] font-black uppercase rounded-[14px] px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 border border-gray-100 dark:border-gray-600 tracking-widest disabled:opacity-50 cursor-pointer transition-all"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="preparing">Preparing</option>
                                                        <option value="dispatched">Dispatched</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <button
                                                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                                        className={`w-12 h-12 rounded-[18px] flex items-center justify-center font-black transition-all ${isExpanded ? 'bg-gray-900 text-white rotate-180' : 'bg-gray-50 dark:bg-gray-700 text-gray-400 hover:bg-gray-900 hover:text-white'}`}
                                                    >
                                                        ↓
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* Expanded Row: Order Items */}
                                            {isExpanded && (
                                                <tr className="border-t border-gray-50 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-700/10">
                                                    <td colSpan={7} className="px-10 pb-8 pt-2">
                                                        <div className="grid grid-cols-2 gap-6">
                                                            {/* Items */}
                                                            <div>
                                                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] mb-4 italic">Order Items</p>
                                                                <div className="space-y-3">
                                                                    {order.items?.map(item => (
                                                                        <div key={item.id} className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-[20px] border border-gray-50 dark:border-gray-700">
                                                                            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-[14px] overflow-hidden shrink-0 border border-gray-100 dark:border-white/5">
                                                                                {item.product?.image_url ? (
                                                                                    <img src={item.product.image_url} className="w-full h-full object-cover" alt={item.product.name} />
                                                                                ) : (
                                                                                    <div className="w-full h-full flex items-center justify-center text-xl opacity-30">🍱</div>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <p className="font-black text-gray-900 dark:text-white text-[11px] uppercase tracking-tighter">{item.product?.name || 'Product'}</p>
                                                                                <p className="text-[9px] text-gray-400 font-bold italic">Qty: {item.quantity}</p>
                                                                            </div>
                                                                            <p className="font-black text-orange-500 italic">₹{parseFloat(item.price * item.quantity).toFixed(2)}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Delivery & Payment Info */}
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] mb-3 italic">Delivery Address</p>
                                                                    <div className="bg-white dark:bg-gray-800 p-5 rounded-[20px] border border-gray-50 dark:border-gray-700">
                                                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 italic">{order.address || '—'}</p>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] mb-3 italic">Payment Summary</p>
                                                                    <div className="bg-white dark:bg-gray-800 p-5 rounded-[20px] border border-gray-50 dark:border-gray-700 space-y-2">
                                                                        <div className="flex justify-between">
                                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Method</span>
                                                                            <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase italic">{order.payment?.payment_method || 'COD'}</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</span>
                                                                            <span className="text-[10px] font-black text-orange-500 italic">₹{parseFloat(order.total_price).toFixed(2)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pay Status</span>
                                                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${PAY_STATUS[order.payment_status] || PAY_STATUS.pending}`}>{order.payment_status || 'pending'}</span>
                                                                        </div>
                                                                        {order.payment?.transaction_id && (
                                                                            <div className="flex justify-between pt-2 border-t border-gray-50 dark:border-gray-700">
                                                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">TXN ID</span>
                                                                                <span className="text-[9px] font-mono text-gray-500 truncate max-w-[140px]">{order.payment.transaction_id}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {stripeModal.show && (
                <StripePayment
                    clientSecret={clientSecret}
                    orderId={stripeModal.orderId}
                    onSucceeded={handlePaymentSuccess}
                    onCancel={() => {
                        setStripeModal({ show: false, orderId: null });
                        setUpdatingId(null);
                    }}
                />
            )}
        </Elements>
    );
};

export default Orders;
