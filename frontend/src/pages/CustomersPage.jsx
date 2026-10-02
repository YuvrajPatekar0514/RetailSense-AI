import React, { useEffect, useState } from 'react';
import { Users, Search, RefreshCw, Award, Sparkles, X, CheckCircle2, ChevronRight, ShoppingBag } from 'lucide-react';
import { api } from '../services/api';

export default function CustomersPage({ filters }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [loyaltyFilter, setLoyaltyFilter] = useState('all');
  
  // Recommendations Modal State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, [loyaltyFilter]);

  async function loadCustomers() {
    setLoading(true);
    try {
      const data = await api.getCustomers(loyaltyFilter !== 'all' ? loyaltyFilter : null);
      setCustomers(data);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers = customers.filter(c => 
    c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    c.customer_id.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  async function handleOpenRecommendations(cust) {
    setSelectedCustomer(cust);
    setRecommendations(null);
    setLoadingRecs(true);
    try {
      const recs = await api.getCustomerRecommendations(cust.customer_id, 5);
      setRecommendations(recs);
    } catch (err) {
      console.error("Failed to get recommendations", err);
    } finally {
      setLoadingRecs(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Users className="w-5 h-5" />
            </div>
            <span>Customer Intelligence & Personalization</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Segment directory, loyalty ranks, age profiles, and generative AI product recommendations.
          </p>
        </div>
        <button
          onClick={loadCustomers}
          className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-lg border border-slate-200 transition-all self-start sm:self-auto shrink-0 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Customers</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Customer Name, ID, or City..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-medium"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Ranks' },
            { id: 'VIP', label: 'VIP' },
            { id: 'Gold', label: 'Gold' },
            { id: 'Silver', label: 'Silver' },
            { id: 'Bronze', label: 'Bronze' },
          ].map(lvl => (
            <button
              key={lvl.id}
              onClick={() => setLoyaltyFilter(lvl.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${
                loyaltyFilter === lvl.id
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2 font-medium">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Loading customer directory...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">
            No customers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Customer ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Loyalty Rank</th>
                  <th className="px-4 py-3">Preferred Category</th>
                  <th className="px-4 py-3">Age Group</th>
                  <th className="px-4 py-3">Budget Range</th>
                  <th className="px-4 py-3 text-right">AI Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((c) => {
                  const isVip = c.loyalty_level === 'VIP';
                  const isGold = c.loyalty_level === 'Gold';

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono text-blue-700 font-bold">{c.customer_id}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{c.customer_name}</td>
                      <td className="px-4 py-3 text-slate-700 font-medium">{c.city}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 w-fit ${
                          isVip ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          isGold ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          <Award className="w-3 h-3" />
                          {c.loyalty_level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">{c.preferred_category}</td>
                      <td className="px-4 py-3 text-slate-500">{c.age_group}</td>
                      <td className="px-4 py-3 font-mono text-slate-700 font-medium">{c.budget_range}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleOpenRecommendations(c)}
                          className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ml-auto shadow-2xs"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          <span>AI Recommendations</span>
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

      {/* AI Recommendations Modal Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Generative AI Recommendations</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Targeted for {selectedCustomer.customer_name} ({selectedCustomer.customer_id})</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex justify-between text-xs">
                <div>
                  <span className="text-slate-500 block font-medium">Preferred Category</span>
                  <span className="font-bold text-slate-900">{selectedCustomer.preferred_category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">Loyalty Rank</span>
                  <span className="font-bold text-indigo-700">{selectedCustomer.loyalty_level}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">Budget Segment</span>
                  <span className="font-bold text-emerald-700">{selectedCustomer.budget_range}</span>
                </div>
              </div>

              {loadingRecs ? (
                <div className="py-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2 font-medium">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Computing customer personalization vectors...</span>
                </div>
              ) : recommendations?.recommended_products ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Top Recommended Products</h4>
                  {recommendations.recommended_products.map((rec, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between gap-3 shadow-2xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{rec.product_name || rec.product_id}</span>
                          <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                            {rec.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium">{rec.recommendation_reason || rec.reason}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-bold text-emerald-700">${rec.selling_price || '99.99'}</div>
                        <span className="text-[10px] text-slate-500 font-medium">Match: {(rec.match_score || 0.94 * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-4 text-center font-medium">
                  No recommendations generated for this customer profile.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-200 shadow-2xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
