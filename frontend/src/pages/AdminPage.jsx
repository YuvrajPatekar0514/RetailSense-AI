import React, { useEffect, useState } from 'react';
import { ShieldCheck, Database, RefreshCw, Server, Users, Key, CheckCircle2, Lock, Activity } from 'lucide-react';
import { api } from '../services/api';

export default function AdminPage({ userRole, setUserRole }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load admin stats", err);
    } finally {
      setLoading(false);
    }
  }

  const rbacPermissions = [
    { role: 'seller', title: 'Seller / Merchant', desc: 'Demand Forecasting, Inventory Stock Management, Procurement Orders, Dynamic Pricing', access: 'FULL OPERATIONAL ACCESS' },
    { role: 'customer', title: 'Customer Consumer', desc: 'Product Search, AI Recommendations, Order Status Tracking, Return Requests', access: 'READ & PERSONALIZATION' },
    { role: 'admin', title: 'System Administrator', desc: 'Database Seed & Schema, Agent Execution Controls, Vector Store Indexing, RBAC Management', access: 'FULL SYSTEM CONTROL' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span>System Administration & Database Governance</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Relational table record counts, system status, API router health, and Role-Based Access Control (RBAC).
          </p>
        </div>
        <button
          onClick={loadStats}
          className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-lg border border-slate-200 transition-all self-start sm:self-auto shrink-0 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh System Stats</span>
        </button>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500">System Health Status</span>
            <div className="text-lg font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              {stats?.status || 'HEALTHY'}
            </div>
          </div>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded text-xs font-bold">100% Uptime</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500">Database Engine</span>
            <div className="text-sm font-bold text-slate-900 mt-1">{stats?.database_backend || 'SQLAlchemy Async'}</div>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500">Active Persona Role</span>
            <div className="text-sm font-bold text-blue-700 capitalize mt-1">{userRole}</div>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
            <Key className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Relational Database Table Record Counts */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Relational Database Table Statistics (PostgreSQL Ready)</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">19 Schema Tables Registered</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2 font-medium">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Fetching table record counts from database session...</span>
          </div>
        ) : stats?.table_counts ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(stats.table_counts).map(([tbl, count]) => (
              <div key={tbl} className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center shadow-2xs">
                <span className="text-[11px] text-slate-500 uppercase font-mono block font-semibold mb-1">{tbl}</span>
                <span className="text-lg font-bold text-blue-700">{count.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">records</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* RBAC Role Management */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-4 h-4 text-rose-600" />
          <span>Role-Based Access Control (RBAC) Matrix</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rbacPermissions.map((r) => {
            const isActive = userRole === r.role;
            return (
              <div
                key={r.role}
                onClick={() => setUserRole(r.role)}
                className={`bg-white border rounded-xl p-4 space-y-3 cursor-pointer transition-all shadow-sm ${
                  isActive ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{r.title}</h4>
                  {isActive && (
                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                      SELECTED
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{r.desc}</p>
                <div className="border-t border-slate-100 pt-2.5 flex justify-between items-center text-[10px] font-bold text-emerald-700">
                  <span>{r.access}</span>
                  <Lock className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
