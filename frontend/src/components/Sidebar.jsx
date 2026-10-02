import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  TrendingUp, 
  Package, 
  ShoppingBag, 
  Users, 
  ShoppingCart, 
  Truck, 
  ShieldAlert, 
  BookOpen, 
  FileText, 
  Settings, 
  Sparkles, 
  X,
  BadgePercent,
  Headphones,
  RotateCcw,
  Factory,
  FileSpreadsheet
} from 'lucide-react';

const NAV_GROUPS = [
  {
    title: 'Core Workspace',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
      { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, badge: 'LangGraph' }
    ]
  },
  {
    title: 'Intelligence & Planning',
    items: [
      { id: 'demand-forecast', label: 'Demand Forecasting', icon: TrendingUp, badge: 'ML' },
      { id: 'inventory', label: 'Inventory Management', icon: Package, badge: null },
      { id: 'pricing-promotions', label: 'Pricing & Promotions', icon: BadgePercent, badge: 'Sim' },
      { id: 'reports', label: 'Analytics & Reports', icon: FileText, badge: null }
    ]
  },
  {
    title: 'Retail Operations',
    items: [
      { id: 'products', label: 'Products Catalog', icon: ShoppingBag, badge: null },
      { id: 'orders', label: 'Orders & Fulfillment', icon: ShoppingCart, badge: null },
      { id: 'customers', label: 'Customers & CRM', icon: Users, badge: null },
      { id: 'suppliers', label: 'Suppliers Directory', icon: Truck, badge: null },
      { id: 'procurement', label: 'Procurement POs', icon: Factory, badge: null },
      { id: 'csv-hub', label: 'CSV Data Import/Export', icon: FileSpreadsheet, badge: 'CSV' },
      { id: 'customer-support', label: 'Customer Support', icon: Headphones, badge: 'RAG' },
      { id: 'returns-resolution', label: 'Returns & Resolution', icon: RotateCcw, badge: null }
    ]
  },
  {
    title: 'System & Governance',
    items: [
      { id: 'agent-control', label: 'AI Agent Control', icon: ShieldAlert, badge: 'Live' },
      { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen, badge: 'Vector' },
      { id: 'admin', label: 'Admin Settings', icon: Settings, badge: null }
    ]
  }
];

export default function Sidebar({ activePage, setActivePage, mobileSidebarOpen, setMobileSidebarOpen }) {
  return (
    <aside className={`fixed md:relative inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out shadow-sm ${
      mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    }`}>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 text-base tracking-tight leading-none flex items-center gap-1.5">
                <span>RetailSense</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1 py-0.2 rounded font-bold uppercase">AI</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-1">Autonomous Decision Platform</p>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button 
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items Organized by Group */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {NAV_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {group.title}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActivePage(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 ${
                      isActive 
                        ? 'bg-blue-50/90 text-blue-700 font-semibold border-l-4 border-blue-600 shadow-none pl-2' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded-md ${
                        isActive 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer System Info */}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50/60 shrink-0">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-medium">8 Autonomous Agents</span>
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Operational
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
