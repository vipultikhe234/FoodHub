import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await authService.login(credentials);
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">FoodHub</h1>
                    <p className="text-orange-500 font-bold uppercase tracking-widest text-sm">Admin Control Panel</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full p-4 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                            placeholder="admin@foodhub.com"
                            value={credentials.email}
                            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full p-4 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-2xl border-none focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                            placeholder="••••••••"
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gray-900 dark:bg-orange-600 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Authenticating...' : 'Secure Login'}
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-400 text-xs font-medium">
                    Authorized Personnel Only. Unauthorized access is monitored.
                </p>
            </div>
        </div>
    );
};

export default Login;
