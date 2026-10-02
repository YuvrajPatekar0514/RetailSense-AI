import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function KPICard({ title, value, change, changeType = 'positive', icon: Icon, color = 'blue', subtitle }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    cyan: 'bg-sky-50 text-sky-600 border-sky-100',
    purple: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100'
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm hover:shadow transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500">{title}</span>
        <div className={`p-2 rounded-lg border ${colorMap[color] || colorMap.blue}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
        {change && (
          <span className={`flex items-center text-[11px] font-semibold px-2 py-0.5 rounded ${
            changeType === 'positive' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
          }`}>
            {changeType === 'positive' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            {change}
          </span>
        )}
      </div>
      {subtitle && <p className="text-[11px] text-slate-400 mt-1 font-medium">{subtitle}</p>}
    </div>
  );
}
