import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { couponService, orderService } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePayment from '../components/StripePayment';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    MapPin,
    Banknote,
    CreditCard,
    ShieldCheck,
    X,
    ArrowRight,
    Ticket,
    ReceiptText,
    Wallet,
    Info
} from 'lucide-react';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const Checkout = () => {
    const { cartItems, subtotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [loading, setLoading] = useState(false);
    const [clientSecret, setClientSecret] = useState(null);
    const [showStripeModal, setShowStripeModal] = useState(false);
    const [placedOrderId, setPlacedOrderId] = useState(null);

    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponApplied, setCouponApplied] = useState(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    const deliveryFee = 30.00;
    const taxes = (Number(subtotal) || 0) * 0.05;
    const finalSubtotal = (Number(subtotal) || 0) - couponDiscount;
    const total = finalSubtotal + deliveryFee + taxes;

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login', { state: { from: '/checkout' } });
            return;
        }

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user.address) setAddress(user.address);
            } catch (e) {
                console.error("User data corruption:", e);
            }
        }
    }, [navigate]);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsApplyingCoupon(true);
        setCouponApplied(null);
        try {
            const response = await couponService.validate(couponCode, subtotal);
            setCouponDiscount(response.data.discount);
            setCouponApplied({ type: 'success', message: `Coupon applied: ₹${response.data.discount} discount.` });
        } catch (error) {
            setCouponDiscount(0);
            setCouponApplied({ type: 'error', message: error.response?.data?.message || 'Invalid coupon code' });
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!address.trim()) return alert('Please enter your delivery address.');
        if (paymentMethod === 'stripe' && !stripeKey) {
            return alert('Payment gateway error. Please try again or use Cash.');
        }
        setLoading(true);
        try {
            const orderData = {
                delivery_address: address,
                payment_method: paymentMethod,
                coupon_code: couponDiscount > 0 ? couponCode : null,
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            };
            const response = await orderService.placeOrder(orderData);
            const orderId = response.data.data?.order?.id;
            setPlacedOrderId(orderId);

            if (paymentMethod === 'stripe' && response.data.data?.stripe_client_secret) {
                setClientSecret(response.data.data.stripe_client_secret);
                setShowStripeModal(true);
            } else {
                clearCart();
                navigate(orderId ? `/order/${orderId}` : '/orders');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to place order.');
            if (error.response?.status === 401) {
                navigate('/login', { state: { from: '/checkout' } });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = () => {
        clearCart();
        navigate(placedOrderId ? `/order/${placedOrderId}` : '/orders');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="pb-40 bg-[#FDFDFD] dark:bg-[#0B0F1A] min-h-screen"
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
                    <h2 className="text-lg font-[900] text-gray-900 dark:text-white font-['Outfit'] italic uppercase tracking-tight">Checkout</h2>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center justify-center gap-1.5 leading-none">
                        <ShieldCheck size={10} /> Secure Checkout
                    </p>
                </div>
                <div className="w-12 h-12"></div>
            </div>

            <div className="px-8 mt-10 space-y-12">
                {/* Delivery Information */}
                <motion.section variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-orange-50 dark:bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                            <MapPin size={16} />
                        </div>
                        <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Delivery Address</h3>
                    </div>
                    <div className="bg-white dark:bg-gray-800/40 p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-premium group">
                        <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter your street address..."
                            className="w-full bg-transparent outline-none h-28 text-sm font-bold text-gray-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-600 resize-none"
                        />
                    </div>
                </motion.section>

                {/* Payment Method */}
                <motion.section variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                            <Wallet size={16} />
                        </div>
                        <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Payment Method</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { id: 'cod', label: 'Cash on Delivery', icon: Banknote },
                            { id: 'stripe', label: 'Credit Card', icon: CreditCard }
                        ].map(method => {
                            const Icon = method.icon;
                            const isActive = paymentMethod === method.id;
                            return (
                                <motion.button
                                    key={method.id}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={`relative p-6 rounded-[36px] border-2 flex flex-col items-center gap-4 transition-all overflow-hidden ${isActive
                                            ? 'border-orange-500 bg-orange-50/20 shadow-xl shadow-orange-500/10'
                                            : 'border-slate-50 dark:border-white/5 bg-white dark:bg-gray-800/40'
                                        }`}
                                >
                                    <div className={`w-14 h-14 rounded-[24px] flex items-center justify-center transition-all ${isActive ? 'bg-orange-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-white/5 text-slate-400'
                                        }`}>
                                        <Icon size={28} strokeWidth={isActive ? 2.5 : 2} />
                                    </div>
                                    <span className={`text-[10px] font-black tracking-widest uppercase ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400'}`}>
                                        {method.label}
                                    </span>
                                    {isActive && <motion.div layoutId="activePay" className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full" />}
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.section>

                {/* Coupon Code */}
                <motion.section variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                            <Ticket size={16} />
                        </div>
                        <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Add Coupon</h3>
                    </div>
                    <div className="bg-white dark:bg-gray-800/40 p-3 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-premium flex gap-3">
                        <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Enter Code..."
                            className="flex-1 bg-slate-50 dark:bg-white/5 rounded-[24px] px-6 text-[11px] font-[900] uppercase tracking-[0.2em] outline-none text-gray-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-600 focus:ring-1 focus:ring-orange-500/20"
                        />
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleApplyCoupon}
                            disabled={isApplyingCoupon || !couponCode.trim()}
                            className={`px-8 h-[60px] rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${couponDiscount > 0
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                    : 'bg-slate-900 dark:bg-orange-500 text-white shadow-xl'
                                }`}
                        >
                            {isApplyingCoupon ? '...' : (couponDiscount > 0 ? 'Applied' : 'Apply')}
                        </motion.button>
                    </div>
                    {couponApplied && (
                        <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`mt-4 text-[10px] font-black uppercase tracking-widest ml-4 ${couponApplied.type === 'success' ? 'text-emerald-500' : 'text-rose-500'
                                }`}
                        >
                            {couponApplied.message}
                        </motion.p>
                    )}
                </motion.section>

                {/* Bill Details */}
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="pt-4">
                    <div className="bg-slate-900 dark:bg-gray-900 rounded-[48px] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-[60px] -translate-y-12 translate-x-12"></div>

                        <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-center opacity-50">
                                <div className="flex items-center gap-3">
                                    <ReceiptText size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Subtotal</span>
                                </div>
                                <span className="text-sm font-[900] font-['Outfit'] italic">₹{(Number(subtotal) || 0).toFixed(0)}</span>
                            </div>

                            {couponDiscount > 0 && (
                                <div className="flex justify-between items-center text-emerald-400">
                                    <div className="flex items-center gap-3">
                                        <Ticket size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Coupon Savings</span>
                                    </div>
                                    <span className="text-sm font-[900] font-['Outfit'] italic">-₹{couponDiscount.toFixed(0)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center opacity-50">
                                <div className="flex items-center gap-3">
                                    <Wallet size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Taxes & Fees</span>
                                </div>
                                <span className="text-sm font-[900] font-['Outfit'] italic">₹{taxes.toFixed(0)}</span>
                            </div>

                            <div className="h-px bg-white/10 my-6"></div>

                            <div className="flex justify-between items-end">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] italic">Grand Total</span>
                                </div>
                                <span className="text-5xl font-[900] font-['Outfit'] tracking-tighter italic leading-none">₹{total.toFixed(0)}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Execution Footer Bar */}
            <AnimatePresence>
                {!showStripeModal && (
                    <motion.div
                        initial={{ y: 200 }}
                        animate={{ y: 0 }}
                        className="fixed bottom-0 left-0 w-full p-6 pb-12 bg-white/95 dark:bg-[#0B0F1A]/95 backdrop-blur-2xl border-t border-gray-100 dark:border-white/5 z-50 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]"
                    >
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePlaceOrder}
                            disabled={loading || cartItems.length === 0}
                            className={`group w-full max-w-lg mx-auto h-[72px] rounded-[24px] shadow-2xl flex items-center justify-between px-3 relative overflow-hidden transition-all ${loading ? 'bg-slate-200 cursor-not-allowed' : 'bg-slate-900 dark:bg-orange-500 shadow-slate-900/10 dark:shadow-orange-500/20'
                                }`}
                        >
                            <div className="relative z-10 bg-white/10 dark:bg-black/10 h-[52px] px-6 rounded-2xl flex items-center backdrop-blur-md">
                                <span className="font-[900] text-lg text-white font-['Outfit'] italic tracking-tight">₹{total.toFixed(0)}</span>
                            </div>

                            <div className="absolute left-1/2 -translate-x-1/2 text-center">
                                <p className="text-[11px] font-black text-white uppercase tracking-[0.3em] leading-none mb-1">
                                    {loading ? 'Processing...' : 'Place Order'}
                                </p>
                            </div>

                            <div className="relative z-10 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl group-hover:translate-x-1 transition-transform">
                                {loading ? (
                                    <div className="w-5 h-5 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <ArrowRight size={24} strokeWidth={3} />
                                )}
                            </div>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Stripe Matrix Modal */}
            <AnimatePresence>
                {showStripeModal && clientSecret && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end justify-center"
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-[#FDFDFD] dark:bg-[#0B0F1A] rounded-t-[56px] w-full max-w-lg p-10 pb-16 shadow-2xl relative overflow-y-auto max-h-[92vh]"
                        >
                            <div className="w-16 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full mx-auto mb-10"></div>

                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-3xl font-[900] text-gray-900 dark:text-white font-['Outfit'] italic tracking-tighter mb-1 uppercase">Secure Payment</h2>
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 italic">
                                        <ShieldCheck size={12} /> Encrypted Gateway
                                    </p>
                                </div>
                                <button onClick={() => setShowStripeModal(false)} className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="bg-white dark:bg-gray-800/40 p-8 rounded-[44px] border border-gray-100 dark:border-white/5 shadow-premium">
                                <Elements stripe={stripePromise}>
                                    <StripePayment
                                        clientSecret={clientSecret}
                                        orderId={placedOrderId}
                                        onSucceeded={handleSuccess}
                                        onFailed={(msg) => {
                                            setShowStripeModal(false);
                                            alert('Payment failed: ' + msg);
                                        }}
                                    />
                                </Elements>
                            </div>

                            <p className="mt-8 text-center text-[9px] font-black text-slate-300 dark:text-gray-600 uppercase tracking-widest">Safe & Secure Payment</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Checkout;
