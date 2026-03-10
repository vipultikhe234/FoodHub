import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const Registration = () => {
    const [step, setStep] = useState(1); // 2-step form
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '',
        address: '', password: '', password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const update = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

    const validateStep1 = () => {
        if (!formData.name.trim()) return 'Please enter your full name.';
        if (!formData.email.trim()) return 'Please enter your email.';
        if (!formData.phone.trim()) return 'Please enter your phone number.';
        return null;
    };

    const goNext = () => {
        const err = validateStep1();
        if (err) { setError(err); return; }
        setError('');
        setStep(2);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.password_confirmation) {
            setError('Passwords do not match.');
            return;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await authService.register(formData);
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            const from = location.state?.from || '/';
            navigate(from, { replace: true });
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.errors;
            setError(typeof msg === 'object' ? Object.values(msg).flat().join('. ') : (msg || 'Registration failed.'));
            setStep(1); // Go back to step 1 if server error
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative bg-[#1C1C1E] h-[30vh] min-h-[240px] flex flex-col items-center justify-center overflow-hidden shrink-0"
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

                <div className="relative z-10 text-center flex flex-col items-center mt-4">
                    <motion.h1
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl font-black text-white italic tracking-tighter leading-none mb-2"
                    >
                        Food<span className="text-[#FF4B3A]">Hub</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.4em]"
                    >
                        Create Your Account
                    </motion.p>
                </div>

                {/* Bottom Curve */}
                <div className="absolute bottom-[-1px] left-0 right-0 w-full overflow-hidden leading-[0]">
                    <svg className="block w-full h-[30px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z" fill="#FFFFFF" opacity=".25"></path>
                        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V120H0Z" fill="#FFFFFF" opacity=".5"></path>
                        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V120H0Z" fill="#FFFFFF"></path>
                    </svg>
                </div>
            </motion.div>

            {/* Step Progress indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 px-8 pt-6 pb-2 max-w-md mx-auto w-full"
            >
                <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-[#FF4B3A]' : 'bg-[#F2F2F7]'}`}></div>
                <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-[#FF4B3A]' : 'bg-[#F2F2F7]'}`}></div>
                <span className="text-[9px] font-black text-[#8E8E93] uppercase tracking-widest ml-1">Step {step}/2</span>
            </motion.div>

            {/* Form */}
            <div className="flex-1 px-8 pt-4 pb-10 flex flex-col max-w-md mx-auto w-full">
                <motion.div
                    key={`header-${step}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-6"
                >
                    <h2 className="text-[26px] font-black italic tracking-tighter text-[#1C1C1E] leading-none mb-1">
                        {step === 1 ? 'Your Identity' : 'Set Password'}
                    </h2>
                    <p className="text-[9px] font-black text-[#8E8E93] uppercase tracking-[0.3em]">
                        {step === 1 ? 'Tell us who you are' : 'Secure your account'}
                    </p>
                </motion.div>

                <AnimatePresence mode="popLayout">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-[#FFF2F0] border border-[#FF4B3A]/20 text-[#FF4B3A] p-4 rounded-[20px] mb-5 text-xs font-bold flex items-center gap-3"
                        >
                            <AlertCircle className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            {/* Flat Input Style */}
                            <div>
                                <label className="block text-[9px] font-black text-[#8E8E93] uppercase tracking-[0.3em] mb-2 ml-2">Full Name</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D1D1D6]">
                                        <User className="w-5 h-5" strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => update('name', e.target.value)}
                                        className="w-full pl-14 pr-5 py-5 bg-[#FAFAFA] rounded-[24px] border border-[#F2F2F7] focus:border-[#FF4B3A]/30 focus:bg-white focus:ring-4 focus:ring-[#FF4B3A]/5 transition-all outline-none font-bold text-[#1C1C1E] placeholder:text-[#C7C7CC] text-[15px]"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] font-black text-[#8E8E93] uppercase tracking-[0.3em] mb-2 ml-2">Email Address</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D1D1D6]">
                                        <Mail className="w-5 h-5" strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => update('email', e.target.value)}
                                        className="w-full pl-14 pr-5 py-5 bg-[#FAFAFA] rounded-[24px] border border-[#F2F2F7] focus:border-[#FF4B3A]/30 focus:bg-white focus:ring-4 focus:ring-[#FF4B3A]/5 transition-all outline-none font-bold text-[#1C1C1E] placeholder:text-[#C7C7CC] text-[15px]"
                                        placeholder="john@example.com"
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] font-black text-[#8E8E93] uppercase tracking-[0.3em] mb-2 ml-2">Phone Number</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D1D1D6]">
                                        <Phone className="w-5 h-5" strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => update('phone', e.target.value)}
                                        className="w-full pl-14 pr-5 py-5 bg-[#FAFAFA] rounded-[24px] border border-[#F2F2F7] focus:border-[#FF4B3A]/30 focus:bg-white focus:ring-4 focus:ring-[#FF4B3A]/5 transition-all outline-none font-bold text-[#1C1C1E] placeholder:text-[#C7C7CC] text-[15px]"
                                        placeholder="+1 234 567 8900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] font-black text-[#8E8E93] uppercase tracking-[0.3em] mb-2 ml-2">Delivery Address <span className="text-[#C7C7CC] font-normal lowercase">(Optional)</span></label>
                                <div className="relative">
                                    <div className="absolute left-5 top-5 text-[#D1D1D6]">
                                        <MapPin className="w-5 h-5" strokeWidth={2.5} />
                                    </div>
                                    <textarea
                                        value={formData.address}
                                        onChange={e => update('address', e.target.value)}
                                        className="w-full pl-14 pr-5 py-5 bg-[#FAFAFA] rounded-[24px] border border-[#F2F2F7] focus:border-[#FF4B3A]/30 focus:bg-white focus:ring-4 focus:ring-[#FF4B3A]/5 transition-all outline-none font-medium text-[#1C1C1E] placeholder:text-[#C7C7CC] h-24 resize-none text-[15px]"
                                        placeholder="123 Main St..."
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={goNext}
                                className="w-full py-5 bg-[#1C1C1E] rounded-[24px] font-black text-white text-[11px] uppercase tracking-[0.4em] shadow-xl shadow-[#1C1C1E]/20 transition-all flex items-center justify-center gap-3 mt-6 hover:bg-[#FF4B3A]"
                            >
                                Continue <ArrowRight className="w-4 h-4" strokeWidth={3} />
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleRegister}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-[9px] font-black text-[#8E8E93] uppercase tracking-[0.3em] mb-2 ml-2">Password</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D1D1D6]">
                                        <Lock className="w-5 h-5" strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={e => update('password', e.target.value)}
                                        className="w-full pl-14 pr-14 py-5 bg-[#FAFAFA] rounded-[24px] border border-[#F2F2F7] focus:border-[#FF4B3A]/30 focus:bg-white focus:ring-4 focus:ring-[#FF4B3A]/5 transition-all outline-none font-bold text-[#1C1C1E] placeholder:text-[#C7C7CC] text-[15px]"
                                        placeholder="Min. 8 characters"
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#C7C7CC] hover:text-[#1C1C1E] transition-colors">
                                        {showPass ? <EyeOff className="w-5 h-5" strokeWidth={2.5} /> : <Eye className="w-5 h-5" strokeWidth={2.5} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] font-black text-[#8E8E93] uppercase tracking-[0.3em] mb-2 ml-2">Confirm Password</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D1D1D6]">
                                        <Lock className="w-5 h-5" strokeWidth={2.5} />
                                    </div>
                                    <input
                                        type={showConfirmPass ? 'text' : 'password'}
                                        value={formData.password_confirmation}
                                        onChange={e => update('password_confirmation', e.target.value)}
                                        className="w-full pl-14 pr-14 py-5 bg-[#FAFAFA] rounded-[24px] border border-[#F2F2F7] focus:border-[#FF4B3A]/30 focus:bg-white focus:ring-4 focus:ring-[#FF4B3A]/5 transition-all outline-none font-bold text-[#1C1C1E] placeholder:text-[#C7C7CC] text-[15px]"
                                        placeholder="Repeat password"
                                    />
                                    <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#C7C7CC] hover:text-[#1C1C1E] transition-colors">
                                        {showConfirmPass ? <EyeOff className="w-5 h-5" strokeWidth={2.5} /> : <Eye className="w-5 h-5" strokeWidth={2.5} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={() => setStep(1)}
                                    disabled={loading}
                                    className="px-6 py-5 bg-[#F2F2F7] rounded-[24px] text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-[#E5E5EA] transition-colors flex items-center justify-center"
                                >
                                    <ArrowLeft className="w-5 h-5" strokeWidth={3} />
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className={`flex-1 py-5 rounded-[24px] font-black text-white text-[11px] uppercase tracking-[0.4em] shadow-xl transition-all flex items-center justify-center gap-3 relative overflow-hidden ${loading ? 'bg-[#D1D1D6] shadow-none' : 'bg-[#FF4B3A] shadow-[#FF4B3A]/30 hover:bg-[#E03C2C]'}`}
                                >
                                    <span className="relative z-10">{loading ? 'Creating...' : 'Register'}</span>
                                </motion.button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8 mb-4 border-t border-[#F2F2F7] pt-8"
                >
                    <div className="text-center">
                        <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest mb-4">Already have an account?</p>
                        <Link
                            to="/login"
                            replace
                            className="block w-full py-5 rounded-[24px] border-2 border-[#F2F2F7] text-[#1C1C1E] font-black text-[11px] uppercase tracking-[0.3em] hover:border-[#FF4B3A]/30 hover:bg-[#FAFAFA] transition-all active:scale-95 text-center"
                        >
                            Go to Login
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Registration;
