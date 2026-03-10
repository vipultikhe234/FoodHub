import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ClipboardList, ChefHat, Bike, Gift, HelpCircle, MapPin, SearchX, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const OrderStatus = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const steps = [
        { label: 'Order Confirmed', status: 'pending', icon: ClipboardList, desc: 'Your order has been received' },
        { label: 'Preparing', status: 'preparing', icon: ChefHat, desc: 'Kitchen is cooking your meal' },
        { label: 'Out for Delivery', status: 'dispatched', icon: Bike, desc: 'Rider is on the way' },
        { label: 'Delivered', status: 'delivered', icon: Gift, desc: 'Enjoy your meal!' },
    ];

    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 4;
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
                // Retry on 404 / network issues (race with DB commit)
                if (attempts < maxAttempts) {
                    timeoutId = setTimeout(fetchOrder, 800);
                } else {
                    console.error('Order fetch failed after retries:', err);
                    setLoading(false);
                }
            }
        };

        fetchOrder();
        return () => clearTimeout(timeoutId); // cleanup on unmount
    }, [id, navigate]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-white">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] animate-pulse">Syncing Status...</p>
        </div>
    );

    if (!order) return (
        <div className="flex flex-col items-center justify-center min-h-screen p-12 text-center bg-white">
            <SearchX size={64} className="text-gray-200 mb-6" strokeWidth={1.5} />
            <h1 className="text-2xl font-black text-red-500 italic mb-2">Order Not Found</h1>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-8">This order doesn't exist or doesn't belong to you</p>
            <button onClick={() => navigate('/orders')} className="bg-gray-900 text-white font-black px-8 py-4 rounded-full uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl shadow-gray-900/20">
                View Valid Orders
            </button>
        </div>
    );

    const currentStepIndex = steps.findIndex(s => s.status === order.status);
    const progressPercent = currentStepIndex < 0 ? 0 : (currentStepIndex / (steps.length - 1)) * 100;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white min-h-screen pb-10 font-sans selection:bg-orange-500/20"
        >
            {/* Header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-50 px-6 py-4 flex items-center gap-4 z-40">
                <button
                    onClick={() => navigate('/orders')}
                    className="bg-gray-50 p-3 rounded-full active:scale-90 transition-transform flex items-center justify-center text-gray-900"
                >
                    <ChevronLeft size={20} className="stroke-[2.5]" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-black tracking-tighter text-gray-900 leading-none">Tracking</h1>
                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.3em] mt-1">#HVB-{String(order.id).padStart(4, '0')}</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${order.status === 'delivered' ? 'bg-green-50 text-green-600 border border-green-100' :
                    order.status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-100' :
                        order.status === 'dispatched' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                            'bg-orange-500 text-white shadow-orange-500/20 shadow-md'
                    }`}>
                    {order.status}
                </div>
            </div>

            <div className="px-6 pt-6 space-y-6">
                {/* Progress Tracker */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-gray-50/50 rounded-[40px] p-6 pr-8 border border-gray-100/50 relative overflow-hidden"
                >
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/5 rounded-full blur-[40px]"></div>
                    <div className="relative">
                        {/* Background track */}
                        <div className="absolute left-[23px] top-6 bottom-6 w-[2px] bg-gray-200/60 rounded-full"></div>
                        {/* Progress fill */}
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `calc(${progressPercent}% * (100% - 48px) / 100)` }}
                            transition={{ duration: 1, delay: 0.2, type: "spring" }}
                            className="absolute left-[23px] top-6 w-[2px] bg-gradient-to-b from-orange-500 to-amber-400 rounded-full"
                        ></motion.div>

                        <div className="space-y-6 relative z-10">
                            {steps.map((step, idx) => {
                                const isComplete = idx < currentStepIndex;
                                const isCurrent = idx === currentStepIndex;
                                const isPending = idx > currentStepIndex;
                                const StepIcon = step.icon;

                                return (
                                    <div key={idx} className={`flex items-center gap-5 transition-all duration-500 ${isPending ? 'opacity-40' : ''}`}>
                                        <div className={`w-[48px] h-[48px] rounded-[20px] flex items-center justify-center shrink-0 transition-all duration-500 relative z-10 border-2 ${isComplete ? 'bg-gray-900 border-gray-900 text-white shadow-[0_8px_20px_rgba(17,24,39,0.15)]' :
                                            isCurrent ? 'bg-orange-500 border-orange-500 text-white shadow-[0_8px_24px_rgba(249,115,22,0.3)]' :
                                                'bg-white border-gray-100 text-gray-400'
                                            }`}>
                                            <StepIcon size={20} className={isCurrent ? 'animate-pulse' : ''} />
                                        </div>
                                        <div className="flex-1 py-1">
                                            <h4 className={`font-black text-sm tracking-tight ${isComplete ? 'text-gray-400 line-through decoration-gray-300' :
                                                isCurrent ? 'text-gray-900' :
                                                    'text-gray-400'
                                                }`}>{step.label}</h4>
                                            <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${isCurrent ? 'text-orange-500' : 'text-gray-400'
                                                }`}>
                                                {isComplete ? 'Done' : isCurrent ? 'Active phase ●' : 'Waiting'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Delivery Address */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                            <MapPin size={16} />
                        </div>
                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Delivery Details</p>
                    </div>
                    <p className="font-bold text-gray-500 text-sm leading-relaxed pl-[44px]">{order.address || 'Address not listed'}</p>
                </motion.div>

                {/* Order Items */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-900 rounded-[40px] p-6 text-white relative overflow-hidden shadow-2xl shadow-gray-900/10"
                >
                    <div className="absolute -top-20 -right-20 w-48 h-48 bg-orange-500/20 rounded-full blur-[60px] mix-blend-screen pointer-events-none"></div>

                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                        <Box size={14} /> Order Summary
                    </p>

                    <div className="space-y-3 relative z-10 mb-6">
                        {order.items?.map(item => (
                            <div key={item.id} className="flex gap-4 items-center bg-white/5 p-4 rounded-3xl border border-white/5 backdrop-blur-sm transition-colors hover:bg-white/10">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl overflow-hidden shrink-0 border border-white/5 relative">
                                    {item.product?.image_url ? (
                                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-white/30"><HelpCircle size={20} /></div>
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col justify-center">
                                    <p className="font-extrabold text-[12px] leading-snug tracking-tight text-white mb-1 line-clamp-1">{item.product?.name || 'Local Favorite'}</p>
                                    <div className="flex justify-between items-center w-full">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                            Qty: <span className="text-white">{item.quantity}</span>
                                        </p>
                                        <p className="font-black text-orange-400 tracking-tight">₹{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-5 border-t border-white/10 flex justify-between items-end relative z-10">
                        <div>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</p>
                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${order.payment_status === 'paid'
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-white/10 text-white border-white/5'
                                }`}>
                                {order.payment_status === 'paid'
                                    ? '● Payment Received'
                                    : (order.payment?.payment_method === 'stripe' ? 'Paid: Card' : 'Pay on Delivery')}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Grand Total</p>
                            <span className="text-3xl font-black tracking-tighter text-white">₹{parseFloat(order.total_price).toFixed(2)}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Safe area padding */}
                <div className="h-4"></div>
            </div>
        </motion.div>
    );
};

export default OrderStatus;
