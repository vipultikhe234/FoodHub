import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ShoppingBag,
    Plus,
    Minus,
    Trash2,
    ArrowRight,
    Ticket,
    ReceiptText,
    Wallet,
    ChevronRight
} from 'lucide-react';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart();
    const navigate = useNavigate();

    const safeSubtotal = parseFloat(subtotal || 0);
    const deliveryFee = cartItems.length > 0 ? 30.00 : 0;
    const taxes = safeSubtotal * 0.05; // 5% GST
    const total = safeSubtotal + deliveryFee + taxes;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="pb-32 bg-[#FDFDFD] dark:bg-[#0B0F1A] min-h-screen"
        >
            {/* Premium Sticky Header */}
            <div className="px-6 pt-8 pb-4 sticky top-0 z-40 bg-[#FDFDFD]/90 dark:bg-[#0B0F1A]/90 backdrop-blur-2xl flex items-center justify-between border-b border-gray-100 dark:border-white/5">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(-1)}
                    className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl shadow-premium border border-gray-100 dark:border-white/5 flex items-center justify-center text-slate-900 dark:text-white"
                >
                    <ChevronLeft size={24} />
                </motion.button>
                <div className="text-center">
                    <h2 className="text-lg font-[900] text-gray-900 dark:text-white font-['Outfit'] italic uppercase tracking-tight">Shopping Cart</h2>
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{cartItems.length} curated items</p>
                </div>
                <div className="w-12 h-12"></div> {/* Spacer for alignment */}
            </div>

            <div className="px-6 mt-8 space-y-6">
                <AnimatePresence mode="popLayout">
                    {cartItems.length === 0 ? (
                        <motion.div
                            key="empty-cart"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-24 bg-white dark:bg-gray-900 rounded-[44px] shadow-premium border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center px-10"
                        >
                            <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-8">
                                <ShoppingBag size={48} className="text-slate-200" strokeWidth={1} />
                            </div>
                            <h3 className="text-2xl font-[900] text-gray-900 dark:text-white mb-3 font-['Outfit']">Awaiting flavors?</h3>
                            <p className="text-sm font-medium text-slate-400 dark:text-gray-500 mb-10 leading-relaxed italic">Your cart is currently empty. Explore our exclusive menu to add some premium bites.</p>

                            <Link to="/" className="w-full bg-slate-900 dark:bg-orange-500 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all">
                                Discover Menu
                            </Link>
                        </motion.div>
                    ) : (
                        cartItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                variants={itemVariants}
                                layout
                                exit={{ opacity: 0, x: -50 }}
                                className="group bg-white dark:bg-gray-800/40 p-4 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-premium flex items-center gap-5 relative overflow-hidden active:scale-[0.98] transition-all"
                            >
                                {/* Left Image */}
                                <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-[24px] overflow-hidden shrink-0 border border-slate-100 dark:border-white/5">
                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-[900] text-gray-900 dark:text-white text-base font-['Outfit'] truncate pr-2 tracking-tight transition-colors group-hover:text-orange-500">{item.name}</h4>
                                        <motion.button
                                            whileTap={{ scale: 0.8 }}
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-slate-300 dark:text-gray-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1"
                                        >
                                            <Trash2 size={18} strokeWidth={1.5} />
                                        </motion.button>
                                    </div>

                                    <div className="flex items-end justify-between">
                                        <div className="flex flex-col gap-3">
                                            <span className="text-lg font-[900] text-gray-900 dark:text-white font-['Outfit'] tracking-tighter">₹{parseFloat(item.price).toFixed(0)}</span>

                                            {/* Modern Counter */}
                                            <div className="flex items-center bg-slate-50 dark:bg-white/5 rounded-2xl p-1 gap-2 border border-slate-100 dark:border-white/5">
                                                <motion.button
                                                    whileTap={{ scale: 0.8 }}
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 rounded-xl bg-white dark:bg-gray-700 text-slate-500 dark:text-gray-400 flex items-center justify-center shadow-sm active:bg-orange-50"
                                                >
                                                    <Minus size={14} strokeWidth={3} />
                                                </motion.button>
                                                <span className="text-sm font-[900] text-gray-900 dark:text-white font-['Outfit'] px-2">{item.quantity}</span>
                                                <motion.button
                                                    whileTap={{ scale: 0.8 }}
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-slate-900/10 active:scale-95"
                                                >
                                                    <Plus size={14} strokeWidth={3} />
                                                </motion.button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-300 dark:text-gray-600 uppercase tracking-widest leading-none mb-1">Subtotal</p>
                                            <span className="font-[900] text-gray-900 dark:text-white text-base font-['Outfit'] tracking-tighter italic">₹{(item.price * item.quantity).toFixed(0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>

                {/* Bill Section */}
                {cartItems.length > 0 && (
                    <motion.div variants={itemVariants} className="pt-8 space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-[44px] p-8 border border-gray-100 dark:border-white/10 shadow-premium space-y-5">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3 text-slate-400 group">
                                    <div className="w-8 h-8 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center group-hover:text-orange-500 transition-colors">
                                        <ReceiptText size={16} />
                                    </div>
                                    <span className="font-bold uppercase tracking-widest text-[10px]">Item Total</span>
                                </div>
                                <span className="font-[900] text-gray-900 dark:text-white font-['Outfit'] text-base">₹{safeSubtotal.toFixed(0)}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3 text-slate-400 group">
                                    <div className="w-8 h-8 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center group-hover:text-orange-500 transition-colors">
                                        <Ticket size={16} />
                                    </div>
                                    <span className="font-bold uppercase tracking-widest text-[10px]">Service & Handling</span>
                                </div>
                                <span className="font-[900] text-emerald-500 font-['Outfit'] text-base">+₹{deliveryFee.toFixed(0)}</span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-3 text-slate-400 group">
                                    <div className="w-8 h-8 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center group-hover:text-orange-500 transition-colors">
                                        <Wallet size={16} />
                                    </div>
                                    <span className="font-bold uppercase tracking-widest text-[10px]">Taxes & GST (5%)</span>
                                </div>
                                <span className="font-[900] text-gray-900 dark:text-white font-['Outfit'] text-base">₹{taxes.toFixed(0)}</span>
                            </div>

                            <div className="h-px bg-slate-100 dark:bg-white/5 my-2"></div>

                            <div className="flex justify-between items-center px-2">
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-widest italic decoration-orange-500/20 underline decoration-4 underline-offset-4">Grand Total</span>
                                </div>
                                <span className="font-[900] text-gray-900 dark:text-white text-4xl font-['Outfit'] tracking-tighter italic">₹{total.toFixed(0)}</span>
                            </div>
                        </div>

                        {/* Coupon Trigger Placeholder */}
                        <div className="bg-orange-50 dark:bg-orange-500/10 border-2 border-dashed border-orange-200 dark:border-orange-500/30 p-5 rounded-[28px] flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-orange-500 shadow-sm border border-orange-100 shadow-orange-500/5">
                                    <Ticket size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider mb-0.5">Apply Promo Code</p>
                                    <p className="text-[10px] font-medium text-orange-600/60 uppercase">Maximize your savings</p>
                                </div>
                            </div>
                            <ChevronRight className="text-orange-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Premium Checkout Action */}
            <AnimatePresence>
                {cartItems.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="px-6 mt-8 mb-6 z-40 relative"
                    >
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                const token = localStorage.getItem('access_token');
                                if (!token) navigate('/login');
                                else navigate('/checkout');
                            }}
                            className="group w-full bg-slate-900 dark:bg-orange-500 h-[72px] rounded-[24px] shadow-2xl shadow-slate-900/10 dark:shadow-orange-500/20 flex items-center justify-between px-3 relative overflow-hidden active:bg-orange-600 transition-colors"
                        >
                            <div className="relative z-10 bg-white/10 dark:bg-black/10 h-[52px] px-6 rounded-2xl flex items-center backdrop-blur-md">
                                <span className="font-[900] text-lg text-white font-['Outfit'] italic tracking-tight">₹{total.toFixed(0)}</span>
                            </div>

                            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/90 leading-none mb-1">Proceed to Checkout</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/50">Place Order</span>
                            </div>

                            <div className="relative z-10 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl group-hover:translate-x-1 transition-transform">
                                <ArrowRight size={24} strokeWidth={2.5} />
                            </div>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Cart;
