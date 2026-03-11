import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Shield,
    LogOut,
    Edit2,
    X,
    CheckCircle2,
    ChevronRight,
    Camera,
    Settings,
    Bell
} from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setFormData({
                name: parsedUser.name || '',
                phone: parsedUser.phone || '',
                address: parsedUser.address || ''
            });
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await authService.updateProfile(formData);
            const updatedUser = response.data.user;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setEditing(false);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            navigate('/login');
        } catch (error) {
            localStorage.clear();
            navigate('/login');
        }
    };

    if (!user) return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4 bg-[#FDFDFD] dark:bg-[#0B0F1A]">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-300 dark:text-gray-600 uppercase tracking-[0.4em] animate-pulse">Syncing Profile...</p>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#FDFDFD] dark:bg-[#0B0F1A] min-h-screen pb-32 font-sans"
        >
            {/* High-End Profile Hero */}
            <div className="relative h-[40vh] min-h-[320px] bg-slate-900 overflow-hidden flex flex-col items-center justify-center pt-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] -ml-20 -mb-20"></div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10"
                >
                    <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-[48px] p-1 shadow-2xl relative">
                        <div className="w-full h-full bg-slate-50 dark:bg-gray-900 rounded-[44px] flex items-center justify-center overflow-hidden border-2 border-slate-100 dark:border-white/5">
                            <span className="text-4xl font-[900] text-gray-900 dark:text-white font-['Outfit'] italic">{user.name[0]}</span>
                        </div>
                        <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-slate-900">
                            <Camera size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                </motion.div>

                <div className="mt-6 text-center z-10">
                    <h2 className="text-3xl font-[900] text-white font-['Outfit'] italic tracking-tighter uppercase mb-1">{user.name}</h2>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] font-['Outfit']">{user.email}</p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#FDFDFD] dark:bg-[#0B0F1A] rounded-t-[48px]"></div>
            </div>

            <div className="px-8 space-y-10">
                {/* Profile Controls */}
                <div className="flex gap-4">
                    <button
                        onClick={() => setEditing(!editing)}
                        className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 transition-all ${editing ? 'bg-rose-500 text-white shadow-xl' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 text-gray-900 dark:text-white shadow-premium'
                            }`}
                    >
                        {editing ? <X size={20} /> : <Edit2 size={20} />}
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">{editing ? 'Cancel' : 'Edit Profile'}</span>
                    </button>
                    <div className="w-14 h-14 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 rounded-2xl flex items-center justify-center text-slate-400 shadow-premium">
                        <Settings size={20} />
                    </div>
                    <div className="w-14 h-14 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 rounded-2xl flex items-center justify-center text-slate-400 shadow-premium relative">
                        <Bell size={20} />
                        <div className="absolute top-4 right-4 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {editing ? (
                        <motion.form
                            key="editing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            onSubmit={handleUpdate}
                            className="space-y-6"
                        >
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block italic">Update Information</label>

                            <div className="space-y-5">
                                <div className="bg-white dark:bg-gray-800/40 p-6 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-premium space-y-6">
                                    <div className="space-y-2">
                                        <p className="text-[8px] font-black text-slate-300 dark:text-gray-600 uppercase tracking-widest leading-none pl-1">Full Name</p>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-transparent border-b-2 border-slate-50 dark:border-white/5 py-2 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-orange-500 transition-colors"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[8px] font-black text-slate-300 dark:text-gray-600 uppercase tracking-widest leading-none pl-1">Phone Number</p>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-transparent border-b-2 border-slate-50 dark:border-white/5 py-2 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-orange-500 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[8px] font-black text-slate-300 dark:text-gray-600 uppercase tracking-widest leading-none pl-1">Delivery Address</p>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full bg-transparent border-b-2 border-slate-50 dark:border-white/5 py-2 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-orange-500 transition-colors resize-none h-20"
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full h-16 rounded-[24px] shadow-2xl flex items-center justify-center gap-3 transition-all ${loading ? 'bg-slate-200' : 'bg-slate-900 dark:bg-orange-500 shadow-slate-900/10 dark:shadow-orange-500/20'
                                        }`}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={18} />
                                            <span className="text-white text-[11px] font-black uppercase tracking-[0.3em]">Save Changes</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="viewing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-10"
                        >
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block italic">Account Directory</label>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Mobile Number', value: user.phone || 'Not provided', icon: Phone, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                                        { label: 'Current Address', value: user.address || 'No address saved', icon: MapPin, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
                                        { label: 'Verified Status', value: 'Prime Delivery Node', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' }
                                    ].map((item, i) => (
                                        <div key={i} className="bg-white dark:bg-gray-800/40 p-5 rounded-[28px] border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-5">
                                            <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center shrink-0`}>
                                                <item.icon size={22} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none">{item.label}</p>
                                                <p className="font-bold text-gray-900 dark:text-white text-sm truncate italic">{item.value}</p>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-200" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2">
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-between p-6 bg-rose-50 dark:bg-rose-500/10 rounded-[32px] text-rose-500 border border-rose-100 dark:border-rose-500/20 group hover:bg-rose-500 hover:text-white transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-white/20">
                                            <LogOut size={24} strokeWidth={2.5} />
                                        </div>
                                        <div className="text-left">
                                            <span className="font-black uppercase tracking-widest text-[11px] block italic leading-none mb-1">Logout</span>
                                            <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest leading-none">Discard Active Session</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="opacity-30 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <p className="text-center text-[9px] font-black text-slate-200 dark:text-gray-800 uppercase tracking-[0.5em] mt-20 mb-10 italic">
                FoodHub Ecosystem v1.0.4
            </p>
        </motion.div>
    );
};

export default Profile;
