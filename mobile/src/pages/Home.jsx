import React, { useEffect, useState } from 'react';
import { productService } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, User, Search, ChevronRight, Star, Clock, ChefHat, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [popularProducts, setPopularProducts] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div className="p-8 space-y-12 animate-pulse min-h-screen bg-white">
                <div className="flex justify-between items-center">
                    <div className="space-y-3">
                        <div className="h-2 w-20 bg-gray-100/80 rounded-full"></div>
                        <div className="h-5 w-36 bg-gray-200/80 rounded-full"></div>
                    </div>
                    <div className="w-14 h-14 bg-gray-100/80 rounded-full"></div>
                </div>
                <div className="h-48 bg-gray-100/80 rounded-[40px]"></div>
                <div className="space-y-8">
                    <div className="h-3 w-28 bg-gray-100/80 rounded-full"></div>
                    <div className="flex gap-6 overflow-hidden">
                        {[1, 2, 3, 4].map(idx => (
                            <div key={idx} className="h-24 w-24 bg-gray-100/80 rounded-[28px] shrink-0"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <div className="bg-white min-h-screen pb-28 font-sans selection:bg-orange-500/20">
            {/* Premium Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl px-7 py-5 flex justify-between items-center border-b border-gray-50/50">
                <div className="group cursor-pointer flex flex-col gap-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-1.5">
                        <MapPin size={10} className="text-orange-500" /> delivering to
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="font-extrabold text-gray-900 tracking-tight text-base">Central District</span>
                        <ChevronRight size={14} className="text-orange-500 stroke-[3] opacity-60 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
                <Link to="/profile" className="relative group">
                    <div className="w-12 h-12 bg-gray-50 rounded-full border border-gray-100 flex items-center justify-center text-gray-600 shadow-sm group-active:scale-95 transition-all">
                        <User size={20} className="stroke-[2.5]" />
                    </div>
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-orange-500 rounded-full border-[2.5px] border-white z-10"></span>
                </Link>
            </header>

            <motion.div variants={containerVariants} initial="hidden" animate="show">
                {/* Search Header */}
                <motion.div variants={itemVariants} className="px-7 mt-8 mb-8">
                    <h1 className="text-4xl font-black italic tracking-tighter text-gray-900 leading-[1.1] mb-6">
                        What are you<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">craving</span> today?
                    </h1>

                    <div onClick={() => navigate('/search')} className="group w-full p-4.5 bg-gray-50/80 rounded-[28px] border border-gray-100 flex items-center gap-4 text-gray-400 cursor-text shadow-inner transition-all hover:bg-gray-50 relative overflow-hidden">
                        <div className="bg-white p-2.5 rounded-[18px] shadow-sm">
                            <Search size={18} className="text-orange-500 stroke-[3]" />
                        </div>
                        <span className="font-bold text-sm text-gray-400">Search for burgers, pizza...</span>
                    </div>
                </motion.div>

                {/* Animated Banner */}
                <motion.div variants={itemVariants} className="px-7 mb-10">
                    <div className="bg-gray-900 rounded-[40px] p-8 text-white relative overflow-hidden flex flex-col justify-center h-48 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] group">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-orange-500/20 to-amber-500/5 rounded-full blur-[40px]"
                        />
                        <div className="absolute top-6 right-6">
                            <ChefHat size={24} className="text-white/20" />
                        </div>
                        <div className="relative z-10 w-2/3">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles size={12} className="text-amber-400" />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400">Exclusive</span>
                            </div>
                            <h3 className="text-3xl font-black italic tracking-tighter leading-none mb-2">Free Delivery</h3>
                            <p className="text-xs font-medium text-gray-300">On your first premium order.</p>
                        </div>

                        {/* Decorative image bubble right */}
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-orange-500 rounded-full flex items-center justify-center p-2 shadow-inner border-4 border-gray-900">
                            <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover rounded-full" alt="Promo" />
                        </div>
                    </div>
                </motion.div>

                {/* Category Carousel */}
                <motion.div variants={itemVariants} className="mb-10">
                    <div className="px-7 flex justify-between items-end mb-5">
                        <h3 className="text-[12px] font-black text-gray-900 uppercase tracking-widest">Categories</h3>
                        <span className="text-[10px] font-bold text-orange-500 uppercase flex items-center gap-1 active:opacity-50">See All <ChevronRight size={12} /></span>
                    </div>
                    <div className="flex overflow-x-auto space-x-4 px-7 pb-4 no-scrollbar snap-x">
                        {categories.map((cat, i) => (
                            <motion.div
                                whileTap={{ scale: 0.95 }}
                                key={cat.id}
                                onClick={() => navigate(`/search?q=${cat.name}`)}
                                className="snap-start flex flex-col items-center flex-shrink-0 group cursor-pointer space-y-3"
                            >
                                <div className="w-[72px] h-[72px] bg-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.04)] border border-gray-50 group-hover:border-orange-100 transition-all overflow-hidden relative">
                                    {cat.image_url ? (
                                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover p-1.5 rounded-full" />
                                    ) : (
                                        <ChefHat size={28} className="text-gray-300 group-hover:text-orange-400 transition-colors" />
                                    )}
                                </div>
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider group-hover:text-gray-900 transition-colors">{cat.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Popular Discovery Grid */}
                <motion.div variants={itemVariants} className="px-7 mb-6">
                    <div className="flex justify-between items-end mb-6">
                        <h3 className="text-[12px] font-black text-gray-900 uppercase tracking-widest">Trending Now</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {popularProducts.slice(0, 6).map((prod) => (
                            <Link to={`/product/${prod.id}`} key={prod.id} className="group block h-full">
                                <div className="bg-white rounded-[28px] p-2.5 pb-5 h-full flex flex-col border border-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300">
                                    <div className="w-full aspect-square rounded-[20px] mb-3 relative overflow-hidden bg-gray-50">
                                        {prod.image_url ? (
                                            <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><ChefHat size={32} className="text-gray-200" /></div>
                                        )}

                                        {/* Overlay badges */}
                                        <div className="absolute top-2 left-2">
                                            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-xl flex items-center gap-1 shadow-sm">
                                                <Star size={8} className="text-amber-400 fill-amber-400" />
                                                <span className="text-[9px] font-black text-gray-900">{parseFloat(prod.avg_rating || 4.5).toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-1.5 flex flex-col flex-1 justify-between">
                                        <div>
                                            <h4 className="font-extrabold text-gray-900 text-[13px] leading-snug mb-1 line-clamp-1">{prod.name}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider line-clamp-1 mb-2">
                                                {prod.category?.name || 'Gourmet'}
                                            </p>
                                        </div>

                                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                                            <div className="flex items-start">
                                                <span className="text-[10px] font-black text-orange-500 mt-0.5">₹</span>
                                                <span className="font-black text-gray-900 text-lg tracking-tight leading-none">{parseFloat(prod.price).toFixed(2)}</span>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                                                <span className="text-lg font-light leading-none mb-0.5">+</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Home;
