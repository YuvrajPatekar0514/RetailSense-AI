import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import DashboardPage from '../pages/DashboardPage';
import AIAssistantPage from '../pages/AIAssistantPage';
import DemandForecastPage from '../pages/DemandForecastPage';
import InventoryPage from '../pages/InventoryPage';
import ProductsPage from '../pages/ProductsPage';
import OrdersPage from '../pages/OrdersPage';
import SuppliersPage from '../pages/SuppliersPage';
import ReportsPage from '../pages/ReportsPage';
import GlobalFilterBar from '../components/GlobalFilterBar';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

import CustomerDataManagement from '../components/CustomerDataManagement';
import CSVImportExportWizard from '../components/CSVImportExportWizard';

export default function RetailerLayout() {
  const [activePage, setActivePage] = useState('dashboard');
  const [isDark, setIsDark] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [filters, setFilters] = useState({
    dateRange: 'all',
    city: 'all',
    store: 'all',
    category: 'all',
    subcategory: 'all',
    product: 'all',
    supplier: 'all',
    customerSegment: 'all',
    riskLevel: 'all',
    demandLevel: 'all'
  });

  return (
    <div className={`h-screen w-screen overflow-hidden flex bg-slate-50 text-slate-900 ${isDark ? 'dark bg-slate-950 text-slate-100' : ''}`}>
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)} 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Retailer Navigation Sidebar */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={(page) => {
          setActivePage(page);
          setMobileSidebarOpen(false);
        }}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
      />

      {/* Main Retailer Workspace Layout */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Navbar */}
        <Navbar 
          isDark={isDark} 
          setIsDark={setIsDark} 
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          activePage={activePage}
        />

        {/* Global Filter Bar */}
        <GlobalFilterBar filters={filters} setFilters={setFilters} />

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/70">
          {(activePage === 'dashboard') && (
            <DashboardPage setActivePage={setActivePage} filters={filters} />
          )}
          {(activePage === 'ai-assistant') && (
            <AIAssistantPage filters={filters} />
          )}
          {(activePage === 'demand-forecast') && (
            <DemandForecastPage filters={filters} />
          )}
          {(activePage === 'inventory' || activePage === 'pricing-promotions') && (
            <InventoryPage filters={filters} />
          )}
          {(activePage === 'products') && (
            <ProductsPage filters={filters} />
          )}
          {(activePage === 'orders') && (
            <OrdersPage filters={filters} />
          )}
          {(activePage === 'customers') && (
            <CustomerDataManagement />
          )}
          {(activePage === 'csv-hub') && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Retailer CSV Data Import & Export Hub</h2>
                <p className="text-xs text-slate-500">Bulk upload or download stores, inventory, products, orders, customers, and suppliers CSV data.</p>
              </div>
              <CSVImportExportWizard initialEntity="products" />
            </div>
          )}
          {(activePage === 'suppliers' || activePage === 'procurement') && (
            <SuppliersPage filters={filters} />
          )}
          {(activePage === 'reports') && (
            <ReportsPage filters={filters} />
          )}
        </main>
      </div>
    </div>
  );
}
