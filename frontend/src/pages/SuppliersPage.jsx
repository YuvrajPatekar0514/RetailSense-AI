import React, { useEffect, useState } from 'react';
import { Truck, Search, RefreshCw, Star, Clock, ShieldCheck, ArrowRightLeft, Building2, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function SuppliersPage({ filters }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function loadSuppliers() {
    setLoading(true);
    try {
      const data = await api.getSuppliers();
      setSuppliers(data);
    } catch (err) {
      console.error("Failed to load suppliers", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredSuppliers = suppliers.filter(s =>
    s.supplier_name.toLowerCase().includes(search.toLowerCase()) ||
    s.supplier_id.toLowerCase().includes(search.toLowerCase()) ||
    s.product_id.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase())
  );

  function toggleSupplierSelection(s) {
    if (selectedSuppliers.some(item => item.id === s.id)) {
      setSelectedSuppliers(selectedSuppliers.filter(item => item.id !== s.id));
    } else {
      if (selectedSuppliers.length < 2) {
        setSelectedSuppliers([...selectedSuppliers, s]);
      } else {
        setSelectedSuppliers([selectedSuppliers[1], s]);
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Building2 className="w-5 h-5" />
            </div>
            <span>Supplier & Vendor Procurement Intelligence</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Vendor reliability score, lead time benchmarks, minimum order quantities, and unit cost comparison.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedSuppliers.length === 2 && (
            <button
              onClick={() => setCompareModalOpen(true)}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm transition-all"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Compare Selected (2)</span>
            </button>
          )}
          <button
            onClick={loadSuppliers}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-lg border border-slate-200 transition-all shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Suppliers</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Supplier Name, Product ID, or City..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-medium"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Tip: Select any 2 suppliers to compare unit costs, lead times, and reliability ratings side-by-side.
        </span>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2 font-medium">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
            <span>Loading supplier database...</span>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">
            No suppliers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 text-center">Select</th>
                  <th className="px-4 py-3">Supplier ID</th>
                  <th className="px-4 py-3">Supplier Name</th>
                  <th className="px-4 py-3">Product ID</th>
                  <th className="px-4 py-3">Unit Cost</th>
                  <th className="px-4 py-3">Lead Time</th>
                  <th className="px-4 py-3">Min Order Qty</th>
                  <th className="px-4 py-3">Available Stock</th>
                  <th className="px-4 py-3">Reliability Score</th>
                  <th className="px-4 py-3">City</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuppliers.map((s) => {
                  const isSelected = selectedSuppliers.some(item => item.id === s.id);
                  const reliabilityPct = Math.round((s.reliability_score || 0.9) * 100);

                  return (
                    <tr key={s.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-amber-50/60' : ''}`}>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSupplierSelection(s)}
                          className="rounded border-slate-300 text-amber-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-blue-700 font-bold">{s.supplier_id}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{s.supplier_name}</td>
                      <td className="px-4 py-3 font-mono text-slate-600 font-medium">{s.product_id}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">${s.unit_cost?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-700 font-medium">{s.lead_time_days} days</td>
                      <td className="px-4 py-3 text-slate-500 font-medium">{s.minimum_order_qty} units</td>
                      <td className="px-4 py-3 text-slate-700 font-medium">{s.available_quantity?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 w-fit ${
                          reliabilityPct >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {reliabilityPct}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-medium">{s.city}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Side-by-side Supplier Comparison Modal */}
      {compareModalOpen && selectedSuppliers.length === 2 && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-amber-600" />
                <span>Supplier Procurement Benchmarking</span>
              </h3>
              <button onClick={() => setCompareModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {selectedSuppliers.map((sup, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                  <div className="border-b border-slate-200 pb-2">
                    <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Option {idx + 1}</span>
                    <h4 className="text-sm font-bold text-slate-900">{sup.supplier_name}</h4>
                    <span className="text-xs font-mono text-blue-700 font-semibold">{sup.supplier_id}</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Unit Cost:</span>
                      <span className="font-bold text-emerald-700">${sup.unit_cost?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Lead Time:</span>
                      <span className="font-semibold text-slate-900">{sup.lead_time_days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Min Order Qty:</span>
                      <span className="text-slate-700 font-medium">{sup.minimum_order_qty} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Reliability:</span>
                      <span className="font-bold text-amber-700">{(sup.reliability_score * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Location:</span>
                      <span className="text-slate-700 font-medium">{sup.city}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-700">
              <span className="font-bold text-amber-700">Procurement Agent Recommendation: </span>
              {selectedSuppliers[0].unit_cost < selectedSuppliers[1].unit_cost
                ? `${selectedSuppliers[0].supplier_name} offers a lower unit cost ($${selectedSuppliers[0].unit_cost?.toFixed(2)} vs $${selectedSuppliers[1].unit_cost?.toFixed(2)}).`
                : `${selectedSuppliers[1].supplier_name} offers a lower unit cost ($${selectedSuppliers[1].unit_cost?.toFixed(2)} vs $${selectedSuppliers[0].unit_cost?.toFixed(2)}).`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
