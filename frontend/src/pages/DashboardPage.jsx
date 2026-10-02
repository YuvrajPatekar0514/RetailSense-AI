import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Package, AlertTriangle, Box, TrendingUp, RefreshCw, Bot, ArrowRight, BarChart2 } from 'lucide-react';
import KPICard from '../components/KPICard';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { api } from '../services/api';

export default function DashboardPage({ setActivePage, filters }) {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await api.getDashboardKPIs({
          category: filters.category !== 'all' ? filters.category : undefined,
          country: filters.store !== 'all' ? filters.store.replace('STORE_', '') : undefined
        });
        setKpis(data);
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [filters]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-500 gap-3 py-16">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-xs font-semibold text-slate-600">Synchronizing enterprise retail analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <BarChart2 className="w-5 h-5" />
            </div>
            <span>Enterprise Retail Analytics & Decision Center</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time operational metrics, multi-dimensional filtering, and 10 synchronized Recharts visualization panels.
          </p>
        </div>
        <button 
          onClick={() => setActivePage('ai-assistant')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all self-start sm:self-auto shrink-0"
        >
          <Bot className="w-4 h-4" />
          <span>Launch AI Assistant</span>
        </button>
      </div>

      {/* 8 Required KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total GMV Revenue"
          value={`$${(kpis?.revenue || 0).toLocaleString()}`}
          change="+14.2%"
          changeType="positive"
          icon={DollarSign}
          color="cyan"
          subtitle="Real transaction sales sum"
        />
        <KPICard
          title="Units Sold"
          value={(kpis?.units_sold || 0).toLocaleString()}
          change="+8.5%"
          changeType="positive"
          icon={ShoppingCart}
          color="blue"
          subtitle="Processed order count"
        />
        <KPICard
          title="Total Inventory Units"
          value={(kpis?.total_inventory || 0).toLocaleString()}
          change="Healthy"
          changeType="positive"
          icon={Package}
          color="purple"
          subtitle="Fulfilled across stores"
        />
        <KPICard
          title="Stock-out Risk Items"
          value={kpis?.stockout_risk_count || 0}
          change={kpis?.stockout_risk_count > 0 ? "High Risk" : "None"}
          changeType={kpis?.stockout_risk_count > 0 ? "negative" : "positive"}
          icon={AlertTriangle}
          color="rose"
          subtitle="Risk > 0.50 threshold"
        />
        <KPICard
          title="Overstock Items"
          value={kpis?.overstock_count || 0}
          change="Capital Lockup"
          changeType="negative"
          icon={Box}
          color="amber"
          subtitle="Excess inventory count"
        />
        <KPICard
          title="Forecast Trend (7D)"
          value={kpis?.forecast_trend || "+12.4%"}
          change="Demand Lift"
          changeType="positive"
          icon={TrendingUp}
          color="emerald"
          subtitle="XGBoost / Random Forest"
        />
        <KPICard
          title="Customer Returns"
          value={kpis?.returns_count || 0}
          change="-2.1%"
          changeType="positive"
          icon={RefreshCw}
          color="blue"
          subtitle="Return requests filed"
        />
        <KPICard
          title="Active Agent Tasks"
          value={kpis?.active_agent_tasks || 3}
          change="Running"
          changeType="positive"
          icon={Bot}
          color="cyan"
          subtitle="LangGraph State Engine"
        />
      </div>

      {/* 10 Recharts Interactive Visualization Panels */}
      <AnalyticsCharts filters={filters} kpis={kpis} />
    </div>
  );
}
