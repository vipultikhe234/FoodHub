import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout error");
        } finally {
            navigate('/login');
        }
    };

    const navLinks = [
        { to: '/', label: 'Dashboard', icon: '📊' },
        { to: '/products', label: 'Products', icon: '🥘' },
        { to: '/categories', label: 'Categories', icon: '📂' },
        { to: '/orders', label: 'Orders', icon: '📦' },
        { to: '/users', label: 'Users', icon: '👥' },
    ];


    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Premium Sidebar */}
            <aside className="w-72 bg-white dark:bg-gray-800 shadow-[4px_0_30px_rgba(0,0,0,0.04)] flex flex-col border-r border-gray-50 dark:border-gray-700/50 shrink-0">
                {/* Brand */}
                <div className="px-8 py-8 border-b border-gray-50 dark:border-gray-700/50">
                    <h1 className="text-2xl font-black text-orange-500 tracking-tighter italic leading-none">FoodHub
                        <span className="block text-gray-900 dark:text-white not-italic text-sm font-black uppercase tracking-[0.3em] mt-1 text-gray-400">Admin Console</span>
                    </h1>
                </div>

                {/* Nav Links */}
                <nav className="mt-6 px-4 space-y-1 flex-1">
                    {navLinks.map(({ to, label, icon }) => {
                        const isActive = location.pathname === to;
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={`flex items-center gap-4 py-4 px-5 rounded-[20px] font-black text-sm transition-all duration-300 group ${isActive
                                    ? 'bg-gray-900 text-white shadow-2xl shadow-gray-900/20'
                                    : 'text-gray-400 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <span className={`text-xl transition-transform group-hover:scale-110 ${isActive ? '' : 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100'}`}>{icon}</span>
                                <span className="tracking-widest uppercase text-[10px]">{label}</span>
                                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500"></span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Panel + Logout */}
                <div className="p-5 border-t border-gray-50 dark:border-gray-700/50">
                    {user && (
                        <div className="flex items-center gap-3 mb-4 p-4 bg-gray-50 dark:bg-white/5 rounded-[20px]">
                            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-black text-sm italic">
                                {user.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-gray-900 dark:text-white text-[11px] uppercase tracking-widest leading-none mb-0.5">{user.name}</span>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider italic truncate max-w-[120px]">{user.email}</span>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 py-4 px-5 rounded-[20px] text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all font-black text-[10px] uppercase tracking-widest"
                    >
                        <span className="text-xl">🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto flex flex-col">
                <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl border-b border-gray-50 dark:border-gray-700/50 px-10 py-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">
                            {navLinks.find(l => l.location === location.pathname)?.label || location.pathname.replace('/', '').replace(/^./, s => s.toUpperCase()) || 'Dashboard'}
                        </h2>
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.4em] mt-1.5 italic">FoodHub Global Management System</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-5 py-3 bg-green-50 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">System Online</span>
                        </div>
                    </div>
                </header>
                <div className="flex-1 p-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
