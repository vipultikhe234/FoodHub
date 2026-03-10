import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePayment from '../components/StripePayment';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MapPin, Banknote, CreditCard, ShieldCheck, X, ArrowRight } from 'lucide-react';

// Read Stripe publishable key from Vite environment variables
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

    const deliveryFee = 49.00;
    const total = (Number(subtotal) || 0) + deliveryFee;

    // Check for authentication and pre-fill address
    React.useEffect(() => {
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

    const handlePlaceOrder = async () => {
        if (!address.trim()) return alert('Please enter a delivery address.');
        if (paymentMethod === 'stripe' && !stripeKey) {
            return alert('Stripe is not configured. Please use Cash on Delivery or contact support.');
        }
        setLoading(true);
        try {
            const orderData = {
                delivery_address: address,
                payment_method: paymentMethod,
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            };
            const response = await orderService.placeOrder(orderData);
            const orderId = response.data.data?.order?.id;
            setPlacedOrderId(orderId); // save for use after Stripe payment

            if (paymentMethod === 'stripe' && response.data.data?.stripe_client_secret) {
                setClientSecret(response.data.data.stripe_client_secret);
                setShowStripeModal(true);
            } else {
                // COD order: clear cart and redirect to order status
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
        // Use the stored orderId from when the order was created
        navigate(placedOrderId ? `/order/${placedOrderId}` : '/orders');
    };

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
                <h2 className="text-2xl font-black text-gray-900 ml-4">Checkout</h2>
                <div className="ml-auto bg-green-50 text-green-600 rounded-full p-2 flex items-center shadow-sm">
                    <ShieldCheck size={20} />
                </div>
            </div>

            <div className="px-6 space-y-8 pb-32">
                {/* Address Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                            <MapPin size={16} className="text-orange-500" />
                            Delivery Details
                        </h3>
                    </div>
                    <div className="relative group">
                        <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Apt, suite, floor, street..."
                            className="w-full p-5 pt-6 bg-gray-50 rounded-[32px] border border-gray-100/60 focus:bg-white focus:border-orange-500/30 focus:shadow-[0_8px_30px_rgba(249,115,22,0.1)] transition-all outline-none h-32 font-bold placeholder:text-gray-400 placeholder:font-medium resize-none shadow-sm"
                        />
                        <div className="absolute top-3 left-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Address
                        </div>
                    </div>
                </motion.section>

                {/* Payment Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <CreditCard size={16} className="text-orange-500" />
                        Payment Method
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setPaymentMethod('cod')}
                            className={`p-5 rounded-[28px] border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50/50 shadow-md' : 'border-gray-100 bg-gray-50 hover:bg-gray-100/80'}`}
                        >
                            <div className={`p-3 rounded-full ${paymentMethod === 'cod' ? 'bg-orange-100/80 text-orange-600' : 'bg-white text-gray-500 shadow-sm'}`}>
                                <Banknote size={24} />
                            </div>
                            <span className={`font-black text-xs tracking-wide ${paymentMethod === 'cod' ? 'text-orange-700' : 'text-gray-600'}`}>CASH</span>
                        </button>
                        <button
                            onClick={() => setPaymentMethod('stripe')}
                            className={`p-5 rounded-[28px] border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'stripe' ? 'border-orange-500 bg-orange-50/50 shadow-md' : 'border-gray-100 bg-gray-50 hover:bg-gray-100/80'}`}
                        >
                            <div className={`p-3 rounded-full ${paymentMethod === 'stripe' ? 'bg-orange-100/80 text-orange-600' : 'bg-white text-gray-500 shadow-sm'}`}>
                                <CreditCard size={24} />
                            </div>
                            <span className={`font-black text-xs tracking-wide ${paymentMethod === 'stripe' ? 'text-orange-700' : 'text-gray-600'}`}>CARD</span>
                        </button>
                    </div>
                </motion.section>

                {/* Summary Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-8 bg-gray-900 rounded-[40px] text-white shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl mix-blend-screen"></div>

                    <div className="relative z-10 space-y-5">
                        <div className="flex justify-between items-center text-white/50">
                            <span className="text-xs font-bold w-full uppercase tracking-widest flex items-center justify-between">
                                Subtotal <span className="text-white font-black">₹{(Number(subtotal) || 0).toFixed(2)}</span>
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-white/50">
                            <span className="text-xs font-bold w-full uppercase tracking-widest flex items-center justify-between">
                                Delivery <span className="text-white font-black">₹{deliveryFee.toFixed(2)}</span>
                            </span>
                        </div>
                        <div className="w-full h-[1px] bg-white/10 my-2"></div>
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-black uppercase tracking-widest text-orange-400 mb-2">Total</span>
                            <span className="text-4xl font-black tracking-tighter decoration-orange-500/20 decoration-4 underline-offset-[-4px]">₹{(Number(total) || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Button */}
            {!showStripeModal && (
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-0 left-0 w-full p-6 bg-white/95 backdrop-blur-xl border-t border-gray-100/50 z-50 shadow-[0_-20px_40px_rgba(0,0,0,0.05)]"
                >
                    <button
                        onClick={handlePlaceOrder}
                        disabled={loading || cartItems.length === 0}
                        className={`w-full h-[64px] rounded-full shadow-xl transition-colors active:scale-95 flex justify-between px-2 items-center relative group ${loading ? 'bg-orange-300' : 'bg-gray-900 hover:bg-orange-600'
                            } text-white`}
                    >
                        {/* Fake padding block for layout balancing */}
                        <div className="w-[48px] h-[48px] opacity-0 flex items-center"></div>

                        <span className="absolute left-1/2 -translate-x-1/2 text-xs font-black uppercase tracking-widest text-white/90">
                            {loading ? 'Processing...' : 'Place Order'}
                        </span>

                        <div className="w-[48px] h-[48px] bg-white text-gray-900 rounded-full flex items-center justify-center shadow-md">
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            )}
                        </div>
                    </button>
                    {/* Safe area spacing for mobile browsers */}
                    <div className="h-2 w-full"></div>
                </motion.div>
            )}

            {/* Stripe Modal Overlay */}
            <AnimatePresence>
                {showStripeModal && clientSecret && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-white rounded-t-[40px] w-full max-w-lg p-6 pt-4 shadow-2xl overflow-y-auto max-h-[92vh]"
                        >
                            {/* Modal Handle */}
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>

                            <div className="flex justify-between items-center mb-8 px-2">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 mb-1">Secure Payment</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <ShieldCheck size={12} className="text-green-500" /> Powered by Stripe
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowStripeModal(false)}
                                    className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                                >
                                    <X size={20} strokeWidth={3} />
                                </button>
                            </div>

                            <div className="px-2 pb-6">
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
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Checkout;
