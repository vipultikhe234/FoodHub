import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Star, Clock, Flame, Leaf, MessageSquare, Plus, Minus, ArrowRight, X } from 'lucide-react';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [userRating, setUserRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');

    const handleSubmitReview = async () => {
        try {
            await productService.addReview(id, {
                rating: userRating,
                comment: reviewComment
            });
            setShowReviewModal(false);
            const response = await productService.getById(id);
            setProduct(response.data.data);
            setReviewComment('');
            alert("Audit Logs Synchronized! ✨");
        } catch (error) {
            alert("Security Protocol: Unauthorized to post audit.");
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await productService.getById(id);
                setProduct(response.data.data);

                // Check if we just returned from login and need to auto-add
                const queryParams = new URLSearchParams(location.search);
                if (queryParams.get('auto_add') === 'true' && response.data.data) {
                    const qty = parseInt(queryParams.get('qty')) || 1;
                    addToCart(response.data.data, qty);
                    navigate('/cart', { replace: true });
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, location.search, addToCart, navigate]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-white">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] animate-pulse">Scanning Bio-Composition...</p>
        </div>
    );

    if (!product) return (
        <div className="flex flex-col items-center justify-center min-h-screen p-12 text-center">
            <h1 className="text-4xl font-black text-red-500 italic mb-4">404_NULL</h1>
            <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Delicacy Not Found in Database</p>
            <button onClick={() => navigate('/')} className="mt-8 text-orange-500 font-bold border-b-2 border-orange-500/20 pb-1">Return to Hub</button>
        </div>
    );

    const discountPercentage = product.discount_price ? Math.round((1 - product.price / product.discount_price) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white min-h-screen pb-48 font-sans flex flex-col pt-0 selection:bg-orange-500/20"
        >
            {/* Ultra-Premium Hero Section */}
            <div className="relative h-[450px] bg-gray-50 overflow-hidden shrink-0">
                {/* Back Button Overlay */}
                <div className="absolute top-10 left-6 z-40">
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-white/80 backdrop-blur-xl p-3.5 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.12)] active:scale-90 transition-transform flex items-center justify-center text-gray-900 group"
                    >
                        <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform stroke-[2.5]" />
                    </button>
                </div>

                {/* Hero Image / Fallback */}
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full relative z-10 flex items-center justify-center"
                >
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-gray-300 font-bold tracking-widest uppercase text-xs">No Visual Data</span>
                        </div>
                    )}
                </motion.div>

                {/* Visual Gradients */}
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent z-20"></div>

                {/* Discount Badge */}
                {product.discount_price && (
                    <motion.div
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 12 }}
                        transition={{ type: 'spring', delay: 0.3 }}
                        className="absolute top-12 right-6 z-30"
                    >
                        <div className="bg-gray-900 text-white font-black w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-2xl -translate-y-2 border-4 border-white/20">
                            <span className="text-[8px] uppercase tracking-widest text-amber-400 mb-0.5">Save</span>
                            <span className="text-xl italic tracking-tighter leading-none">{discountPercentage}%</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Core Specs / Content */}
            <div className="px-6 -mt-16 relative z-30 flex-1">
                <div className="bg-white rounded-[40px] p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border border-gray-50/50 relative">
                    {/* Header Details */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex justify-between items-start mb-8"
                    >
                        <div className="flex-1 pr-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-orange-50 text-orange-500 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{product.category?.name || 'Exclusive'}</span>
                            </div>
                            <h1 className="text-3xl font-black italic tracking-tighter text-gray-900 leading-tight mb-3 uppercase drop-shadow-sm">{product.name}</h1>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-full shadow-md">
                                    <Star size={12} className="text-amber-400 fill-amber-400" />
                                    <span className="text-xs font-bold leading-none">{parseFloat(product.avg_rating || 4.5).toFixed(1)}</span>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider underline decoration-gray-200 underline-offset-4">{product.review_count || 0} Reviews</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Price</p>
                            <p className="text-3xl font-black italic tracking-tighter text-gray-900 leading-none">₹{parseFloat(product.price).toFixed(2)}</p>
                        </div>
                    </motion.div>

                    {/* Spec Clusters */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-3 gap-3 mb-10"
                    >
                        {[
                            { label: 'CALORIES', val: '450 KCAL', icon: <Flame size={20} className="text-orange-500" /> },
                            { label: 'EXECUTION', val: '15-20 MIN', icon: <Clock size={20} className="text-amber-500" /> },
                            { label: 'PURITY', val: 'ORGANIC', icon: <Leaf size={20} className="text-green-500" /> }
                        ].map((spec, i) => (
                            <div key={i} className="bg-gray-50 text-center p-4 rounded-[24px] flex flex-col items-center gap-2 border border-gray-100 hover:border-orange-100 transition-colors">
                                <div className="bg-white p-2 rounded-full shadow-sm">
                                    {spec.icon}
                                </div>
                                <div className="flex flex-col gap-0.5 mt-1">
                                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight leading-none">{spec.val}</p>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">{spec.label}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Description Component */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mb-10"
                    >
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            Details
                        </h3>
                        <p className="text-gray-500 leading-relaxed font-medium text-[13px] bg-gray-50/50 p-4 rounded-3xl">
                            {product.description || "Synthetically crafted with premium molecular ingredients for an unparalleled culinary experience."}
                        </p>
                    </motion.div>

                    {/* Audit Logs (Reviews) */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Reviews</h3>
                            <button
                                onClick={() => {
                                    if (!localStorage.getItem('access_token')) return navigate('/login');
                                    setShowReviewModal(true);
                                }}
                                className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center gap-1.5"
                            >
                                <MessageSquare size={12} strokeWidth={3} /> WRITE
                            </button>
                        </div>

                        <div className="space-y-4">
                            {product.reviews && product.reviews.length > 0 ? (
                                product.reviews.map((rev, i) => (
                                    <div key={i} className="bg-white p-5 rounded-[28px] border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold font-serif text-lg">
                                                    {rev.user_name[0] || 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 text-xs">{rev.user_name}</span>
                                                    <div className="flex items-center mt-0.5 gap-0.5">
                                                        {[...Array(5)].map((_, star) => (
                                                            <Star key={star} size={10} className={`${star < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-100'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider">Verified</span>
                                        </div>
                                        <p className="text-gray-600 text-xs leading-relaxed ml-13">{rev.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-gray-50 py-10 rounded-[32px] text-center flex flex-col items-center">
                                    <MessageSquare size={32} className="text-gray-300 mb-3" />
                                    <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">No Reviews Yet</p>
                                    <p className="text-gray-400 text-[10px]">Be the first to try this.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Sticky Execution Bar - FIXED BOTTOM */}
            <div className={`fixed bottom-0 left-0 w-full px-6 pt-4 pb-8 bg-white/90 backdrop-blur-xl border-t border-gray-100/50 flex flex-col gap-4 z-[60] shadow-[0_-20px_40px_rgba(0,0,0,0.05)] transition-transform duration-500 ${showReviewModal ? 'translate-y-full' : 'translate-y-0'}`}>

                <button
                    onClick={() => {
                        const token = localStorage.getItem('access_token');
                        if (!token) {
                            navigate('/login', {
                                state: {
                                    from: `/product/${id}?auto_add=true&qty=${quantity}`
                                }
                            });
                            return;
                        }
                        addToCart(product, quantity);
                        navigate('/cart');
                    }}
                    className="w-full h-[64px] bg-gray-900 text-white font-black rounded-full shadow-xl hover:bg-orange-600 transition-colors active:scale-95 flex items-center relative overflow-hidden group p-2"
                >
                    {/* Quantity Selector nested in button */}
                    <div className="bg-white/10 rounded-full h-full flex items-center px-2 mr-4" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-full hover:bg-white/20 active:scale-90 transition-all flex items-center justify-center">
                            <Minus size={16} strokeWidth={3} />
                        </button>
                        <span className="w-8 text-center font-bold text-sm tracking-tight">{quantity}</span>
                        <button onClick={() => setQuantity(q => q + 1)} className="w-8 h-8 rounded-full hover:bg-white/20 active:scale-90 transition-all flex items-center justify-center">
                            <Plus size={16} strokeWidth={3} />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col items-start justify-center">
                        <span className="uppercase tracking-[0.2em] text-[10px] font-bold text-white/70 leading-none mb-1">Add to order</span>
                        <span className="text-lg italic tracking-tighter font-black leading-none group-hover:text-amber-300 transition-colors">₹{(product.price * quantity).toFixed(2)}</span>
                    </div>

                    <div className="w-[48px] h-[48px] bg-white text-gray-900 rounded-full flex items-center justify-center shadow-md">
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </button>
            </div>

            {/* Audit Entry Modal */}
            <AnimatePresence>
                {showReviewModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end"
                        onClick={() => setShowReviewModal(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white w-full rounded-t-[40px] p-8 pb-12 shadow-2xl relative"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h1 className="text-2xl font-black text-gray-900 mb-1">Rate this item</h1>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{product.name}</p>
                                </div>
                                <button onClick={() => setShowReviewModal(false)} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 active:scale-90 transition-transform">
                                    <X size={20} className="stroke-[3]" />
                                </button>
                            </div>

                            <div className="flex justify-between mb-8 px-4">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => setUserRating(star)}
                                        className="active:scale-90 transition-transform"
                                    >
                                        <Star
                                            size={36}
                                            className={`${userRating >= star ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-100'} transition-colors`}
                                        />
                                    </button>
                                ))}
                            </div>

                            <div className="mb-8">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Your feedback</label>
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="Tell us what you loved..."
                                    className="w-full p-6 bg-gray-50 rounded-[28px] border-none focus:ring-2 focus:ring-orange-500 transition-all outline-none md:h-32 min-h-24 font-medium text-gray-800 placeholder:text-gray-300 resize-none"
                                />
                            </div>

                            <button
                                onClick={handleSubmitReview}
                                className="w-full py-5 bg-gray-900 text-white font-black text-sm uppercase tracking-widest rounded-full shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                Submit Review
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProductDetail;
