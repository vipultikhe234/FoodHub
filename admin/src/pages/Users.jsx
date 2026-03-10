import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users');
            setUsers(res.data.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse italic">Retrieving User Directory...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Customers</h1>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">Total Registered: {users.length}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[48px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-50 dark:border-gray-700/50 overflow-hidden">
                <table className="min-w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-700/30 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <th className="px-10 py-7">Profile Info</th>
                            <th className="py-7 px-4 text-center">Contact</th>
                            <th className="py-7 px-4">Address</th>
                            <th className="py-7 px-4 text-right pr-10">Member Since</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="py-32 text-center">
                                    <div className="flex flex-col items-center justify-center opacity-20">
                                        <span className="text-6xl mb-4">👤</span>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Zero Customer Records Found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="group hover:bg-gray-50/30 dark:hover:bg-gray-700/20 transition-all duration-300">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-gray-900 text-white rounded-[20px] flex items-center justify-center text-xl font-black italic border border-white/5 relative group-hover:rotate-3 transition-transform">
                                                {user.name?.[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-base leading-none mb-1.5">{user.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4 text-center">
                                        <span className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-full text-[10px] font-black uppercase text-gray-400 dark:text-gray-300 border border-gray-100 dark:border-white/5 italic">
                                            {user.phone || 'NO_CONTACT'}
                                        </span>
                                    </td>
                                    <td className="py-6 px-4">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest max-w-[200px] truncate italic">{user.address || 'Deployment Loc Null'}</p>
                                    </td>
                                    <td className="py-6 px-10 text-right">
                                        <div className="flex flex-col">
                                            <span className="font-black text-gray-900 dark:text-white text-[12px] uppercase italic">{new Date(user.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-0.5">Registration Stamp</span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
