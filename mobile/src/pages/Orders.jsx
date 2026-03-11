import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { orderService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    PackageOpen,
    FileText,
    ArrowRight,
    Clock,
    CheckCircle2,
    XCircle,
    Timer,
    ShoppingBag
} from 'lucide-react';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await orderService.getUserOrders();
                setOrders(response.data.data);
            } catch (error) {
                console.error("Orders error:", error);
                if (error.response?.status === 401) navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [navigate]);

    const getStatusStyle = (status) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return {
                    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
                    text: 'text-emerald-600 dark:text-emerald-400',
                    icon: CheckCircle2,
                    glow: 'bg-emerald-500/20'
                };
            case 'cancelled':
                return {
                    bg: 'bg-rose-50 dark:bg-rose-500/10',
                    text: 'text-rose-600 dark:text-rose-400',
                    icon: XCircle,
                    glow: 'bg-rose-500/20'
                };
            default:
                return {
                    bg: 'bg-orange-50 dark:bg-orange-500/10',
                    text: 'text-orange-600 dark:text-orange-400',
                    icon: Timer,
                    glow: 'bg-orange-500/20'
                };
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4 bg-[#FDFDFD] dark:bg-[#0B0F1A]">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-300 dark:text-gray-600 uppercase tracking-[0.4em] animate-pulse">Loading Orders...</p>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#FDFDFD] dark:bg-[#0B0F1A] min-h-screen pt-8 pb-32 px-6"
        >
            <div className="flex justify-between items-end mb-10">
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">History</p>
                    <h1 className="text-4xl font-[900] text-gray-900 dark:text-white font-['Outfit'] italic tracking-tighter leading-none flex items-center gap-3">
                        MY <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-500">ORDERS</span>
                    </h1>
                </div>
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl shadow-premium border border-gray-100 dark:border-white/5 flex items-center justify-center text-slate-400">
                    <FileText size={20} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <AnimatePresence mode="popLayout">
                    {orders.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-28 bg-white dark:bg-gray-900 rounded-[48px] border border-gray-100 dark:border-white/5 shadow-premium flex flex-col items-center justify-center p-8"
                        >
                            <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-8">
                                <PackageOpen size={48} strokeWidth={1} className="text-slate-300 dark:text-gray-600" />
                            </div>
                            <h3 className="text-2xl font-[900] text-gray-900 dark:text-white mb-3 font-['Outfit'] uppercase italic tracking-tighter">No Orders Yet</h3>
                            <p className="text-sm font-medium text-slate-400 dark:text-gray-500 mb-10 max-w-[240px] leading-relaxed italic">You haven't placed any orders yet. Explore our delicious menu!</p>

                            <Link to="/" className="w-full bg-slate-900 dark:bg-orange-500 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all">
                                Order Now
                            </Link>
                        </motion.div>
                    ) : (
                        orders.map((order, index) => {
                            const style = getStatusStyle(order.status);
                            const StatusIcon = style.icon;

                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.08 }}
                                    className="group"
                                >
                                    <Link to={`/order/${order.id}`} className="block relative">
                                        <div className="bg-white dark:bg-gray-800/40 p-8 rounded-[44px] border border-gray-100 dark:border-white/5 shadow-premium group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1 relative overflow-hidden">
                                            {/* Status Ambient Glow */}
                                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -mr-12 -mt-12 opacity-40 ${style.glow}`}></div>

                                            <div className="flex justify-between items-start mb-8 relative z-10">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="font-[900] text-gray-900 dark:text-white tracking-tight text-lg font-['Outfit']">Order #{order.id}</h3>
                                                        <div className={`w-2 h-2 rounded-full animate-pulse ${order.status === 'delivered' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-400 dark:text-gray-500">
                                                        <Clock size={12} />
                                                        <p className="text-[10px] font-black uppercase tracking-widest">
                                                            {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`${style.bg} ${style.text} px-5 py-2.5 rounded-[20px] flex items-center gap-2 border border-black/5 dark:border-white/5`}>
                                                    <StatusIcon size={14} strokeWidth={3} />
                                                    <span className="text-[10px] font-[900] uppercase tracking-widest">{order.status}</span>
                                                </div>
                                            </div>

                                            {/* Item Summary */}
                                            <div className="flex flex-wrap gap-2 mb-8 relative z-10">
                                                {order.items?.slice(0, 3).map((item, i) => (
                                                    <div key={i} className="bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-orange-500 leading-none">{item.quantity}x</span>
                                                        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 truncate max-w-[80px]">{item.product?.name}</span>
                                                    </div>
                                                ))}
                                                {order.items?.length > 3 && (
                                                    <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl flex items-center text-[10px] font-black">
                                                        +{order.items.length - 3} More
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-end relative z-10 border-t border-slate-50 dark:border-white/5 pt-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-300 dark:text-gray-600 uppercase tracking-[0.2em] mb-1">Total Amount</span>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-sm font-[900] text-orange-500 font-['Outfit'] mt-1 italic">₹</span>
                                                        <span className="text-3xl font-[900] text-gray-900 dark:text-white font-['Outfit'] tracking-tighter italic leading-none">{parseFloat(order.total_price).toFixed(0)}</span>
                                                    </div>
                                                </div>
                                                <motion.div
                                                    whileHover={{ x: 5 }}
                                                    className="w-14 h-14 rounded-[24px] bg-slate-900 dark:bg-orange-500 text-white flex items-center justify-center shadow-xl shadow-slate-900/10 active:scale-90 transition-all"
                                                >
                                                    <ArrowRight size={24} strokeWidth={2.5} />
                                                </motion.div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            {/* Account Summary Bubble */}
            {orders.length > 0 && (
                <div className="mt-16 bg-slate-900 dark:bg-orange-500 rounded-[44px] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 flex justify-between items-center">
                        <div className="space-y-4">
                            <h4 className="text-2xl font-[900] font-['Outfit'] leading-tight italic uppercase">Account Summary</h4>
                            <div className="flex gap-8">
                                <div>
                                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Total Spent</p>
                                    <p className="text-xl font-[900] font-['Outfit'] tracking-tighter italic leading-none">₹{orders.reduce((acc, o) => acc + parseFloat(o.total_price), 0).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Orders</p>
                                    <p className="text-xl font-[900] font-['Outfit'] tracking-tighter italic leading-none">{orders.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md">
                            <ShoppingBag size={28} />
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-full bg-white/5 -skew-x-12 translate-x-12"></div>
                </div>
            )}
        </motion.div>
    );
};

export default Orders;
