import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { motion } from 'framer-motion';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    ArrowRight,
    Fingerprint,
    ChefHat,
    Loader2
} from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (localStorage.getItem('access_token')) navigate('/');
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await authService.login({ email, password });
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            const from = location.state?.from || '/';
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#0B0F1A] flex flex-col font-sans overflow-x-hidden">
            {/* High-End Hero Header */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative h-[40vh] min-h-[320px] bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-8 text-center"
            >
                {/* Dynamic Background Elements */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.3, 0.4, 0.3]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-orange-500/20 rounded-[80px] blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -45, 0],
                        opacity: [0.2, 0.3, 0.2]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 2 }}
                    className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]"
                />

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10"
                >
                    <div className="w-20 h-20 bg-orange-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-orange-500/40 border-4 border-white/20 rotate-12">
                        <ChefHat className="text-white" size={40} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-5xl font-[900] text-white font-['Outfit'] italic tracking-tighter leading-none mb-3">
                        FOOD<span className="text-orange-500">HUB</span>
                    </h1>
                    <div className="flex items-center justify-center gap-3">
                        <span className="h-px w-8 bg-white/20"></span>
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">Establish Connection</p>
                        <span className="h-px w-8 bg-white/20"></span>
                    </div>
                </motion.div>

                {/* Glassmorphism Bottom Card Curve */}
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#FDFDFD] dark:bg-[#0B0F1A] rounded-t-[48px]"></div>
            </motion.div>

            {/* Login Integration Form */}
            <div className="flex-1 px-8 pt-6 pb-12 w-full max-w-md mx-auto relative z-10">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mb-10"
                >
                    <h2 className="text-3xl font-[900] text-gray-900 dark:text-white font-['Outfit'] tracking-tight mb-2">Welcome Back</h2>
                    <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest italic">Authorization Required</p>
                </motion.div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-4 rounded-2xl mb-8 flex items-center gap-3"
                    >
                        <AlertCircle className="text-rose-500 shrink-0" size={18} />
                        <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 leading-tight">{error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2.5 ml-2 block">Identity Access</label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600 transition-colors group-focus-within:text-orange-500">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-white/5 rounded-[24px] py-5 pl-14 pr-6 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/30 transition-all placeholder:text-slate-300 dark:placeholder:text-gray-600 shadow-sm"
                                required
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex justify-between items-center mb-2.5 px-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em]">Security Key</label>
                            <button type="button" className="text-[10px] font-black text-orange-500 uppercase hover:underline tracking-widest leading-none">Recover?</button>
                        </div>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600 transition-colors group-focus-within:text-orange-500">
                                <Lock size={20} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-white/5 rounded-[24px] py-5 pl-14 pr-16 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/30 transition-all placeholder:text-slate-300 dark:placeholder:text-gray-600 shadow-sm"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-gray-900 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </motion.div>

                    <motion.button
                        layout
                        whileTap={{ scale: 0.98 }}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        disabled={loading}
                        className={`w-full py-5 rounded-[24px] relative overflow-hidden group shadow-2xl transition-all flex items-center justify-center gap-3 ${loading ? 'bg-slate-200 cursor-not-allowed' : 'bg-slate-900 dark:bg-orange-500 shadow-slate-900/20 dark:shadow-orange-500/20'
                            }`}
                    >
                        {loading ? (
                            <Loader2 className="text-slate-400 animate-spin" size={20} />
                        ) : (
                            <>
                                <span className="text-white text-[11px] font-black uppercase tracking-[0.3em] relative z-10">Authorize Access</span>
                                <ArrowRight className="text-white group-hover:translate-x-1 transition-transform relative z-10" size={18} />
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </>
                        )}
                    </motion.button>
                </form>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 text-center"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex-1 h-px bg-slate-100 dark:bg-white/5"></div>
                        <span className="text-[10px] font-black text-slate-300 dark:text-gray-600 uppercase tracking-widest">New Protocol?</span>
                        <div className="flex-1 h-px bg-slate-100 dark:bg-white/5"></div>
                    </div>

                    <Link to="/register" className="group flex items-center justify-center gap-4 py-5 bg-white dark:bg-white/5 rounded-[24px] border border-gray-100 dark:border-white/5 active:scale-95 transition-all shadow-sm">
                        <div className="w-8 h-8 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-orange-500 transition-colors">
                            <Fingerprint size={16} />
                        </div>
                        <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Create New Identity</span>
                    </Link>
                </motion.div>
            </div>

            {/* Quality Promise Footer */}
            <div className="mt-auto px-8 pb-8 text-center">
                <p className="text-[9px] font-medium text-slate-400 dark:text-gray-600 uppercase tracking-widest leading-relaxed">
                    End-to-End Encrypted Delivery Network <br />
                    FoodHub Premium © 2026
                </p>
            </div>
        </div>
    );
};

export default Login;
