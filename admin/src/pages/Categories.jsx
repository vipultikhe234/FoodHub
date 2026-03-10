import React, { useState, useEffect, useRef } from 'react';
import { productService } from '../services/api';
import api from '../services/api';
import { fetchRealFoodImage } from '../utils/aiHelpers';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imgLoading, setImgLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const debounceRef = useRef(null);

    const [newCategory, setNewCategory] = useState({
        name: '', image: '', image_url: '', status: true,
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/categories');
            setCategories(res.data.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    // ── Typing name → debounce → fetch real image ─────────────────────────
    const handleNameChange = async (e) => {
        const name = e.target.value;
        setNewCategory(prev => ({ ...prev, name }));

        // Don't auto-fetch new AI images if we're just editing an existing category! Keep the old image.
        if (editingId) return;

        clearTimeout(debounceRef.current);

        if (!name.trim()) {
            setNewCategory(prev => ({ ...prev, name, image: '', image_url: '' }));
            setImgLoading(false);
            return;
        }

        setImgLoading(true);
        debounceRef.current = setTimeout(async () => {
            const url = await fetchRealFoodImage(name);
            setNewCategory(prev => ({ ...prev, image: url, image_url: url }));
            setImgLoading(false);
        }, 700);
    };

    // ── Get a different alternative image ─────────────────────────────────
    const handleRetryImage = async () => {
        if (!newCategory.name.trim()) return;
        setImgLoading(true);
        const url = await fetchRealFoodImage(newCategory.name, true); // true forces a different random photo
        setNewCategory(prev => ({ ...prev, image: url, image_url: url }));
        setImgLoading(false);
    };

    // ── Manual upload overrides auto image ────────────────────────────────
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        try {
            setUploading(true);
            const res = await productService.uploadImage(formData);
            const path = res.data.path;
            setNewCategory(prev => ({
                ...prev,
                image: path,
                image_url: `http://localhost:8000/storage/${path}`,
            }));
        } catch {
            alert('Upload failed. Use a valid image format.');
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (cat) => {
        setEditingId(cat.id);
        setNewCategory({
            name: cat.name,
            image: cat.image || '',
            image_url: cat.image_url || '',
            status: cat.status ?? true,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Form Validation Check
        if (!newCategory.name.trim()) {
            return alert('⚠️ Please provide a category name before submitting.');
        }

        try {
            const payload = {
                name: newCategory.name,
                image: newCategory.image,
                status: newCategory.status,
            };

            if (editingId) {
                await api.put(`/categories/${editingId}`, payload);
            } else {
                await api.post('/categories', payload);
            }

            setShowModal(false);
            setEditingId(null);
            fetchData();
            setNewCategory({ name: '', image: '', image_url: '', status: true });
        } catch (err) {
            alert(`Error ${editingId ? 'updating' : 'creating'} category: ` + (err.response?.data?.message || err.message));
        }
    };

    const handleCopyToPlatform = async (platform) => {
        const { name } = newCategory;
        if (!name.trim()) return alert('⚠️ Enter a category name first!');

        const text = `📂 Category: ${name}\n📸 Image: ${newCategory.image_url || 'N/A'}`;

        try {
            await navigator.clipboard.writeText(text);
            alert(`✅ ${platform} Category Data Bundled!\n\nCategory name and image reference have been copied to your clipboard for your ${platform} Merchant Panel.`);
        } catch (err) {
            alert('Failed to copy. Please select and copy manually.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('This will hide all associated products. Continue?')) {
            try {
                await api.delete(`/categories/${id}`);
                setCategories(prev => prev.filter(c => c.id !== id));
            } catch {
                alert('Error deleting category');
            }
        }
    };

    const resetModal = () => {
        setShowModal(false);
        setEditingId(null);
        setNewCategory({ name: '', image: '', image_url: '', status: true });
        setImgLoading(false);
        clearTimeout(debounceRef.current);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse italic">Loading Categories...</p>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Categories</h1>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">
                        {categories.length} Groups · Auto real image from name
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-gray-900 text-white px-8 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-gray-900/20 active:scale-95"
                >
                    + New Category
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.length === 0 ? (
                    <div className="col-span-4 text-center py-20">
                        <p className="text-6xl mb-4 opacity-10">📂</p>
                        <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] italic">No categories yet. Create one!</p>
                    </div>
                ) : (
                    categories.map((cat) => (
                        <div key={cat.id} className="bg-white dark:bg-gray-800 rounded-[40px] border border-gray-50 dark:border-gray-700 hover:shadow-xl transition-all group relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full -mr-4 -mt-4 group-hover:scale-150 transition-transform duration-500 ${cat.status ? 'bg-green-500/5' : 'bg-red-500/5'}`}></div>
                            <div className="w-full h-44 overflow-hidden rounded-t-[40px] bg-gray-100 dark:bg-gray-700">
                                {cat.image_url ? (
                                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-5xl opacity-10">📂</div>
                                )}
                            </div>
                            <div className="p-5">
                                <h4 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tighter italic mb-2">{cat.name}</h4>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${cat.status ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    <span className={`w-1 h-1 rounded-full ${cat.status ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                    {cat.status ? 'Active' : 'Archived'}
                                </span>
                            </div>
                            <div className="absolute bottom-5 right-5 flex gap-2">
                                <button onClick={() => handleEdit(cat)} className="p-2.5 bg-gray-900 text-white rounded-[14px] opacity-40 group-hover:opacity-100 transition-all hover:bg-orange-500 text-sm shadow-xl">✏️</button>
                                <button onClick={() => handleDelete(cat.id)} className="p-2.5 bg-red-50 text-red-500 rounded-[14px] opacity-40 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white text-sm shadow-xl">🗑️</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-[48px] w-full max-w-lg shadow-2xl overflow-hidden animate-modal-in">

                        <div className="px-10 pt-10 pb-6 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                                    {editingId ? 'Edit Category' : 'New Category'}
                                </h2>
                                <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.3em] mt-1 flex items-center gap-1.5">
                                    {editingId ? 'Modify active group' : (
                                        <>
                                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                                            Auto real photo from TheMealDB
                                        </>
                                    )}
                                </p>
                            </div>
                            <button onClick={resetModal} className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition font-black text-lg">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-6">

                            {/* Name → triggers image fetch */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-3">Category Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Pizza, Biryani, Burgers..."
                                    required
                                    value={newCategory.name}
                                    onChange={handleNameChange}
                                    className="w-full p-5 bg-gray-50 dark:bg-gray-700 rounded-[24px] border-2 border-transparent focus:border-orange-500 outline-none font-black text-gray-900 dark:text-white placeholder:text-gray-300 placeholder:font-medium transition-all"
                                />
                                {imgLoading && (
                                    <p className="text-[9px] font-black text-orange-400 mt-2 ml-2 uppercase tracking-widest animate-pulse">
                                        🔍 Finding real food photo...
                                    </p>
                                )}
                                {!imgLoading && newCategory.image_url && (
                                    <p className="text-[9px] font-black text-green-500 mt-2 ml-2 uppercase tracking-widest">
                                        ✅ Real photo found!
                                    </p>
                                )}
                            </div>

                            {/* Image Preview */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-3">
                                    Category Image
                                    {newCategory.image_url && !imgLoading && !editingId && <span className="ml-2 text-orange-500">· Auto Fetched</span>}
                                </label>

                                <div className="relative rounded-[28px] overflow-hidden bg-gray-100 dark:bg-gray-700 h-52 border-2 border-dashed border-gray-100 dark:border-gray-600 group hover:border-orange-500/40 transition-all cursor-pointer">
                                    {imgLoading ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-700">
                                            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Fetching real photo...</p>
                                        </div>
                                    ) : newCategory.image_url ? (
                                        <>
                                            <img
                                                src={newCategory.image_url}
                                                alt="preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center transition-all">
                                                <p className="text-white font-black text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity text-center px-4">
                                                    📁 Click to upload your own
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                            <span className="text-5xl opacity-20">📷</span>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Type a name to auto-fetch photo</p>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploading || imgLoading} />
                                    {uploading && (
                                        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center">
                                            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-2 ml-2">
                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Click image to replace with your own upload</p>

                                    {newCategory.name.trim() && !imgLoading && (
                                        <button
                                            type="button"
                                            onClick={handleRetryImage}
                                            className="text-[9px] font-black text-orange-500 uppercase tracking-widest hover:text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-full transition-colors active:scale-95 border border-orange-100 dark:border-orange-500/20 shadow-sm"
                                        >
                                            {editingId ? '✨ Generate AI Image' : '🔄 Get Different Photo'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Visibility Toggle */}
                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setNewCategory(prev => ({ ...prev, status: !prev.status }))}>
                                <div className={`w-14 h-7 rounded-full transition-all relative shrink-0 ${newCategory.status ? 'bg-gray-900' : 'bg-gray-200 dark:bg-gray-600'}`}>
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${newCategory.status ? 'left-8' : 'left-1'}`}></div>
                                </div>
                                <div>
                                    <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">{newCategory.status ? 'Visible to customers' : 'Hidden from app'}</span>
                                    <p className="text-[9px] text-gray-400 font-bold">Toggle to show/hide in the app</p>
                                </div>
                            </div>

                            {/* Actions Component - Hub style */}
                            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4 text-center italic">Platform Distribution Hub</label>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {/* Swiggy Button */}
                                    <button
                                        type="button"
                                        onClick={() => handleCopyToPlatform('Swiggy')}
                                        className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/20 rounded-[20px] group transition-all hover:bg-orange-500 hover:scale-[1.02] active:scale-95 shadow-sm"
                                    >
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-orange-600 group-hover:text-white uppercase tracking-widest leading-none mb-1">Swiggy</p>
                                            <p className="text-[8px] font-bold text-orange-400 group-hover:text-white/80 uppercase">Copy Data</p>
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
                                            <p className="text-[10px] font-black text-red-600 group-hover:text-white uppercase tracking-widest leading-none mb-1">Zomato</p>
                                            <p className="text-[8px] font-bold text-red-400 group-hover:text-white/80 uppercase">Copy Data</p>
                                        </div>
                                        <span className="text-xl group-hover:rotate-12 transition-transform">🔴</span>
                                    </button>

                                    {/* Internal Save Button */}
                                    <button
                                        type="submit"
                                        disabled={uploading || imgLoading}
                                        className="flex items-center justify-between p-4 bg-gray-900 border border-transparent dark:bg-gray-700 text-white rounded-[20px] group transition-all hover:bg-orange-600 hover:scale-[1.02] active:scale-95 shadow-xl shadow-gray-200 dark:shadow-none"
                                    >
                                        <div className="text-left">
                                            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Save Group</p>
                                            <p className="text-[8px] font-bold text-gray-400 group-hover:text-white/80 uppercase">Index Node</p>
                                        </div>
                                        <span className="text-xl group-hover:translate-x-1 transition-transform">💾</span>
                                    </button>
                                </div>
                                <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest text-center italic mt-2">
                                    {imgLoading ? 'Synchronizing Visual Data...' : 'Global distribution console active'}
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
