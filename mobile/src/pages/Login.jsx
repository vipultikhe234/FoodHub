import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, UserPlus } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // If already logged in, redirect away
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
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            {/* Top decorative hero area */}
            <motion.div
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative bg-[#1C1C1E] h-[35vh] min-h-[280px] flex flex-col items-center justify-center overflow-hidden shrink-0"
            >
                {/* Abstract Orbs */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.2, 0.15] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-20%] right-[-10%] w-72 h-72 bg-[#FF4B3A]/20 rounded-full blur-[80px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-[#FF4B3A]/20 rounded-full blur-[70px]"
                />

                <div className="relative z-10 text-center flex flex-col items-center">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-16 h-16 bg-[#FF4B3A] rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-[#FF4B3A]/30 rotate-3"
                    >
                        <span className="text-3xl font-black italic text-white tracking-tighter">F</span>
                    </motion.div>
                    <motion.h1
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-5xl font-black text-white italic tracking-tighter leading-none mb-2"
                    >
                        Food<span className="text-[#FF4B3A]">Hub</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.4em]"
                    >
                        Premium Delivery Network
                    </motion.p>
                </div>

                {/* Bottom Curve */}
                <div className="absolute bottom-[-1px] left-0 right-0 w-full overflow-hidden leading-[0]">
                    <svg className="block w-full h-[40px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z" fill="#FFFFFF" opacity=".25"></path>
                        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V120H0Z" fill="#FFFFFF" opacity=".5"></path>
                        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V120H0Z" fill="#FFFFFF"></path>
                    </svg>
                </div>
            </motion.div>

            {/* Form area */}
            <div className="flex-1 px-8 pt-8 pb-10 flex flex-col justify-center max-w-md w-full mx-auto">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mb-8"
                >
                    <h2 className="text-[28px] font-black italic tracking-tighter text-[#1C1C1E] leading-none mb-2">Welcome Back</h2>
                    <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.3em]">Sign in to your account to continue</p>
                </motion.div>

                {/* Error */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#FFF2F0] border border-[#FF4B3A]/20 text-[#FF4B3A] p-4 rounded-[20px] mb-6 text-xs font-bold flex items-center gap-3"
                    >
                        <AlertCircle className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                        <span>{error}</span>
                    </motion.div>
                )}

                <motion.form
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    onSubmit={handleLogin}
                    className="space-y-5"
                >
                    {/* Email */}
                    <div>
                        <label className="block text-[9px] font-black text-[#8E8E93] uppercase tracking-[0.3em] mb-2 ml-2">Email Address</label>
                        <div className="relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D1D1D6]">
                                <Mail className="w-5 h-5" strokeWidth={2.5} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-14 pr-5 py-5 bg-[#FAFAFA] rounded-[24px] border border-[#F2F2F7] focus:border-[#FF4B3A]/30 focus:bg-white focus:ring-4 focus:ring-[#FF4B3A]/5 transition-all outline-none font-bold text-[#1C1C1E] placeholder:text-[#C7C7CC] placeholder:font-medium text-[15px]"
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <div className="flex justify-between items-center mb-2 px-2">
                            <label className="block text-[9px] font-black text-[#8E8E93] uppercase tracking-[0.3em]">Password</label>
                            <a href="#" className="text-[9px] font-black text-[#FF4B3A] uppercase tracking-widest hover:underline">Forgot?</a>
                        </div>
                        <div className="relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D1D1D6]">
                                <Lock className="w-5 h-5" strokeWidth={2.5} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-14 pr-14 py-5 bg-[#FAFAFA] rounded-[24px] border border-[#F2F2F7] focus:border-[#FF4B3A]/30 focus:bg-white focus:ring-4 focus:ring-[#FF4B3A]/5 transition-all outline-none font-bold text-[#1C1C1E] placeholder:text-[#C7C7CC] placeholder:font-medium text-[15px]"
                                placeholder="••••••••"
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#C7C7CC] hover:text-[#1C1C1E] transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={2.5} /> : <Eye className="w-5 h-5" strokeWidth={2.5} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className={`w-full py-5 rounded-[24px] font-black text-white text-[11px] uppercase tracking-[0.3em] shadow-xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group mt-4 ${loading ? 'bg-[#D1D1D6] shadow-none' : 'bg-[#FF4B3A] shadow-[#FF4B3A]/30 hover:bg-[#E03C2C]'
                            }`}
                    >
                        {!loading && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-[24px]"></div>}
                        <span className="relative z-10">{loading ? 'Authenticating...' : 'Sign In'}</span>
                        {!loading && <ArrowRight className="relative z-10 w-4 h-4 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all" strokeWidth={3} />}
                    </motion.button>
                </motion.form>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    {/* Divider */}
                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 h-[1px] bg-[#F2F2F7]"></div>
                        <span className="text-[9px] font-black text-[#C7C7CC] uppercase tracking-[0.3em]">New Here?</span>
                        <div className="flex-1 h-[1px] bg-[#F2F2F7]"></div>
                    </div>

                    {/* Register link */}
                    <Link
                        to="/register"
                        replace
                        className="w-full py-5 rounded-[24px] border-2 border-[#F2F2F7] bg-white text-[#1C1C1E] font-black text-[11px] uppercase tracking-[0.2em] hover:border-[#FF4B3A]/30 hover:bg-[#FAFAFA] transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <UserPlus className="w-4 h-4 text-[#8E8E93]" strokeWidth={2.5} />
                        Create Account
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
