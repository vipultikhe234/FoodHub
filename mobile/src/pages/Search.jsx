import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search as SearchIcon,
    ChevronLeft,
    X,
    Star,
    Clock,
    Filter,
    ArrowRight,
    TrendingUp
} from 'lucide-react';

const Search = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const response = await productService.getAll();
                setProducts(response.data.data);

                const params = new URLSearchParams(window.location.search);
                const q = params.get('q');
                if (q) {
                    setQuery(q);
                    const initialResults = response.data.data.filter(p =>
                        p.name.toLowerCase().includes(q.toLowerCase()) ||
                        p.description?.toLowerCase().includes(q.toLowerCase()) ||
                        p.category?.name?.toLowerCase().includes(q.toLowerCase())
                    );
                    setFilteredProducts(initialResults);
                } else {
                    setFilteredProducts(response.data.data);
                }
            } catch (error) {
                console.error("Search fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    useEffect(() => {
        const results = products.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.description?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredProducts(results);
    }, [query, products]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#FDFDFD] dark:bg-[#0B0F1A] min-h-screen pt-10 px-8 pb-32 font-sans"
        >
            {/* Premium Search Header */}
            <div className="flex items-center gap-4 mb-10 sticky top-8 z-50">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate(-1)}
                    className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-premium border border-gray-100 dark:border-white/5 flex items-center justify-center text-slate-900 dark:text-white shrink-0"
                >
                    <ChevronLeft size={24} />
                </motion.button>

                <div className="flex-1 relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600 transition-colors group-focus-within:text-orange-500">
                        <SearchIcon size={20} strokeWidth={2.5} />
                    </div>
                    <input
                        type="text"
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search food..."
                        className="w-full bg-white dark:bg-gray-800 rounded-[28px] py-5 pl-14 pr-16 text-sm font-bold text-gray-900 dark:text-white outline-none border border-gray-100 dark:border-white/5 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/20 transition-all placeholder:text-slate-300 dark:placeholder:text-gray-600 shadow-premium"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute right-6 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-rose-500 transition-colors"
                        >
                            <X size={18} strokeWidth={3} />
                        </button>
                    )}
                </div>
            </div>

            {/* Trending Tags */}
            {!query && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp size={16} className="text-orange-500" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">Trending Searches</h3>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {['Pizza', 'Burger', 'Biryani', 'Special', 'Dessert', 'Healthy'].map((tag, i) => (
                            <motion.button
                                key={tag}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setQuery(tag)}
                                className="px-6 py-3.5 bg-white dark:bg-gray-800/40 text-slate-500 dark:text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-sm border border-gray-100 dark:border-white/5"
                            >
                                {tag}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            )}

            <div className="flex justify-between items-end mb-8 px-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none pl-1">
                    {query ? 'Search Results' : 'Suggestions'}
                </h3>
                <span className="text-[9px] font-black text-orange-500 uppercase tracking-[0.2em]">{filteredProducts.length} DISHES FOUND</span>
            </div>

            {loading ? (
                <div className="space-y-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-6 p-6 bg-white dark:bg-gray-800/20 rounded-[44px] animate-pulse items-center">
                            <div className="w-24 h-24 bg-slate-50 dark:bg-gray-800 rounded-[32px] shrink-0"></div>
                            <div className="flex-1 space-y-4">
                                <div className="h-4 w-3/4 bg-slate-50 dark:bg-gray-800 rounded-full"></div>
                                <div className="h-2 w-1/2 bg-slate-50 dark:bg-gray-800 rounded-full opacity-50"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredProducts.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-28 bg-white dark:bg-gray-900 rounded-[56px] border border-gray-100 dark:border-white/5 shadow-premium flex flex-col items-center justify-center p-8"
                            >
                                <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-8">
                                    <X size={48} strokeWidth={1} className="text-rose-300" />
                                </div>
                                <h3 className="text-2xl font-[900] text-gray-900 dark:text-white font-['Outfit'] italic tracking-tighter uppercase mb-2">No Results</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-10">We couldn't find any dishes matching your query</p>
                                <button onClick={() => setQuery('')} className="text-orange-500 font-black uppercase text-[10px] tracking-widest border-b-2 border-orange-500/20 pb-1">Reset Search Scanners</button>
                            </motion.div>
                        ) : (
                            filteredProducts.map((prod, index) => (
                                <motion.div
                                    key={prod.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group"
                                >
                                    <Link
                                        to={`/product/${prod.id}`}
                                        className="flex items-center gap-6 p-5 bg-white dark:bg-gray-800/40 rounded-[44px] border border-gray-100 dark:border-white/5 shadow-premium group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1 relative"
                                    >
                                        <div className="w-24 h-24 bg-slate-50 dark:bg-gray-900 rounded-[32px] overflow-hidden shrink-0 group-hover:scale-110 transition-transform duration-700">
                                            {prod.image_url ? (
                                                <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-200"><Star size={32} /></div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex justify-between items-start mb-1.5">
                                                <h4 className="font-[900] text-gray-900 dark:text-white text-lg tracking-tight font-['Outfit'] italic uppercase truncate leading-none">{prod.name}</h4>
                                            </div>
                                            <p className="text-[10px] font-medium text-slate-400 dark:text-gray-500 line-clamp-2 leading-relaxed mb-4">{prod.description}</p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-end gap-1">
                                                    <span className="text-xs font-[900] text-orange-500 font-['Outfit'] mb-0.5">₹</span>
                                                    <span className="text-2xl font-[900] text-gray-900 dark:text-white font-['Outfit'] tracking-tighter italic leading-none">{parseFloat(prod.price).toFixed(0)}</span>
                                                </div>
                                                <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-orange-500 text-white flex items-center justify-center shadow-lg group-hover:translate-x-1 transition-transform">
                                                    <ArrowRight size={18} strokeWidth={3} />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            )}

            <p className="text-center text-[9px] font-black text-slate-200 dark:text-gray-800 uppercase tracking-[0.5em] mt-20 mb-8 italic">
                Scanning Food Database...
            </p>
        </motion.div>
    );
};

export default Search;
