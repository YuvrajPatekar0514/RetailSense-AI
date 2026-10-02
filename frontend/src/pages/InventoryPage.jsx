import React, { useEffect, useState } from 'react';
import { Package, AlertTriangle, Box, RefreshCw, Search, ShieldCheck, ArrowRightLeft, PlusCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export default function InventoryPage({ filters }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [reorderSuccess, setReorderSuccess] = useState(null);

  useEffect(() => {
    loadInventory();
  }, []);

  async function loadInventory() {
    setLoading(true);
    try {
      const data = await api.getInventoryItems();
      setInventory(data);
    } catch (err) {
      console.error("Failed to load inventory", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.product_id.toLowerCase().includes(search.toLowerCase()) || item.store_id.toLowerCase().includes(search.toLowerCase());
    if (riskFilter === 'stockout') return matchesSearch && item.stockout_risk > 0.5;
    if (riskFilter === 'overstock') return matchesSearch && item.overstock_risk > 0.5;
    return matchesSearch;
  });

  const stockoutCount = inventory.filter(i => i.stockout_risk > 0.5).length;
  const overstockCount = inventory.filter(i => i.overstock_risk > 0.5).length;
  const totalUnits = inventory.reduce((sum, i) => sum + (i.current_stock || 0), 0);

  function triggerReorder(item) {
    setReorderSuccess(`Purchase Order created for ${item.product_id} (${item.recommended_order_qty} units).`);
    setTimeout(() => setReorderSuccess(null), 4000);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Package className="w-5 h-5" />
            </div>
            <span>Inventory & Stock Management</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time stock levels, automated stock-out risk assessment, and autonomous reorder optimization.
          </p>
        </div>
        <button
          onClick={loadInventory}
          className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-lg border border-slate-200 transition-all self-start sm:self-auto shrink-0 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Stock Data</span>
        </button>
      </div>

      {reorderSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl flex items-center gap-2 font-medium shadow-xs">
          <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{reorderSuccess}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Managed Stock</span>
            <div className="text-xl font-bold text-slate-900 mt-1">{totalUnits.toLocaleString()} units</div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500">High Stock-out Risk</span>
            <div className="text-xl font-bold text-rose-600 mt-1">{stockoutCount} SKUs</div>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500">Overstock Capital Risk</span>
            <div className="text-xl font-bold text-amber-600 mt-1">{overstockCount} SKUs</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
            <Box className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Product or Store ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-medium"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'stockout', label: 'Stockout Risk (>50%)' },
            { id: 'overstock', label: 'Overstock Risk (>50%)' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setRiskFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${
                riskFilter === f.id
                  ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2 font-medium">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading inventory records...</span>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">
            No matching inventory items found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Product ID</th>
                  <th className="px-4 py-3">Store ID</th>
                  <th className="px-4 py-3">Current Stock</th>
                  <th className="px-4 py-3">Reorder Point</th>
                  <th className="px-4 py-3">Safety Stock</th>
                  <th className="px-4 py-3">7-Day Forecast</th>
                  <th className="px-4 py-3">Stockout Risk</th>
                  <th className="px-4 py-3">Overstock Risk</th>
                  <th className="px-4 py-3">Rec. Order Qty</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((item) => {
                  const isStockoutRisk = item.stockout_risk > 0.5;
                  const isOverstockRisk = item.overstock_risk > 0.5;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono text-blue-700 font-bold">{item.product_id}</td>
                      <td className="px-4 py-3 font-mono text-slate-600 font-medium">{item.store_id}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{item.current_stock}</td>
                      <td className="px-4 py-3 text-slate-500">{item.reorder_point}</td>
                      <td className="px-4 py-3 text-slate-500">{item.safety_stock}</td>
                      <td className="px-4 py-3 text-slate-700 font-medium">{item.forecast_7d_units} units</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isStockoutRisk ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {(item.stockout_risk * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isOverstockRisk ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {(item.overstock_risk * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-700">+{item.recommended_order_qty}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => triggerReorder(item)}
                          className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[11px] font-semibold px-3 py-1 rounded-lg transition-all flex items-center gap-1 ml-auto shadow-2xs"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Reorder</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
