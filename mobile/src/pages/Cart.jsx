import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Info, Receipt } from 'lucide-react';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart();
    const navigate = useNavigate();

    // Ensure numeric conversion for safety
    const safeSubtotal = parseFloat(subtotal || 0);
    const deliveryFee = cartItems.length > 0 ? 49.00 : 0;
    const total = safeSubtotal + deliveryFee;

    return (
        <div className="bg-white min-h-screen pt-4 pb-48 font-sans selection:bg-orange-500/20">
            {/* Premium Header */}
            <div className="px-6 flex items-center mb-8 sticky top-4 z-40">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-white/80 backdrop-blur-xl p-3.5 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.12)] active:scale-90 transition-transform flex items-center justify-center text-gray-900 group"
                >
                    <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform stroke-[2.5]" />
                </button>
                <h2 className="text-2xl font-black text-gray-900 ml-4">Your Order</h2>
                {cartItems.length > 0 && (
                    <div className="ml-auto bg-gray-900 text-white rounded-full px-3 py-1 flex items-center gap-1.5 shadow-sm">
                        <ShoppingBag size={12} className="text-orange-400" />
                        <span className="text-xs font-bold leading-none mt-0.5">{cartItems.length}</span>
                    </div>
                )}
            </div>

            <div className="px-6 flex flex-col gap-5">
                <AnimatePresence>
                    {cartItems.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20 bg-gray-50/50 rounded-[40px] border border-gray-100 flex flex-col items-center justify-center"
                        >
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                                <ShoppingBag size={40} className="text-gray-200" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Your cart is empty</h3>
                            <p className="text-xs font-medium text-gray-400 mb-8 max-w-[200px] leading-relaxed">Looks like you haven't added any delicious items yet.</p>

                            <Link to="/" className="bg-gray-900 text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all w-3/4 flex justify-center">
                                Browse Menu
                            </Link>
                        </motion.div>
                    ) : (
                        cartItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -50, scale: 0.9 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-4 rounded-[32px] border border-gray-100/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-4 relative overflow-hidden"
                            >
                                <div className="w-20 h-20 bg-gray-50 rounded-[24px] flex items-center justify-center relative overflow-hidden shrink-0">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <ShoppingBag size={24} className="text-gray-300" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 pr-2">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-extrabold text-gray-900 text-sm tracking-tight truncate pr-4">{item.name}</h4>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors p-1 -mr-2 -mt-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">
                                        ₹{parseFloat(item.price).toFixed(2)}
                                    </span>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center bg-gray-50 rounded-full border border-gray-100 p-1 w-24">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-7 h-7 rounded-full text-gray-500 hover:bg-gray-200 active:scale-90 transition-all flex items-center justify-center"
                                            >
                                                <Minus size={14} strokeWidth={3} />
                                            </button>
                                            <span className="flex-1 text-center font-bold text-sm text-gray-900 leading-none">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-7 h-7 rounded-full bg-gray-900 text-white shadow-sm active:scale-90 transition-all flex items-center justify-center"
                                            >
                                                <Plus size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                        <span className="font-black text-gray-900 text-sm leading-none shrink-0 border-b-2 border-orange-500/20 pb-0.5">
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {cartItems.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-10 px-6 mb-10"
                >
                    <div className="bg-gray-50/80 rounded-[40px] p-8 border border-gray-100/50 space-y-5">
                        <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-50/50">
                            <span className="text-xs font-bold text-gray-400 flex items-center gap-2">
                                <Receipt size={14} /> Subtotal
                            </span>
                            <span className="font-bold text-gray-900">₹{safeSubtotal.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-50/50">
                            <span className="text-xs font-bold text-gray-400 flex items-center gap-2">
                                <Info size={14} /> Delivery Fee
                            </span>
                            <span className="font-bold text-gray-900">₹{deliveryFee.toFixed(2)}</span>
                        </div>

                        <div className="pt-2 px-2 flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total to pay</span>
                            </div>
                            <span className="font-black text-gray-900 text-3xl tracking-tighter decoration-orange-500/10 decoration-8 underline-offset-[-2px]">₹{total.toFixed(2)}</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Premium Execution Bar */}
            {cartItems.length > 0 && (
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-0 left-0 w-full p-6 bg-white/95 backdrop-blur-xl border-t border-gray-100/50 z-50 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]"
                >
                    <button
                        onClick={() => {
                            const token = localStorage.getItem('access_token');
                            if (!token) {
                                navigate('/login');
                            } else {
                                navigate('/checkout');
                            }
                        }}
                        className="w-full bg-gray-900 text-white h-[64px] rounded-full shadow-xl hover:bg-orange-600 transition-colors active:scale-95 flex justify-between px-2 items-center relative group"
                    >
                        {/* Total indicator pill left */}
                        <div className="bg-white/10 rounded-full h-[48px] px-6 flex items-center">
                            <span className="font-black text-sm text-white">₹{total.toFixed(2)}</span>
                        </div>

                        <span className="absolute left-1/2 -translate-x-1/2 text-xs font-black uppercase tracking-widest text-white/90">
                            Checkout
                        </span>

                        <div className="w-[48px] h-[48px] bg-white text-gray-900 rounded-full flex items-center justify-center shadow-md">
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                    {/* Safe area spacing for mobile browsers */}
                    <div className="h-2 w-full"></div>
                </motion.div>
            )}
        </div>
    );
};

export default Cart;
