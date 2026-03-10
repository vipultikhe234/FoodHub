import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { orderService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, PackageOpen, FileText, ArrowRight } from 'lucide-react';

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
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Retrieving History...</p>
        </div>
    );

    return (
        <div className="bg-white min-h-screen pt-6 px-6 pb-32 font-sans selection:bg-orange-500/20">
            <h1 className="text-3xl font-black italic tracking-tighter text-gray-900 mb-8 flex items-center gap-3">
                <FileText size={28} className="text-orange-500" /> Order History
            </h1>

            <div className="grid grid-cols-1 gap-5">
                <AnimatePresence>
                    {orders.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-24 bg-gray-50/80 rounded-[40px] border border-gray-100/50 flex flex-col items-center justify-center p-6"
                        >
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                                <PackageOpen size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 mb-2">No past orders</h3>
                            <p className="text-xs font-medium text-gray-400 mb-8 max-w-[200px] leading-relaxed">It looks like the pantry is completely empty.</p>

                            <Link to="/" className="bg-gray-900 text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all outline-none">
                                Start an Order
                            </Link>
                        </motion.div>
                    ) : (
                        orders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link to={`/order/${order.id}`} className="block group active:scale-95 transition-all">
                                    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] group-hover:border-orange-500/30 group-hover:shadow-[0_8px_30px_rgba(249,115,22,0.06)] relative overflow-hidden transition-all duration-300">
                                        {/* Status glowing accent */}
                                        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] -mr-16 -mt-16 opacity-20 pointer-events-none transition-colors ${order.status === 'delivered' ? 'bg-green-500' :
                                                order.status === 'cancelled' ? 'bg-red-500' : 'bg-orange-500'
                                            }`} />

                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                            <div>
                                                <h3 className="font-extrabold text-gray-900 tracking-tight text-sm">Order #HVB-{order.id}</h3>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                                    {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                </p>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                                                order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                                    'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-6 relative z-10 p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                                            {order.items?.map(item => (
                                                <div key={item.id} className="flex justify-between items-center text-xs">
                                                    <span className="font-bold text-gray-600 truncate mr-2">
                                                        <span className="text-orange-500">{item.quantity}x</span> {item.product?.name}
                                                    </span>
                                                    <span className="font-bold text-gray-400 shrink-0">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-between items-center pt-2 relative z-10">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Amount</span>
                                                <span className="text-xl font-black text-gray-900 tracking-tighter leading-none">₹{parseFloat(order.total_price).toFixed(2)}</span>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                                                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Orders;
