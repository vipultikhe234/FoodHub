import React from 'react';

const StatCard = ({ label, value, icon, sub, accent }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-[32px] p-7 border border-gray-50 dark:border-gray-700 relative overflow-hidden group hover:shadow-xl transition-all`}>
        <div className={`absolute inset-0 ${accent} opacity-0 group-hover:opacity-[0.03] transition-opacity`}></div>
        <div className="flex justify-between items-start mb-4">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">{label}</p>
            <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{icon}</span>
        </div>
        <h3 className="text-4xl font-black italic tracking-tighter text-gray-900 dark:text-white leading-none mb-2">{value}</h3>
        {sub && <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{sub}</p>}
    </div>
);

export default StatCard;
