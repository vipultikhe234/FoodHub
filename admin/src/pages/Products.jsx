import React, { useState, useEffect } from 'react';
import { productService } from '../services/api';
import api from '../services/api';

import { fetchRealFoodImage, generateAIDescription, generateProductNames } from '../utils/aiHelpers';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [imgLoading, setImgLoading] = useState(false);
    const debounceRef = React.useRef(null);

    const initialProductState = {
        name: '',
        category_id: '',
        price: '',
        description: '',
        stock: 0,
        image: '',
        is_available: true
    };

    const [newProduct, setNewProduct] = useState(initialProductState);
    const [nameSuggestions, setNameSuggestions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                productService.getAll(),
                api.get('/categories')
            ]);
            setProducts(prodRes.data.data);
            setCategories(catRes.data.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            setUploading(true);
            const response = await productService.uploadImage(formData);
            setNewProduct(prev => ({ ...prev, image: response.data.path }));
        } catch (error) {
            alert("Image upload failed. Try a smaller file.");
        } finally {
            setUploading(false);
        }
    };

    // ── Get a different alternative image ─────────────────────────────────
    const handleRetryImage = async () => {
        if (!newProduct.name.trim()) return;
        setImgLoading(true);
        const url = await fetchRealFoodImage(newProduct.name, true);
        setNewProduct(prev => ({ ...prev, image: url }));
        setImgLoading(false);
    };

    // ── Name Change with AI Image debounce ────────────────────────────────
    const handleNameChange = (e) => {
        const name = e.target.value;
        setNewProduct(prev => ({ ...prev, name }));

        // Don't auto-fetch if editing an existing product
        if (editingId) return;

        clearTimeout(debounceRef.current);

        if (!name.trim()) {
            setNewProduct(prev => ({ ...prev, name, image: '' }));
            setImgLoading(false);
            return;
        }

        setImgLoading(true);
        debounceRef.current = setTimeout(async () => {
            const desc = await generateAIDescription(name);
            const url = await fetchRealFoodImage(name, false, desc);
            setNewProduct(prev => ({ ...prev, image: url, description: desc }));
            setImgLoading(false);
        }, 1000);
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
        setNewProduct({
            name: product.name,
            category_id: product.category?.id || '',
            price: product.price,
            description: product.description || '',
            stock: product.stock || 0,
            image: product.image || '', // Ensure we use the raw path string for preview
            is_available: product.is_available ?? true
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Comprehensive Form Validation
        const { name, category_id, price } = newProduct;
        if (!name.trim()) return alert('⚠️ Product name is required.');
        if (!category_id) return alert('⚠️ Please select a valid Category for this product.');
        if (!price || isNaN(price) || Number(price) <= 0) return alert('⚠️ A valid base price greater than 0 is required.');

        try {
            if (editingId) {
                await api.put(`/products/${editingId}`, newProduct);
                alert("Inventory Updated! ✨");
            } else {
                await api.post('/products', newProduct);
                alert("Delicacy Published! 🚀");
            }
            setShowModal(false);
            setEditingId(null);
            fetchData();
            setNewProduct(initialProductState);
            setImgLoading(false);
            clearTimeout(debounceRef.current);
        } catch (error) {
            alert(`Error ${editingId ? 'updating' : 'creating'} product: Check all fields`);
        }
    };

    const handleCopyToPlatform = async (platform) => {
        const { name, description, price } = newProduct;
        if (!name.trim()) return alert('⚠️ Enter a product name first!');

        const text = `🍽️ Product: ${name}\n📖 Description: ${description}\n💰 Price: ₹${price}\n📸 Image: ${newProduct.image || 'N/A'}`;

        try {
            await navigator.clipboard.writeText(text);
            alert(`✅ ${platform} Data Bundled!\n\nName, Description, and Price have been copied to your clipboard. You can now paste them directly into your ${platform} Merchant Panel.\n\nTip: Download the AI image to upload it there too!`);
        } catch (err) {
            alert('Failed to copy. Please select and copy manually.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Permanent deletion cannot be undone. Proceed?")) {
            try {
                await api.delete(`/products/${id}`);
                setProducts(products.filter(p => p.id !== id));
            } catch (error) {
                alert("Error deleting product");
            }
        }
    };

    const STORAGE_URL = 'http://localhost:8000/storage/';

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-bold animate-pulse">Synchronizing Inventory...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Active Inventory</h1>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">Global Platform Distribution Hub</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setNewProduct(initialProductState);
                        setShowModal(true);
                    }}
                    className="bg-gray-900 dark:bg-orange-600 text-white px-10 py-4 rounded-[24px] font-black transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-gray-200 dark:shadow-orange-900/20 text-xs tracking-widest uppercase italic"
                >
                    + NEW PRODUCT
                </button>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border-2 ${selectedCategory === 'all'
                        ? 'bg-gray-900 dark:bg-orange-600 text-white border-transparent shadow-lg'
                        : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 hover:border-orange-500/30'
                        }`}
                >
                    All Delicacies
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border-2 ${selectedCategory === cat.id
                            ? 'bg-gray-900 dark:bg-orange-600 text-white border-transparent shadow-lg'
                            : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 hover:border-orange-500/30'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[48px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-50 dark:border-gray-700/50 overflow-hidden">
                <table className="min-w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-700/30 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <th className="px-10 py-7">Composition</th>
                            <th className="py-7 px-4">Classification</th>
                            <th className="py-7 px-4">Valuation</th>
                            <th className="py-7 px-4 text-center">Volume</th>
                            <th className="py-7 px-4">Visibility</th>
                            <th className="px-10 py-7 text-right">Ops</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {products
                            .filter(p => selectedCategory === 'all' || p.category?.id === selectedCategory)
                            .map((prod) => (
                                <tr key={prod.id} className="group hover:bg-gray-50/30 dark:hover:bg-gray-700/20 transition-all duration-300">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-[28px] flex items-center justify-center text-4xl overflow-hidden shrink-0 border border-gray-100 dark:border-white/5 relative group-hover:rotate-2 transition-transform">
                                                {prod.image_url ? (
                                                    <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <span className="opacity-20 grayscale scale-110">🍱</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-lg leading-none mb-2">{prod.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate max-w-[200px] italic">{prod.description || 'Null Composition Data'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4">
                                        <span className="px-4 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-full text-[9px] font-black uppercase text-gray-400 dark:text-gray-300 border border-gray-100 dark:border-white/5 italic">
                                            {prod.category?.name || 'Exclusive'}
                                        </span>
                                    </td>
                                    <td className="py-6 px-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-orange-500 tracking-tighter text-2xl italic">₹{parseFloat(prod.price).toFixed(2)}</span>
                                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-0.5">Mkt Price</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={`font-black text-[12px] uppercase ${prod.stock < 10 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>{prod.stock} UNITS</span>
                                            <div className="w-16 h-1 bg-gray-50 dark:bg-gray-700 rounded-full mt-2 overflow-hidden border border-gray-100 dark:border-white/5">
                                                <div className={`h-full ${prod.stock > 10 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${Math.min(prod.stock, 100)}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4">
                                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${prod.is_available ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${prod.is_available ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                            {prod.is_available ? 'Online' : 'Offline'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-all transform">
                                            <button onClick={() => handleEdit(prod)} className="p-4 bg-gray-900 text-white rounded-[18px] hover:bg-orange-500 transition-all shadow-xl shadow-gray-200 active:scale-90 grayscale group-hover:grayscale-0">
                                                ✏️
                                            </button>
                                            <button onClick={() => handleDelete(prod.id)} className="p-4 bg-red-50 text-red-500 rounded-[18px] hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-100 active:scale-90">
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {/* Premium Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4 z-[100] animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-[28px] w-full max-w-2xl p-5 shadow-[0_40px_100px_rgba(0,0,0,0.4)] animate-modal-in border border-white/10 relative overflow-x-hidden overflow-y-auto max-h-[90vh] custom-scrollbar">
                        <div className="absolute top-0 right-0 w-56 h-56 bg-orange-500/5 rounded-full blur-[60px] -mr-20 -mt-20"></div>

                        <div className="flex justify-between items-center mb-5 relative z-10 top-0 sticky bg-white/80 dark:bg-gray-900/80 backdrop-blur-md pb-2 pt-1 -mt-2">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white italic tracking-tighter leading-none mb-1 uppercase">
                                    {editingId ? 'Modify Delicacy' : 'Curate Delicacy'}
                                </h2>
                                <p className="text-[8px] font-black text-orange-500 uppercase tracking-[0.5em] italic">Delicacy Node: {editingId || 'NEW_NODE'}</p>
                            </div>
                            <button onClick={() => { setShowModal(false); setEditingId(null); }} className="w-8 h-8 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-500 hover:rotate-90 hover:bg-red-50 hover:text-red-500 transition-all duration-300 border border-gray-100 dark:border-white/5 shadow-sm text-xs">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-5 relative z-10">
                            {/* Image Placeholder/Upload */}
                            <div className="col-span-12 md:col-span-5">
                                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.4em] mb-1.5 ml-1">Visual Composition</label>
                                <div className="relative group overflow-hidden bg-gray-50 dark:bg-gray-800 rounded-[24px] h-[180px] border-4 border-dashed border-gray-100 dark:border-white/5 flex flex-col items-center justify-center transition-all hover:border-orange-500/40 shadow-inner">
                                    {imgLoading ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-[44px]">
                                            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Fetching real photo...</p>
                                        </div>
                                    ) : newProduct.image ? (
                                        <div className="w-full h-full relative">
                                            <img
                                                src={newProduct.image.startsWith('http') || newProduct.image.startsWith('data:') ? newProduct.image : `${STORAGE_URL}${newProduct.image}`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                alt="preview"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setNewProduct({ ...newProduct, image: '' }); }}
                                                    className="w-14 h-14 bg-red-500 text-white rounded-full shadow-2xl flex items-center justify-center text-xl hover:scale-110 active:scale-90 transition-all font-black"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center p-4 cursor-pointer">
                                            <span className="text-4xl mb-3 flex justify-center grayscale group-hover:grayscale-0 transition-all opacity-40 group-hover:opacity-100 group-hover:rotate-12">📸</span>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] italic">
                                                {uploading ? 'Processing Pixels...' : 'Inject Imagery Data'}
                                            </p>
                                            <p className="text-[7px] text-gray-300 font-bold mt-1 uppercase">2MB Max Payload</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        disabled={uploading || imgLoading}
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-2 ml-2">
                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Click image to replace</p>

                                    {newProduct.name.trim() && !imgLoading && (
                                        <button
                                            type="button"
                                            onClick={handleRetryImage}
                                            className="text-[9px] font-black text-orange-500 uppercase tracking-widest hover:text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-full transition-colors active:scale-95 z-10 relative shadow-sm border border-orange-100"
                                        >
                                            {editingId ? '✨ Generate AI Image' : '🔄 Different Photo'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="col-span-12 md:col-span-7 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <div className="flex justify-between items-center mb-1.5 ml-1">
                                            <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none">Product Naming</label>
                                            {newProduct.name.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setNameSuggestions(generateProductNames(newProduct.name))}
                                                    className="text-[8px] font-black text-orange-500 hover:text-orange-600 uppercase tracking-widest bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded-full transition-all border border-orange-100"
                                                >
                                                    ✨ Suggest Names
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            type="text" placeholder="e.g. Molecular Truffle" required
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-[14px] border-none focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-black dark:text-white text-sm placeholder:text-gray-200 dark:placeholder:text-gray-700 shadow-inner"
                                            value={newProduct.name} onChange={handleNameChange}
                                        />
                                        {nameSuggestions.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3 animate-fade-in">
                                                {nameSuggestions.map((s, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => {
                                                            setNewProduct(prev => ({ ...prev, name: s }));
                                                            setNameSuggestions([]);
                                                            // Trigger re-fetch for new name
                                                            handleNameChange({ target: { value: s } });
                                                        }}
                                                        className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-[9px] font-black text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white transition-all transform hover:scale-105"
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-span-1">
                                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.4em] mb-1.5 ml-1">Node Group</label>
                                        <select
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-[14px] border-none focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-black dark:text-white appearance-none cursor-pointer shadow-inner pr-6 italic text-sm" required
                                            value={newProduct.category_id} onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                                        >
                                            <option value="">Select Category...</option>
                                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="col-span-1">
                                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.4em] mb-1.5 ml-1">Market Valuation</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 font-black italic text-sm">₹</span>
                                            <input
                                                type="number" step="0.01" placeholder="0.00" required
                                                className="w-full p-3 pl-6 bg-gray-50 dark:bg-gray-800 rounded-[14px] border-none focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-black dark:text-white text-sm shadow-inner"
                                                value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-1">
                                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.4em] mb-1.5 ml-1">Inventory volume</label>
                                        <input
                                            type="number" placeholder="0" required
                                            className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-[14px] border-none focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-black dark:text-white text-sm shadow-inner"
                                            value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>

                                    <div className="col-span-1">
                                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.4em] mb-1.5 ml-1 italic">Visibility status</label>
                                        <div className="flex bg-gray-50 dark:bg-gray-800 rounded-[14px] p-1 gap-1 shadow-inner border border-gray-100 dark:border-white/5">
                                            <button
                                                type="button"
                                                onClick={() => setNewProduct({ ...newProduct, is_available: true })}
                                                className={`flex-1 py-2 px-1 rounded-[10px] font-black text-[8px] uppercase tracking-widest transition-all ${newProduct.is_available ? 'bg-white dark:bg-gray-700 shadow-sm dark:text-green-400 text-green-600' : 'text-gray-400 opacity-50'}`}
                                            >
                                                Live Node
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNewProduct({ ...newProduct, is_available: false })}
                                                className={`flex-1 py-2 px-1 rounded-[10px] font-black text-[8px] uppercase tracking-widest transition-all ${!newProduct.is_available ? 'bg-white dark:bg-gray-700 shadow-sm dark:text-red-400 text-red-600' : 'text-gray-400 opacity-50'}`}
                                            >
                                                Offline
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-[0.4em] mb-1.5 ml-1 flex justify-between">
                                        <span>Composition Metadata</span>
                                        {newProduct.description && !imgLoading && !editingId && <span className="text-orange-500 Normal-case">· AI</span>}
                                    </label>
                                    <textarea
                                        placeholder="Enter structural ingredients and culinary specifics..."
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-[16px] border-none focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-bold dark:text-white text-xs h-16 italic shadow-inner placeholder:text-gray-200"
                                        value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="col-span-12 space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4 text-center">Platform Distribution Hub</label>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {/* Swiggy Button */}
                                    <button
                                        type="button"
                                        onClick={() => handleCopyToPlatform('Swiggy')}
                                        className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/20 rounded-[20px] group transition-all hover:bg-orange-500 hover:scale-[1.02] active:scale-95 shadow-sm"
                                    >
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-orange-600 group-hover:text-white uppercase tracking-widest leading-none mb-1">Swiggy Panel</p>
                                            <p className="text-[8px] font-bold text-orange-400 group-hover:text-white/80 uppercase">Copy All Data</p>
                                        </div>
                                        <span className="text-xl group-hover:rotate-12 transition-transform">🚀</span>
                                    </button>

                                    {/* Zomato Button */}
                                    <button
                                        type="button"
                                        onClick={() => handleCopyToPlatform('Zomato')}
                                        className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20 rounded-[20px] group transition-all hover:bg-red-500 hover:scale-[1.02] active:scale-95 shadow-sm"
                                    >
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-red-600 group-hover:text-white uppercase tracking-widest leading-none mb-1">Zomato Panel</p>
                                            <p className="text-[8px] font-bold text-red-400 group-hover:text-white/80 uppercase">Copy All Data</p>
                                        </div>
                                        <span className="text-xl group-hover:rotate-12 transition-transform">🔴</span>
                                    </button>

                                    {/* Internal Save Button */}
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="flex items-center justify-between p-4 bg-gray-900 dark:bg-gray-700 text-white rounded-[20px] group transition-all hover:bg-orange-600 hover:scale-[1.02] active:scale-95 shadow-xl shadow-gray-200 dark:shadow-none"
                                    >
                                        <div className="text-left">
                                            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Save Local</p>
                                            <p className="text-[8px] font-bold text-gray-400 group-hover:text-white/80 uppercase">Sync Inventory</p>
                                        </div>
                                        <span className="text-xl group-hover:translate-x-1 transition-transform">💾</span>
                                    </button>
                                </div>

                                <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest text-center italic">
                                    {uploading ? 'Finalizing Data Stream...' : 'Multi-platform synchronization active'}
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;

