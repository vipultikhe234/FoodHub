import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    ChefHat,
    Loader2
} from 'lucide-react';

const Registration = () => {
    const [step, setStep] = useState(1);
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
        if (!formData.name.trim()) return 'Please enter your name.';
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
            setStep(1);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#0B0F1A] flex flex-col font-sans overflow-x-hidden">
            {/* Premium Registration Hero */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative h-[30vh] min-h-[260px] bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-8 text-center"
            >
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, -90, 0],
                        opacity: [0.2, 0.3, 0.2]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-orange-500/20 rounded-full blur-[100px]"
                />

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10"
                >
                    <div className="w-16 h-16 bg-orange-500 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/30 border-2 border-white/20 -rotate-6">
                        <ChefHat className="text-white" size={32} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl font-[900] text-white font-['Outfit'] italic tracking-tighter leading-none mb-2">
                        JOIN THE <span className="text-orange-500">HUB</span>
                    </h1>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">Create Your Account</p>
                </motion.div>

                <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#FDFDFD] dark:bg-[#0B0F1A] rounded-t-[48px]"></div>
            </motion.div>

            {/* Step Indicator */}
            <div className="px-10 pt-4 flex gap-3 max-w-md mx-auto w-full mb-10">
                <div className="flex-1 space-y-2">
                    <div className={`h-1.5 rounded-full transition-all duration-700 ${step >= 1 ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-slate-100 dark:bg-white/5'}`}></div>
                    <p className={`text-[8px] font-black uppercase tracking-widest text-center ${step >= 1 ? 'text-orange-500' : 'text-slate-300'}`}>Basic Info</p>
                </div>
                <div className="flex-1 space-y-2">
                    <div className={`h-1.5 rounded-full transition-all duration-700 ${step >= 2 ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-slate-100 dark:bg-white/5'}`}></div>
                    <p className={`text-[8px] font-black uppercase tracking-widest text-center ${step >= 2 ? 'text-orange-500' : 'text-slate-300'}`}>Security</p>
                </div>
            </div>

            {/* Form Container */}
            <div className="flex-1 px-8 pb-12 w-full max-w-md mx-auto relative z-10">
                <AnimatePresence mode="popLayout">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-4 rounded-2xl mb-8 flex items-center gap-3"
                        >
                            <AlertCircle className="text-rose-500 shrink-0" size={18} />
                            <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 leading-tight">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            className="space-y-5"
                        >
                            <div className="mb-0">
                                <h2 className="text-2xl font-[900] text-gray-900 dark:text-white font-['Outfit'] tracking-tight mb-1">Your Identity</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step 01 of 02</p>
                            </div>

                            <div className="space-y-5">
                                <FormInput label="Full Name" icon={User} placeholder="John Doe" value={formData.name} onChange={v => update('name', v)} />
                                <FormInput label="Email Address" icon={Mail} placeholder="name@email.com" type="email" value={formData.email} onChange={v => update('email', v)} />
                                <FormInput label="Phone Number" icon={Phone} placeholder="+1 234 567 890" type="tel" value={formData.phone} onChange={v => update('phone', v)} />

                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-2">Delivery Address</label>
                                    <div className="bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-white/5 rounded-[24px] p-4 flex gap-4 focus-within:border-orange-500/30 transition-all shadow-sm">
                                        <MapPin className="text-slate-300 dark:text-gray-600 shrink-0 mt-1" size={20} />
                                        <textarea
                                            value={formData.address}
                                            onChange={e => update('address', e.target.value)}
                                            placeholder="Enter your address..."
                                            className="w-full bg-transparent outline-none text-sm font-bold text-gray-900 dark:text-white resize-none h-20 placeholder:text-slate-300 dark:placeholder:text-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={goNext}
                                className="w-full py-5 mt-8 bg-slate-900 dark:bg-orange-500 text-white rounded-[24px] shadow-2xl flex items-center justify-center gap-3 group"
                            >
                                <span className="text-[11px] font-black uppercase tracking-[0.3em]">Continue</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="step2"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            onSubmit={handleRegister}
                            className="space-y-6"
                        >
                            <div className="mb-0">
                                <h2 className="text-2xl font-[900] text-gray-900 dark:text-white font-['Outfit'] tracking-tight mb-1">Set Password</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step 02 of 02</p>
                            </div>

                            <div className="space-y-6">
                                <FormInput
                                    label="Password"
                                    icon={Lock}
                                    placeholder="••••••••"
                                    type={showPass ? "text" : "password"}
                                    value={formData.password}
                                    onChange={v => update('password', v)}
                                    suffix={
                                        <button type="button" onClick={() => setShowPass(!showPass)}>
                                            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    }
                                />
                                <FormInput
                                    label="Confirm Password"
                                    icon={Lock}
                                    placeholder="••••••••"
                                    type={showConfirmPass ? "text" : "password"}
                                    value={formData.password_confirmation}
                                    onChange={v => update('password_confirmation', v)}
                                    suffix={
                                        <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                                            {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    }
                                />
                            </div>

                            <div className="flex gap-4 mt-10">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-[24px] flex items-center justify-center text-slate-400 hover:text-orange-500 border border-slate-100 dark:border-white/5 transition-all"
                                >
                                    <ArrowLeft size={24} />
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className={`flex-1 flex items-center justify-center gap-3 rounded-[24px] shadow-2xl transition-all ${loading ? 'bg-slate-200' : 'bg-slate-900 dark:bg-orange-500 shadow-slate-900/20 dark:shadow-orange-500/20'
                                        }`}
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin text-slate-400" size={24} />
                                    ) : (
                                        <span className="text-white text-[11px] font-black uppercase tracking-[0.3em]">Register Now</span>
                                    )}
                                </motion.button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-12 text-center"
                >
                    <Link to="/login" className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest hover:text-orange-500 flex items-center justify-center gap-2">
                        Already Have an Account? <span className="text-orange-500 underline underline-offset-4">Login</span>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

const FormInput = ({ label, icon: Icon, placeholder, type = "text", value, onChange, suffix }) => (
    <div className="space-y-2.5">
        <label className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-2">{label}</label>
        <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600 transition-colors group-focus-within:text-orange-500">
                <Icon size={20} />
            </div>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-white/5 rounded-[24px] py-5 pl-14 pr-14 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/30 transition-all placeholder:text-slate-300 dark:placeholder:text-gray-600 shadow-sm"
                required
            />
            {suffix && (
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    {suffix}
                </div>
            )}
        </div>
    </div>
);

export default Registration;
