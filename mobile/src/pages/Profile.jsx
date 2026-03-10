import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Shield, LogOut, Edit2, X, CheckCircle2, ChevronRight } from 'lucide-react';

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
        <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA]">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 border-4 border-[#FF4B3A] border-t-transparent rounded-full"
            />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#FAFAFA] min-h-screen pt-10 px-6 pb-24"
        >
            {/* Header Section */}
            <div className="flex flex-col items-center mb-10 text-center relative">
                <motion.div
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="relative group mb-6"
                >
                    <div className="w-28 h-28 bg-[#FFF2F0] rounded-[40px] flex items-center justify-center shadow-2xl shadow-[#FF4B3A]/10 border-4 border-white">
                        <User className="w-12 h-12 text-[#FF4B3A]" strokeWidth={2.5} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#32D74B] rounded-full border-4 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl font-black italic tracking-tighter text-[#1C1C1E]"
                >
                    {user.name}
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 mt-2 mb-6 text-[#8E8E93]"
                >
                    <Mail className="w-3.5 h-3.5" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">{user.email}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-2 w-full max-w-xs"
                >
                    <span className="flex-1 py-3 bg-[#1C1C1E] text-white rounded-2xl flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{user.role || 'Member'}</span>
                    </span>
                    <button
                        onClick={() => setEditing(!editing)}
                        className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 ${editing
                            ? 'bg-[#FF4B3A] text-white shadow-xl shadow-[#FF4B3A]/20'
                            : 'bg-white text-[#1C1C1E] border border-[#F2F2F7] shadow-sm'
                            }`}
                    >
                        {editing ? (
                            <>
                                <X className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Cancel</span>
                            </>
                        ) : (
                            <>
                                <Edit2 className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Edit Profile</span>
                            </>
                        )}
                    </button>
                </motion.div>
            </div>

            {/* Profile Content */}
            <div className="relative">
                <AnimatePresence mode="wait">
                    {editing ? (
                        <motion.form
                            key="edit-form"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleUpdate}
                            className="space-y-5"
                        >
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-[#8E8E93] uppercase tracking-widest mb-2 ml-1">
                                        Real Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C7C7CC]">
                                            <User className="w-5 h-5" strokeWidth={2.5} />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-white rounded-[24px] border-2 border-transparent focus:border-[#FF4B3A]/20 focus:ring-4 focus:ring-[#FFF2F0] transition-all outline-none font-bold text-[#1C1C1E]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-[#8E8E93] uppercase tracking-widest mb-2 ml-1">
                                        Contact Terminal
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C7C7CC]">
                                            <Phone className="w-5 h-5" strokeWidth={2.5} />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-white rounded-[24px] border-2 border-transparent focus:border-[#FF4B3A]/20 focus:ring-4 focus:ring-[#FFF2F0] transition-all outline-none font-bold text-[#1C1C1E]"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-[#8E8E93] uppercase tracking-widest mb-2 ml-1">
                                        Home Hub (Address)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-5 text-[#C7C7CC]">
                                            <MapPin className="w-5 h-5" strokeWidth={2.5} />
                                        </div>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-white rounded-[24px] border-2 border-transparent focus:border-[#FF4B3A]/20 focus:ring-4 focus:ring-[#FFF2F0] transition-all outline-none font-medium text-[#1C1C1E] h-32 resize-none"
                                            placeholder="Your primary delivery HQ..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-[#1C1C1E] text-white font-black rounded-[24px] shadow-xl shadow-[#1C1C1E]/20 flex items-center justify-center gap-2 text-[11px] tracking-widest uppercase mt-8 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                        <span>Synchronizing...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>Save Data Changes</span>
                                    </>
                                )}
                            </motion.button>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="details-view"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8"
                        >
                            <div>
                                <h3 className="text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.2em] mb-4 ml-2">Personal Directory</h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Primary Contact', value: user.phone || 'Not Set', icon: Phone, color: '#0A84FF' },
                                        { label: 'Delivery Terminal', value: user.address || 'Click edit to set address', icon: MapPin, color: '#30D158' },
                                        { label: 'Security Level', value: 'Verified Member', icon: Shield, color: '#5E5CE6' },
                                    ].map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * i }}
                                            className="flex items-center gap-4 p-5 bg-white rounded-[28px] border border-[#F2F2F7] shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="w-12 h-12 rounded-[20px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                                                <item.icon className="w-6 h-6" style={{ color: item.color }} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[9px] font-black text-[#8E8E93] uppercase tracking-[0.2em] mb-0.5">{item.label}</p>
                                                <p className="font-bold text-[#1C1C1E] tracking-tight truncate">{item.value}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2">
                                <h3 className="text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.2em] mb-4 ml-2">App Protocol</h3>
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-between p-5 bg-[#FFF2F0] rounded-[28px] text-[#FF3B30] group hover:bg-[#FF3B30] hover:text-white transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-[20px] flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                                            <LogOut className="w-6 h-6" strokeWidth={2.5} />
                                        </div>
                                        <span className="font-black uppercase tracking-widest text-[11px] italic">De-authorize session</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 opacity-40 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-[8.5px] font-black text-[#D1D1D6] uppercase tracking-[0.4em] mt-12 mb-4 italic"
            >
                Authorized Node {user.id.toString().padStart(4, '0')} // FoodHub v1.0.4
            </motion.p>
        </motion.div>
    );
};

export default Profile;
