import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/api';

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

                // Pre-fill from URL if present (e.g. from Home category click)
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
        <div className="bg-white min-h-screen pt-4 px-8 pb-24 font-sans animate-fade-in">
            {/* Search Input Section */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-2xl opacity-40">⬅️</button>
                <div className="flex-1 bg-gray-50 rounded-[28px] flex items-center px-6 py-4 border border-gray-100 focus-within:ring-2 focus-within:ring-orange-500 transition-all shadow-inner overflow-hidden relative group">
                    <span className="text-xl mr-3 group-hover:rotate-12 transition-transform">🔍</span>
                    <input
                        type="text"
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for culinary wonders..."
                        className="bg-transparent border-none outline-none w-full font-black text-gray-900 placeholder:text-gray-300 placeholder:font-medium text-xs uppercase tracking-widest"
                    />
                </div>
            </div>

            {/* Popular Searches / Content Tags */}
            {!query && (
                <div className="mb-12 animate-fade-in">
                    <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-6">Trending Scans</h3>
                    <div className="flex flex-wrap gap-4">
                        {['Pizza', 'Burger', 'Healthy', 'Special', 'Dessert', 'Spicy'].map(tag => (
                            <button
                                key={tag}
                                onClick={() => setQuery(tag)}
                                className="px-6 py-3 bg-white text-gray-500 rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-sm border border-gray-50"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-between items-end mb-8">
                <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
                    {query ? `MATCHES FOR [${query.toUpperCase()}]` : 'LIVE SUGGESTIONS'}
                </h3>
                <span className="text-[8px] font-black text-orange-500 opacity-60 uppercase tracking-widest">{filteredProducts.length} HITS Found</span>
            </div>

            {loading ? (
                <div className="space-y-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-6 p-4 animate-pulse">
                            <div className="w-24 h-24 bg-gray-100 rounded-[32px] shrink-0"></div>
                            <div className="flex-1 space-y-4 pt-2">
                                <div className="h-4 w-3/4 bg-gray-100 rounded-full"></div>
                                <div className="h-2 w-1/2 bg-gray-50 rounded-full"></div>
                                <div className="h-3 w-1/4 bg-orange-50 rounded-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-24 bg-gray-50 rounded-[48px] animate-fade-in">
                            <p className="text-6xl mb-6 grayscale opacity-20">📡</p>
                            <p className="text-[10px] font-black italic text-gray-400 uppercase tracking-[0.3em]">No Signal on this Cravings</p>
                            <button onClick={() => setQuery('')} className="mt-8 text-orange-500 font-black uppercase text-[10px] tracking-widest border-b-2 border-orange-500/20 pb-1">Reset Search Scanners</button>
                        </div>
                    ) : (
                        filteredProducts.map(prod => (
                            <Link
                                to={`/product/${prod.id}`}
                                key={prod.id}
                                className="group flex items-center gap-6 p-5 bg-white rounded-[40px] border border-gray-50 shadow-sm hover:shadow-2xl hover:shadow-orange-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500"
                            >
                                <div className="w-24 h-24 bg-gray-50 rounded-[32px] overflow-hidden flex items-center justify-center text-5xl shrink-0 group-hover:rotate-6 transition-transform">
                                    {prod.image_url ? (
                                        <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover p-2" />
                                    ) : (
                                        <span className="grayscale-0">🍱</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-black text-gray-900 text-sm tracking-tight uppercase italic group-hover:text-orange-500 transition-colors">{prod.name}</h4>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 line-clamp-2 leading-relaxed mb-3 pr-4">{prod.description}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black italic text-orange-500 tracking-tighter">₹{parseFloat(prod.price).toFixed(2)}</span>
                                            {prod.discount_price && <span className="text-[8px] font-black text-gray-300 line-through tracking-tighter">₹{parseFloat(prod.discount_price).toFixed(2)}</span>}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-40">
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em]">GO TO DISH</span>
                                            <span className="text-xs">➔</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;
