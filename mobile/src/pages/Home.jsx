import React, { useEffect, useState } from 'react';
import { productService } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import {
    MapPin,
    Search,
    ChevronRight,
    Star,
    Clock,
    Flame,
    Heart,
    Percent,
    ShoppingBag,
    Plus,
    User,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

const Home = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [popularProducts, setPopularProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const { addToCart } = useCart();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, prodRes] = await Promise.all([
                    productService.getCategories(),
                    productService.getAll()
                ]);
                setCategories(catRes.data.data);
                setPopularProducts(prodRes.data.data);
            } catch (error) {
                console.error("Error fetching mobile home data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredProducts = activeCategory === 'All'
        ? popularProducts
        : popularProducts.filter(p => p.category?.name === activeCategory);

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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4 bg-white dark:bg-[#0B0F1A]">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-300 dark:text-gray-500 uppercase tracking-[0.4em] animate-pulse italic">Syncing Menu...</p>
        </div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="pb-32 bg-[#FDFDFD] dark:bg-[#0B0F1A]"
        >
            {/* Premium Header */}
            <div className="px-6 pt-8 pb-4 sticky top-0 z-30 bg-[#FDFDFD]/80 dark:bg-[#0B0F1A]/80 backdrop-blur-2xl border-b border-gray-100/50 dark:border-white/5">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl shadow-premium flex items-center justify-center border border-gray-100 dark:border-white/5">
                            <MapPin className="text-orange-500" size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">Delivering to</p>
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-black text-gray-900 dark:text-white font-['Outfit']">Central District</span>
                                <ChevronRight size={14} className="text-orange-500" />
                            </div>
                        </div>
                    </div>
                    <Link to="/profile" className="group relative">
                        <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-slate-900 shadow-xl shadow-slate-900/10 active:scale-90 transition-transform border-2 border-white dark:border-gray-800">
                            {user?.name ? (
                                <span className="font-extrabold text-sm uppercase">{user.name[0]}</span>
                            ) : (
                                <User size={20} strokeWidth={2.5} />
                            )}
                        </div>
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-[#FDFDFD] dark:border-[#0B0F1A]"></span>
                    </Link>
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-[900] text-gray-900 dark:text-white font-['Outfit'] tracking-tighter leading-none">
                        Hi, {user?.name?.split(' ')[0] || 'Gourmet'}!
                    </h1>
                    <Flame className="text-orange-500 fill-orange-500" size={24} />
                </div>
                <p className="text-slate-400 text-xs font-medium">Ready for your daily treat?</p>
            </div>

            {/* Quick Search */}
            <motion.div variants={itemVariants} className="px-6 mt-6 mb-8">
                <div
                    onClick={() => navigate('/search')}
                    className="flex items-center gap-4 bg-white dark:bg-gray-800/40 p-5 rounded-[28px] shadow-sm border border-gray-100 dark:border-white/10 group active:scale-[0.98] transition-all cursor-pointer"
                >
                    <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 dark:text-gray-500 group-hover:text-orange-500 transition-colors">
                        <Search size={20} strokeWidth={2.5} />
                    </div>
                    <span className="text-slate-400 dark:text-gray-500 font-bold text-sm">Search for burgers, pizza...</span>
                </div>
            </motion.div>

            {/* Promo slider - Animated Banners */}
            <motion.div variants={itemVariants} className="px-6 mb-10">
                <div className="bg-gray-900 dark:bg-indigo-900 rounded-[40px] p-8 text-white relative overflow-hidden flex flex-col justify-center h-48 shadow-2xl group">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-orange-500/30 to-transparent rounded-full blur-[40px]"
                    />
                    <div className="relative z-10 w-2/3">
                        <span className="bg-orange-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block shadow-lg">New User Offer</span>
                        <h3 className="text-3xl font-[900] text-white font-['Outfit'] leading-none italic mb-2 tracking-tighter">FREE DELIVERY</h3>
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Valid on your first 3 orders</p>
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-36 h-36 bg-white/10 rounded-full border border-white/20 flex items-center justify-center p-3 backdrop-blur-md">
                        <div className="w-full h-full bg-orange-500 rounded-full animate-pulse shadow-2xl flex items-center justify-center text-white font-black text-2xl font-['Outfit']">50%</div>
                    </div>
                </div>
            </motion.div>

            {/* Horizontal Categories */}
            <motion.div variants={itemVariants} className="mb-12">
                <div className="px-6 flex justify-between items-center mb-6">
                    <h2 className="text-xl font-[900] text-gray-900 dark:text-white font-['Outfit'] tracking-tight italic uppercase">Menu Index</h2>
                    <Link to="/search" className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] flex items-center gap-1 hover:underline">See All <ArrowRight size={12} /></Link>
                </div>
                <div className="flex gap-4 overflow-x-auto px-6 no-scrollbar items-center">
                    <button
                        onClick={() => setActiveCategory('All')}
                        className={`flex flex-col items-center gap-3 group transition-all shrink-0`}
                    >
                        <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-300 ${activeCategory === 'All'
                                ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/30 -translate-y-1'
                                : 'bg-white dark:bg-gray-800 text-slate-400 dark:text-gray-500 border border-gray-100 dark:border-white/5 shadow-sm'
                            }`}>
                            <Flame size={24} strokeWidth={2.5} />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${activeCategory === 'All' ? 'text-orange-500' : 'text-slate-400'}`}>All</span>
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.name)}
                            className="flex flex-col items-center gap-3 group transition-all shrink-0"
                        >
                            <div className={`w-16 h-16 rounded-[24px] overflow-hidden transition-all duration-300 p-0.5 ${activeCategory === cat.name
                                    ? 'bg-orange-500 shadow-xl shadow-orange-500/30 -translate-y-1'
                                    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 shadow-sm'
                                }`}>
                                <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[22px] overflow-hidden">
                                    <img src={cat.image_url} alt={cat.name} className={`w-full h-full object-cover transition-all duration-500 ${activeCategory === cat.name ? 'scale-110' : 'grayscale group-hover:grayscale-0'}`} />
                                </div>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-wider ${activeCategory === cat.name ? 'text-orange-500' : 'text-slate-400'}`}>{cat.name}</span>
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Trending Feed */}
            <div className="px-6 mb-10">
                <h2 className="text-xl font-[900] text-gray-900 dark:text-white font-['Outfit'] tracking-tight italic uppercase mb-8">Trending Now</h2>
                <div className="grid grid-cols-2 gap-x-5 gap-y-10">
                    <AnimatePresence mode="popLayout">
                        {filteredProducts.slice(0, 8).map((p, idx) => (
                            <motion.div
                                key={p.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group"
                            >
                                <Link to={`/product/${p.id}`} className="block">
                                    <div className="aspect-[4/5] bg-slate-50 dark:bg-white/5 rounded-[40px] overflow-hidden mb-4 relative shadow-sm group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute top-4 left-4">
                                            <div className="bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5 border border-white/20">
                                                <Star size={10} className="text-amber-400 fill-amber-400 border-none" />
                                                <span className="text-[10px] font-black text-gray-900 dark:text-white leading-none mt-0.5">4.9</span>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                                            <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl text-white flex items-center gap-1.5 border border-white/10">
                                                <Clock size={10} />
                                                <span className="text-[9px] font-black uppercase tracking-tighter">15-20 min</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-2">
                                        <h4 className="text-sm font-[900] text-gray-900 dark:text-white truncate mb-1 font-['Outfit'] uppercase tracking-tight">{p.name}</h4>
                                        <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-4 italic truncate">
                                            {p.category?.name || 'Gourmet'} · Exclusive
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-300 dark:text-gray-600 uppercase tracking-widest leading-none mb-1">Price</span>
                                                <span className="text-lg font-[900] text-gray-900 dark:text-white font-['Outfit'] tracking-tighter italic">₹{parseFloat(p.price).toFixed(0)}</span>
                                            </div>
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    addToCart(p);
                                                }}
                                                className="w-12 h-12 bg-slate-900 dark:bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/10 active:bg-orange-600 transition-colors"
                                            >
                                                <Plus size={24} strokeWidth={3} />
                                            </motion.button>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Premium Membership Banner */}
            <motion.div variants={itemVariants} className="px-6 mb-10">
                <div className="bg-orange-500 rounded-[44px] p-10 text-white relative overflow-hidden shadow-2xl shadow-orange-500/30">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-[60px] -translate-y-12 translate-x-12"></div>
                    <div className="relative z-10 pr-12">
                        <h3 className="text-2xl font-[900] font-['Outfit'] leading-tight mb-4 tracking-tighter">JOIN THE FOODHUB GOLD CLUB</h3>
                        <p className="text-white/80 text-xs font-medium leading-relaxed mb-8 italic">Unlock priority delivery, exclusive cuisines, and zero delivery charges on every order.</p>
                        <button className="bg-white text-gray-900 px-8 py-3.5 rounded-2xl text-[10px] font-[900] uppercase tracking-[0.2em] shadow-xl hover:bg-slate-50 active:scale-95 transition-all">Start 30-Day Trial</button>
                    </div>
                    <div className="absolute bottom-4 right-8 opacity-10">
                        <ShoppingBag size={180} />
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Home;
