import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';

// ── Lazy-load pages (each page loads only when navigated to) ──────────────
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

// ── Minimal spinner shown while a page chunk loads ────────────────────────
const PageLoader = () => (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-3 bg-white">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] animate-pulse">Loading...</p>
    </div>
);

function Navigation() {
    const location = useLocation();
    const { cartItems } = useCart();
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // Define routes where the bottom navigation should be HIDDEN
    const hideOnRoutes = ['/checkout', '/login', '/register', '/order/'];
    const isProductDetail = location.pathname.startsWith('/product/');
    const isHidden = hideOnRoutes.some(route => location.pathname.startsWith(route)) || isProductDetail;

    if (isHidden) return null;

    const navLinks = [
        { to: '/', icon: '🏠', label: 'Home' },
        { to: '/search', icon: '🔍', label: 'Search' },
        { to: '/cart', icon: '🛒', label: 'Cart', badge: cartCount },
        { to: '/orders', icon: '📦', label: 'Orders' },
        { to: '/profile', icon: '👤', label: 'Profile' },
    ];

    return (
        <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-2xl border-t border-gray-50 flex justify-around items-center px-2 py-3 pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] z-40">
            {navLinks.map(({ to, icon, label, badge }) => {
                const isActive = location.pathname === to;
                return (
                    <Link
                        key={to}
                        to={to}
                        className="flex flex-col items-center gap-1 relative px-3 py-1"
                    >
                        <div className={`relative flex items-center justify-center w-12 h-9 rounded-2xl transition-all duration-300 ${isActive ? 'bg-gray-900 shadow-xl shadow-gray-900/20' : 'hover:bg-gray-50'
                            }`}>
                            <span className={`text-lg transition-all duration-300 ${isActive ? 'grayscale-0' : 'grayscale opacity-40'
                                }`}>{icon}</span>
                            {badge > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-500 text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                                    {badge > 9 ? '9+' : badge}
                                </span>
                            )}
                        </div>
                        <span className={`text-[7px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-gray-900' : 'text-gray-300'
                            }`}>{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}

function App() {
    return (
        <BrowserRouter>
            <CartProvider>
                <div className="flex flex-col h-screen bg-white">
                    <main className="flex-1 overflow-y-auto">
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
