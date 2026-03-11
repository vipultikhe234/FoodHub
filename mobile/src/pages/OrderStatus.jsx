import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ClipboardList, ChefHat, Bike, Gift, HelpCircle, MapPin, SearchX, Box, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const OrderStatus = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const steps = [
        { label: 'Confirmed', status: 'pending', icon: ClipboardList, desc: 'We received your order' },
        { label: 'Preparing', status: 'preparing', icon: ChefHat, desc: 'Chef is cooking' },
        { label: 'On the way', status: 'dispatched', icon: Bike, desc: 'Rider is nearby' },
        { label: 'Delivered', status: 'delivered', icon: Gift, desc: 'Enjoy your food' },
    ];

    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 3;
        let timeoutId;

        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/${id}`);
                setOrder(res.data.data);
                setLoading(false);
            } catch (err) {
                attempts++;
                if (err.response?.status === 401) {
                    navigate('/login');
                    return;
                }
                if (attempts < maxAttempts) {
                    timeoutId = setTimeout(fetchOrder, 1000);
                } else {
                    setLoading(false);
                }
            }
        };

        fetchOrder();
        return () => clearTimeout(timeoutId);
    }, [id, navigate]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4 bg-[#FDFDFD] dark:bg-[#0B0F1A]">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-300 dark:text-gray-600 uppercase tracking-[0.4em] animate-pulse">Tracking Order...</p>
        </div>
    );

    if (!order) return (
        <div className="flex flex-col items-center justify-center min-h-screen p-12 text-center bg-[#FDFDFD] dark:bg-[#0B0F1A]">
            <SearchX size={64} className="text-rose-500 mb-8" />
            <h1 className="text-4xl font-[900] text-gray-900 dark:text-white font-['Outfit'] italic tracking-tighter mb-4">ORDER_LOST</h1>
            <button onClick={() => navigate('/orders')} className="text-orange-500 font-black uppercase tracking-widest text-[10px] border-b-2 border-orange-500/20 pb-1">View My Orders</button>
        </div>
    );

    const currentStepIndex = steps.findIndex(s => s.status === order.status);
    const progressPercent = currentStepIndex < 0 ? 0 : (currentStepIndex / (steps.length - 1)) * 100;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#FDFDFD] dark:bg-[#0B0F1A] min-h-screen pb-20 font-sans"
        >
            {/* Premium Header */}
            <div className="sticky top-0 bg-[#FDFDFD]/90 dark:bg-[#0B0F1A]/90 backdrop-blur-2xl border-b border-gray-100 dark:border-white/5 px-6 pt-8 pb-4 flex items-center gap-4 z-40">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/orders')}
                    className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl shadow-premium border border-gray-100 dark:border-white/5 flex items-center justify-center text-slate-900 dark:text-white"
                >
                    <ChevronLeft size={24} />
                </motion.button>
                <div className="flex-1">
                    <h1 className="text-xl font-[900] text-gray-900 dark:text-white font-['Outfit'] uppercase italic tracking-tighter">Track Order</h1>
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-0.5 leading-none">ID #{String(order.id).padStart(4, '0')}</p>
                </div>
                <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-[900] uppercase tracking-widest shadow-lg ${order.status === 'delivered' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                        order.status === 'cancelled' ? 'bg-rose-500 text-white shadow-rose-500/20' :
                            'bg-slate-900 dark:bg-orange-500 text-white shadow-orange-500/20'
                    }`}>
                    {order.status}
                </div>
            </div>

            <div className="px-8 mt-10 space-y-10">
                {/* Visual Progress Hub */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white dark:bg-gray-800/40 rounded-[48px] p-8 border border-gray-100 dark:border-white/5 shadow-premium relative overflow-hidden"
                >
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/5 rounded-full blur-[40px]"></div>

                    <div className="relative">
                        {/* Status Track */}
                        <div className="absolute left-[27px] top-6 bottom-6 w-[3px] bg-slate-100 dark:bg-white/5 rounded-full"></div>
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `calc(${progressPercent}% * (100% - 54px) / 100)` }}
                            transition={{ duration: 1.5, delay: 0.5, type: "spring" }}
                            className="absolute left-[27px] top-6 w-[3px] bg-gradient-to-b from-orange-500 to-amber-400 rounded-full"
                        />

                        <div className="space-y-10 relative z-10">
                            {steps.map((step, idx) => {
                                const isComplete = idx < currentStepIndex;
                                const isCurrent = idx === currentStepIndex;
                                const isPending = idx > currentStepIndex;
                                const StepIcon = step.icon;

                                return (
                                    <div key={idx} className={`flex items-center gap-6 transition-all duration-700 ${isPending ? 'opacity-30' : 'opacity-100'}`}>
                                        <div className={`w-[56px] h-[56px] rounded-[24px] flex items-center justify-center shrink-0 transition-all duration-700 border-2 ${isComplete ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 shadow-xl' :
                                                isCurrent ? 'bg-orange-500 border-orange-500 text-white shadow-2xl shadow-orange-500/30' :
                                                    'bg-white dark:bg-gray-900 border-slate-50 dark:border-white/5 text-slate-300'
                                            }`}>
                                            <StepIcon size={24} className={isCurrent ? 'animate-pulse' : ''} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`font-[900] text-lg tracking-tight font-['Outfit'] italic uppercase ${isComplete ? 'text-slate-400 dark:text-gray-600 line-through' :
                                                    isCurrent ? 'text-gray-900 dark:text-white' :
                                                        'text-slate-300 dark:text-gray-700'
                                                }`}>{step.label}</h4>
                                            <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${isCurrent ? 'text-orange-500' : 'text-slate-400'}`}>
                                                {isComplete ? 'Verified' : isCurrent ? 'In Progress' : 'Pending'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Delivery Node */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800/40 rounded-[40px] p-8 border border-gray-100 dark:border-white/5 shadow-premium flex items-start gap-5"
                >
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-['Outfit']">Delivery Address</p>
                        <p className="font-bold text-gray-900 dark:text-white text-sm leading-relaxed italic">{order.address || 'Standard Location'}</p>
                    </div>
                </motion.div>

                {/* Order Summary Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-900 dark:bg-gray-900 rounded-[48px] p-8 text-white relative overflow-hidden shadow-2xl"
                >
                    <div className="absolute -top-20 -right-20 w-48 h-48 bg-orange-500/10 rounded-full blur-[60px]"></div>

                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                            <Box size={20} className="text-orange-500" />
                        </div>
                        <h3 className="text-sm font-[900] font-['Outfit'] uppercase tracking-widest italic">Order Summary</h3>
                    </div>

                    <div className="space-y-4 mb-10">
                        {order.items?.map(item => (
                            <div key={item.id} className="flex gap-4 items-center bg-white/5 p-4 rounded-[28px] border border-white/5 backdrop-blur-sm">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl overflow-hidden shrink-0 border border-white/5">
                                    {item.product?.image_url ? (
                                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/20"><HelpCircle size={24} /></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-[900] text-sm text-white font-['Outfit'] italic uppercase tracking-tight line-clamp-1">{item.product?.name}</p>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Qty: {item.quantity}</p>
                                        <p className="font-[900] text-white font-['Outfit']">₹{(item.price * item.quantity).toFixed(0)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Final Valuation */}
                    <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={12} className="text-emerald-500" />
                                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Payment {order.payment_status}</span>
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Grand Total</p>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-[900] text-orange-500 font-['Outfit'] italic mr-1">₹</span>
                            <span className="text-4xl font-[900] text-white font-['Outfit'] tracking-tighter italic leading-none">{parseFloat(order.total_price).toFixed(0)}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Safe Navigation */}
                <Link to="/" className="block w-full py-6 bg-slate-50 dark:bg-white/5 rounded-[32px] text-center text-[10px] font-black text-slate-400 hover:text-orange-500 uppercase tracking-[0.4em] transition-all">
                    Discover More
                </Link>
            </div>
        </motion.div>
    );
};

export default OrderStatus;
