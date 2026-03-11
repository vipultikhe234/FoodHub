import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import {
    Home as HomeIcon,
    Search as SearchIcon,
    ShoppingBag,
    Clock,
    User,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Lazy-load pages ──────────────────────────────
const Home = lazy(() => import('./pages/Home'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const Registration = lazy(() => import('./pages/Registration'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Orders = lazy(() => import('./pages/Orders'));
const Search = lazy(() => import('./pages/Search'));
const Profile = lazy(() => import('./pages/Profile'));
const OrderStatus = lazy(() => import('./pages/OrderStatus'));

// ── Minimal spinner ────────────────────────
const PageLoader = () => (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-white dark:bg-[#0B0F1A]">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
            <Loader2 className="w-10 h-10 text-orange-500" />
        </motion.div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] animate-pulse">Syncing Hub...</p>
    </div>
);

function Navigation() {
    const location = useLocation();
    const { cartItems } = useCart();
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const hideOnRoutes = ['/checkout', '/login', '/register', '/order/'];
    const isProductDetail = location.pathname.startsWith('/product/');
    const isHidden = hideOnRoutes.some(route => location.pathname.startsWith(route)) || isProductDetail;

    if (isHidden) return null;

    const navLinks = [
        { to: '/', icon: HomeIcon, label: 'Discover' },
        { to: '/search', icon: SearchIcon, label: 'Search' },
        { to: '/cart', icon: ShoppingBag, label: 'Cart', badge: cartCount },
        { to: '/orders', icon: Clock, label: 'Activity' },
        { to: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50">
            <nav className="bg-white/80 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-white/5 flex justify-around items-center p-2 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
                {navLinks.map(({ to, icon: Icon, label, badge }) => {
                    const isActive = location.pathname === to;
                    return (
                        <Link
                            key={to}
                            to={to}
                            className="flex flex-col items-center gap-1.5 py-2 px-1 flex-1 relative"
                        >
                            <motion.div
                                animate={isActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                                className={`relative flex items-center justify-center w-12 h-10 rounded-2xl transition-all duration-300 ${isActive
                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40'
                                        : 'text-slate-400 dark:text-gray-500 hover:bg-slate-50 dark:hover:bg-white/5'
                                    }`}
                            >
                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                {badge > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-black dark:bg-white text-white dark:text-black text-[9px] font-[900] rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900"
                                    >
                                        {badge > 9 ? '9+' : badge}
                                    </motion.span>
                                )}
                            </motion.div>
                            <span className={`text-[8px] font-black uppercase tracking-wider transition-colors ${isActive ? 'text-gray-900 dark:text-white' : 'text-slate-400 dark:text-gray-500'
                                }`}>
                                {label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="mobileNavDot"
                                    className="absolute -top-1.5 w-1 h-1 bg-orange-500 rounded-full"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <CartProvider>
                <div className="flex flex-col min-h-screen bg-[#FDFDFD] dark:bg-[#0B0F1A]">
                    <main className="flex-1">
                        <Suspense fallback={<PageLoader />}>
                            <Routes>
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Registration />} />
                                <Route path="/" element={<Home />} />
                                <Route path="/search" element={<Search />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/orders" element={<Orders />} />
                                <Route path="/order/:id" element={<OrderStatus />} />
                                <Route path="/checkout" element={<Checkout />} />
                                <Route path="/product/:id" element={<ProductDetail />} />
                            </Routes>
                        </Suspense>
                    </main>
                    <Navigation />
                </div>
            </CartProvider>
        </BrowserRouter>
    );
}

export default App;
