import React, { useEffect, useState } from 'react';
import { Tag, Search, RefreshCw, DollarSign, ShieldAlert, CheckCircle, Percent } from 'lucide-react';
import { api } from '../services/api';

export default function ProductsPage({ filters }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'Beauty & Personal Care', name: 'Beauty & Personal Care' },
    { id: 'Electronics', name: 'Electronics' },
    { id: 'Grocery', name: 'Grocery' },
    { id: 'Apparel', name: 'Apparel' },
    { id: 'Home & Kitchen', name: 'Home & Kitchen' },
  ];

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await api.getProducts(selectedCategory !== 'all' ? selectedCategory : null);
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter(p => 
    p.product_name.toLowerCase().includes(search.toLowerCase()) ||
    p.product_id.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
              <Tag className="w-5 h-5" />
            </div>
            <span>Product Catalog & Pricing Management</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Catalog inventory items, margins, warranty policies, and category classifications.
          </p>
        </div>
        <button
          onClick={loadProducts}
          className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-200 transition-all self-start sm:self-auto shrink-0 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Catalog</span>
        </button>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search product name, ID, or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-medium"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2 font-medium">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading product catalog...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">
            No products found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Product ID</th>
                  <th className="px-4 py-3">Name & Description</th>
                  <th className="px-4 py-3">Category / Sub</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Cost Price</th>
                  <th className="px-4 py-3">Selling Price</th>
                  <th className="px-4 py-3">Profit Margin</th>
                  <th className="px-4 py-3">Warranty</th>
                  <th className="px-4 py-3">Returnable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const margin = p.selling_price > 0 ? (((p.selling_price - p.cost_price) / p.selling_price) * 100).toFixed(1) : 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono text-blue-700 font-bold">{p.product_id}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{p.product_name}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{p.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] text-slate-700 font-semibold">
                          {p.category}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">{p.subcategory}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">{p.brand}</td>
                      <td className="px-4 py-3 text-slate-500">${p.cost_price?.toFixed(2)}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">${p.selling_price?.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold flex items-center gap-0.5 w-fit">
                          <Percent className="w-3 h-3" />
                          {margin}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">{p.warranty_days} days</td>
                      <td className="px-4 py-3">
                        {p.returnable ? (
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3" /> Yes
                          </span>
                        ) : (
                          <span className="text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-medium">No</span>
                        )}
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
