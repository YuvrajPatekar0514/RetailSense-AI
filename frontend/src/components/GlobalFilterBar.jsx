import React from 'react';
import { Filter, Calendar, MapPin, Store, Tag, AlertTriangle, UserCheck, Package, ShoppingBag, Truck, TrendingUp, RotateCcw } from 'lucide-react';

export default function GlobalFilterBar({ filters, setFilters }) {
  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      dateRange: 'all',
      city: 'all',
      store: 'all',
      category: 'all',
      subcategory: 'all',
      product: 'all',
      supplier: 'all',
      riskLevel: 'all',
      demandLevel: 'all'
    });
  };

  return (
    <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center gap-2.5 overflow-x-auto text-xs shrink-0 shadow-xs">
      <div className="flex items-center gap-1.5 font-semibold text-slate-500 pr-2 border-r border-slate-200 shrink-0">
        <Filter className="w-3.5 h-3.5 text-blue-600" />
        <span>Global Filters</span>
      </div>

      {/* 1. Date Range */}
      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1 shrink-0 hover:bg-slate-100/70 transition-colors">
        <Calendar className="w-3 h-3 text-slate-400" />
        <select 
          value={filters.dateRange || 'all'}
          onChange={(e) => handleChange('dateRange', e.target.value)}
          className="bg-transparent text-slate-800 focus:outline-none cursor-pointer text-[11px] font-medium"
        >
          <option value="all" className="bg-white text-slate-900">Date: All Time</option>
          <option value="7d" className="bg-white text-slate-900">Date: Last 7 Days</option>
          <option value="30d" className="bg-white text-slate-900">Date: Last 30 Days</option>
          <option value="ytd" className="bg-white text-slate-900">Date: Year to Date</option>
        </select>
      </div>

      {/* 2. City */}
      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1 shrink-0 hover:bg-slate-100/70 transition-colors">
        <MapPin className="w-3 h-3 text-slate-400" />
        <select
          value={filters.city || 'all'}
          onChange={(e) => handleChange('city', e.target.value)}
          className="bg-transparent text-slate-800 focus:outline-none cursor-pointer text-[11px] font-medium"
        >
          <option value="all" className="bg-white text-slate-900">City: All Cities</option>
          <option value="New York" className="bg-white text-slate-900">New York</option>
          <option value="Berlin" className="bg-white text-slate-900">Berlin</option>
          <option value="Toronto" className="bg-white text-slate-900">Toronto</option>
          <option value="London" className="bg-white text-slate-900">London</option>
          <option value="Tokyo" className="bg-white text-slate-900">Tokyo</option>
        </select>
      </div>

      {/* 3. Store */}
      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1 shrink-0 hover:bg-slate-100/70 transition-colors">
        <Store className="w-3 h-3 text-slate-400" />
        <select
          value={filters.store || 'all'}
          onChange={(e) => handleChange('store', e.target.value)}
          className="bg-transparent text-slate-800 focus:outline-none cursor-pointer text-[11px] font-medium"
        >
          <option value="all" className="bg-white text-slate-900">Store: All Stores</option>
          <option value="STORE_USA" className="bg-white text-slate-900">STORE_USA (USA Flagship)</option>
          <option value="STORE_CAN" className="bg-white text-slate-900">STORE_CAN (Canada Central)</option>
          <option value="STORE_MEX" className="bg-white text-slate-900">STORE_MEX (Mexico Hub)</option>
          <option value="STORE_GBR" className="bg-white text-slate-900">STORE_GBR (UK Metro)</option>
        </select>
      </div>

      {/* 4. Category */}
      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1 shrink-0 hover:bg-slate-100/70 transition-colors">
        <Tag className="w-3 h-3 text-slate-400" />
        <select
          value={filters.category || 'all'}
          onChange={(e) => handleChange('category', e.target.value)}
          className="bg-transparent text-slate-800 focus:outline-none cursor-pointer text-[11px] font-medium"
        >
          <option value="all" className="bg-white text-slate-900">Cat: All Categories</option>
          <option value="Beauty & Personal Care" className="bg-white text-slate-900">Beauty & Personal Care</option>
          <option value="Electronics" className="bg-white text-slate-900">Electronics</option>
          <option value="Grocery" className="bg-white text-slate-900">Grocery</option>
          <option value="Apparel" className="bg-white text-slate-900">Apparel & Fashion</option>
          <option value="Home & Kitchen" className="bg-white text-slate-900">Home & Kitchen</option>
        </select>
      </div>

      {/* 5. Subcategory */}
      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1 shrink-0 hover:bg-slate-100/70 transition-colors">
        <Package className="w-3 h-3 text-slate-400" />
        <select
          value={filters.subcategory || 'all'}
          onChange={(e) => handleChange('subcategory', e.target.value)}
          className="bg-transparent text-slate-800 focus:outline-none cursor-pointer text-[11px] font-medium"
        >
          <option value="all" className="bg-white text-slate-900">Subcat: All Subcategories</option>
          <option value="Skincare" className="bg-white text-slate-900">Skincare</option>
          <option value="Smartphones" className="bg-white text-slate-900">Smartphones</option>
          <option value="Organic" className="bg-white text-slate-900">Organic</option>
          <option value="Men's Wear" className="bg-white text-slate-900">Men's Wear</option>
          <option value="Cookware" className="bg-white text-slate-900">Cookware</option>
        </select>
      </div>

      {/* 6. Product */}
      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1 shrink-0 hover:bg-slate-100/70 transition-colors">
        <ShoppingBag className="w-3 h-3 text-slate-400" />
        <select
          value={filters.product || 'all'}
          onChange={(e) => handleChange('product', e.target.value)}
          className="bg-transparent text-slate-800 focus:outline-none cursor-pointer text-[11px] font-medium"
        >
          <option value="all" className="bg-white text-slate-900">SKU: All Products</option>
          <option value="PROD_BEA_001" className="bg-white text-slate-900">PROD_BEA_001</option>
          <option value="PROD_ELE_002" className="bg-white text-slate-900">PROD_ELE_002</option>
          <option value="PROD_GRO_003" className="bg-white text-slate-900">PROD_GRO_003</option>
          <option value="PROD_CLO_004" className="bg-white text-slate-900">PROD_CLO_004</option>
          <option value="PROD_HOM_005" className="bg-white text-slate-900">PROD_HOM_005</option>
        </select>
      </div>

      {/* 7. Supplier */}
      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1 shrink-0 hover:bg-slate-100/70 transition-colors">
        <Truck className="w-3 h-3 text-slate-400" />
        <select
          value={filters.supplier || 'all'}
          onChange={(e) => handleChange('supplier', e.target.value)}
          className="bg-transparent text-slate-800 focus:outline-none cursor-pointer text-[11px] font-medium"
        >
          <option value="all" className="bg-white text-slate-900">Vendor: All Suppliers</option>
          <option value="SUP_001" className="bg-white text-slate-900">SUP_001 (Pacific Traders)</option>
          <option value="SUP_002" className="bg-white text-slate-900">SUP_002 (Apex Supply)</option>
          <option value="SUP_003" className="bg-white text-slate-900">SUP_003 (Global Logistics)</option>
        </select>
      </div>

      {/* 8. Risk Level */}
      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1 shrink-0 hover:bg-slate-100/70 transition-colors">
        <AlertTriangle className="w-3 h-3 text-slate-400" />
        <select
          value={filters.riskLevel || 'all'}
          onChange={(e) => handleChange('riskLevel', e.target.value)}
          className="bg-transparent text-slate-800 focus:outline-none cursor-pointer text-[11px] font-medium"
        >
          <option value="all" className="bg-white text-slate-900">Risk: All Risk Levels</option>
          <option value="high_stockout" className="bg-white text-slate-900">Stockout Risk (&gt;50%)</option>
          <option value="high_overstock" className="bg-white text-slate-900">Overstock Risk (&gt;50%)</option>
          <option value="healthy" className="bg-white text-slate-900">Healthy Risk</option>
        </select>
      </div>

      {/* 9. Demand Level */}
      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1 shrink-0 hover:bg-slate-100/70 transition-colors">
        <TrendingUp className="w-3 h-3 text-slate-400" />
        <select
          value={filters.demandLevel || 'all'}
          onChange={(e) => handleChange('demandLevel', e.target.value)}
          className="bg-transparent text-slate-800 focus:outline-none cursor-pointer text-[11px] font-medium"
        >
          <option value="all" className="bg-white text-slate-900">Demand: All Volumes</option>
          <option value="high" className="bg-white text-slate-900">High Demand (&gt;100 u/d)</option>
          <option value="normal" className="bg-white text-slate-900">Normal Demand (20-100 u/d)</option>
          <option value="low" className="bg-white text-slate-900">Low Demand (&lt;20 u/d)</option>
        </select>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-semibold border border-blue-200 px-2.5 py-1 rounded-lg bg-blue-50/80 hover:bg-blue-100 transition-all shrink-0 ml-auto"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Reset All</span>
      </button>
    </div>
  );
}
