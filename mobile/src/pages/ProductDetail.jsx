import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    Star,
    Clock,
    Flame,
    Leaf,
    MessageSquare,
    Plus,
    Minus,
    ArrowRight,
    X,
    Heart,
    Share2,
    ShieldCheck
} from 'lucide-react';

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
        } catch (error) {
            console.error("Review error:", error);
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await productService.getById(id);
                setProduct(response.data.data);

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
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4 bg-[#FDFDFD] dark:bg-[#0B0F1A]">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-300 dark:text-gray-600 uppercase tracking-[0.4em] animate-pulse italic">Loading Product...</p>
        </div>
    );

    if (!product) return (
        <div className="flex flex-col items-center justify-center min-h-screen p-12 text-center bg-[#FDFDFD] dark:bg-[#0B0F1A]">
            <X size={64} className="text-rose-500 mb-8" />
            <h1 className="text-4xl font-[900] text-gray-900 dark:text-white font-['Outfit'] italic tracking-tighter mb-4">404 - Not Found</h1>
            <button onClick={() => navigate('/')} className="text-orange-500 font-black uppercase tracking-widest text-[10px] border-b-2 border-orange-500/20 pb-1">Go Back Home</button>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#FDFDFD] dark:bg-[#0B0F1A] min-h-screen pb-40 font-sans"
        >
            {/* High-End Hero Header */}
            <div className="relative h-[55vh] min-h-[450px] overflow-hidden">
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="w-full h-full"
                >
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                </motion.div>

                {/* Visual Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#FDFDFD] dark:from-[#0B0F1A] via-transparent to-black/30"></div>

                {/* Sticky Header Actions */}
                <div className="absolute top-8 left-6 right-6 flex justify-between items-center z-50">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl shadow-xl flex items-center justify-center text-gray-900 dark:text-white border border-white/20"
                    >
                        <ChevronLeft size={24} />
                    </motion.button>
                    <div className="flex gap-4">
                        <motion.button whileTap={{ scale: 0.9 }} className="w-12 h-12 bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl shadow-xl flex items-center justify-center text-rose-500 border border-white/20">
                            <Heart size={20} />
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.9 }} className="w-12 h-12 bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl shadow-xl flex items-center justify-center text-gray-900 dark:text-white border border-white/20">
                            <Share2 size={20} />
                        </motion.button>
                    </div>
                </div>

                {/* Badges Overlay */}
                <div className="absolute bottom-12 left-8 flex gap-3 z-30">
                    <span className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20">Best Seller</span>
                    <span className="bg-black/50 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">Limited Time</span>
                </div>
            </div>

            {/* Content Container */}
            <div className="px-8 -mt-8 relative z-40">
                <div className="bg-[#FDFDFD] dark:bg-gray-900/40 rounded-t-[48px] pt-10">
                    {/* Identification */}
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex-1 pr-6">
                            <h1 className="text-4xl font-[900] text-gray-900 dark:text-white font-['Outfit'] italic tracking-tighter leading-none mb-3 uppercase">{product.name}</h1>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <Star size={16} className="text-amber-400 fill-amber-400 border-none" />
                                    <span className="text-sm font-[900] text-gray-900 dark:text-white font-['Outfit']">{parseFloat(product.avg_rating || 4.5).toFixed(1)}</span>
                                </div>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.review_count || 12} Reviews</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price</p>
                            <div className="flex items-start justify-end gap-1">
                                <span className="text-sm font-[900] text-orange-500 font-['Outfit'] mt-1">₹</span>
                                <span className="text-4xl font-[900] text-gray-900 dark:text-white font-['Outfit'] tracking-tighter italic">
                                    {parseFloat(product.price).toFixed(0)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Specification Clusters */}
                    <div className="grid grid-cols-3 gap-3 mb-12">
                        {[
                            { label: 'CALORIES', val: '450 KCAL', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
                            { label: 'TIME', val: '15-20 MIN', icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                            { label: 'TYPE', val: '100% ORGANIC', icon: Leaf, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' }
                        ].map((spec, i) => {
                            const Icon = spec.icon;
                            return (
                                <div key={i} className="bg-white dark:bg-gray-800/40 p-4 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm text-center flex flex-col items-center gap-3">
                                    <div className={`w-10 h-10 ${spec.bg} ${spec.color} rounded-2xl flex items-center justify-center`}>
                                        <Icon size={20} strokeWidth={2.5} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-gray-900 dark:text-white uppercase leading-none tracking-tight">{spec.val}</p>
                                        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none">{spec.label}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Description Section */}
                    <div className="mb-12">
                        <h3 className="text-sm font-[900] text-gray-900 dark:text-white font-['Outfit'] uppercase tracking-widest mb-4 flex items-center gap-2 italic">
                            Description
                        </h3>
                        <div className="bg-white dark:bg-gray-800/40 p-6 rounded-[32px] border border-gray-100 dark:border-white/5 relative group">
                            <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed font-medium">
                                {product.description || "A delicious blend of premium ingredients prepared to your satisfaction."}
                            </p>
                            <ShieldCheck size={20} className="absolute -top-3 -right-3 text-emerald-500 bg-[#FDFDFD] dark:bg-gray-800 rounded-full" />
                        </div>
                    </div>

                    {/* Review Section */}
                    <div className="mb-12">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-sm font-[900] text-gray-900 dark:text-white font-['Outfit'] uppercase tracking-widest italic">User Reviews</h3>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                    if (!localStorage.getItem('access_token')) return navigate('/login');
                                    setShowReviewModal(true);
                                }}
                                className="bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-orange-100 dark:border-orange-500/20 flex items-center gap-2"
                            >
                                <MessageSquare size={14} strokeWidth={2.5} /> Add Review
                            </motion.button>
                        </div>

                        <div className="space-y-6">
                            {product.reviews?.length > 0 ? (
                                product.reviews.map((rev, i) => (
                                    <div key={i} className="bg-white dark:bg-gray-800/40 p-6 rounded-[36px] border border-gray-100 dark:border-white/5 shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-900 dark:bg-orange-500 text-white rounded-xl flex items-center justify-center font-black text-sm uppercase">
                                                    {rev.user_name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-[900] text-gray-900 dark:text-white uppercase tracking-tight font-['Outfit']">{rev.user_name}</p>
                                                    <div className="flex items-center gap-0.5 mt-0.5">
                                                        {[...Array(5)].map((_, s) => (
                                                            <Star key={s} size={10} className={`${s < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-gray-700'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Verified Buyer</span>
                                        </div>
                                        <p className="text-slate-500 dark:text-gray-400 text-xs leading-relaxed font-medium italic">"{rev.comment}"</p>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-slate-50 dark:bg-white/5 py-12 rounded-[40px] text-center px-10">
                                    <MessageSquare size={40} className="text-slate-200 dark:text-gray-700 mx-auto mb-4" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 leading-none">No Reviews Yet</p>
                                    <p className="text-[10px] font-medium text-slate-300 italic">Be the first to share your experience!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Sticky Action Bar */}
            <AnimatePresence>
                {!showReviewModal && (
                    <motion.div
                        initial={{ y: 200 }}
                        animate={{ y: 0 }}
                        exit={{ y: 200 }}
                        className="fixed bottom-0 left-0 w-full p-6 pb-12 bg-white/95 dark:bg-[#0B0F1A]/95 backdrop-blur-2xl border-t border-gray-100 dark:border-white/5 z-50 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]"
                    >
                        <div className="flex gap-4 max-w-lg mx-auto">
                            {/* Quantity Controls Pill */}
                            <div className="h-[72px] bg-slate-50 dark:bg-white/5 rounded-[24px] px-3 flex items-center gap-1 border border-slate-100 dark:border-white/5">
                                <motion.button
                                    whileTap={{ scale: 0.8 }}
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-slate-900 dark:text-white shadow-sm"
                                >
                                    <Minus size={16} strokeWidth={3} />
                                </motion.button>
                                <span className="w-10 text-center text-lg font-[900] text-gray-900 dark:text-white font-['Outfit']">{quantity}</span>
                                <motion.button
                                    whileTap={{ scale: 0.8 }}
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-slate-900 dark:text-white shadow-sm"
                                >
                                    <Plus size={16} strokeWidth={3} />
                                </motion.button>
                            </div>

                            {/* Main Add Button */}
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    const token = localStorage.getItem('access_token');
                                    if (!token) {
                                        navigate('/login', { state: { from: `/product/${id}?auto_add=true&qty=${quantity}` } });
                                        return;
                                    }
                                    addToCart(product, quantity);
                                    navigate('/cart');
                                }}
                                className="flex-1 h-[72px] bg-slate-900 dark:bg-orange-500 rounded-[24px] shadow-2xl flex items-center justify-between px-3 group overflow-hidden relative"
                            >
                                <div className="relative z-10 bg-white/10 dark:bg-black/10 h-[52px] px-6 rounded-2xl flex items-center backdrop-blur-md">
                                    <span className="font-[900] text-lg text-white font-['Outfit'] italic tracking-tight">₹{(product.price * quantity).toFixed(0)}</span>
                                </div>
                                <div className="absolute left-1/2 -translate-x-1/2 text-center">
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Add to Cart</p>
                                    <p className="text-[8px] font-black text-white/50 uppercase tracking-widest">Go to Checkout</p>
                                </div>
                                <div className="relative z-10 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 group-hover:translate-x-1 transition-transform">
                                    <ArrowRight size={24} strokeWidth={3} />
                                </div>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Review Modal Redesign */}
            <AnimatePresence>
                {showReviewModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end"
                        onClick={() => setShowReviewModal(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[#FDFDFD] dark:bg-[#0B0F1A] w-full rounded-t-[56px] p-10 pb-16 shadow-2xl relative"
                        >
                            <div className="w-16 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full mx-auto mb-10"></div>
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-3xl font-[900] text-gray-900 dark:text-white font-['Outfit'] italic tracking-tighter mb-1 uppercase">Rate Product</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{product.name}</p>
                                </div>
                                <button onClick={() => setShowReviewModal(false)} className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex justify-between items-center bg-white dark:bg-gray-800/40 p-8 rounded-[40px] border border-gray-100 dark:border-white/5 mb-10">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star} onClick={() => setUserRating(star)} className="active:scale-90 transition-transform">
                                        <Star size={44} className={`${userRating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-100 dark:text-gray-800'}`} strokeWidth={1} />
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3 mb-10">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 block italic">Your Review</label>
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="Write your review here..."
                                    className="w-full p-8 bg-white dark:bg-gray-800/40 rounded-[40px] border border-gray-100 dark:border-white/5 outline-none focus:ring-4 focus:ring-orange-500/5 transition-all min-h-32 text-sm font-bold text-gray-900 dark:text-white placeholder:text-slate-300"
                                />
                            </div>

                            <button
                                onClick={handleSubmitReview}
                                className="w-full py-6 bg-slate-900 dark:bg-orange-500 text-white rounded-[28px] text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all"
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
