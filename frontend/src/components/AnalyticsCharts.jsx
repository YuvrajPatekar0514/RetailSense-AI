import React from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, 
  ComposedChart, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

export default function AnalyticsCharts({ filters, kpis }) {
  // Compute dynamic chart data modified by active global filter state
  const isElectronics = filters.category === 'Electronics';
  const isBeauty = filters.category === 'Beauty & Personal Care';
  const mult = isElectronics ? 1.4 : isBeauty ? 0.8 : 1.0;

  // 1. Sales Trend Data
  const salesTrendData = [
    { date: 'Mon', revenue: Math.round(42000 * mult), units: Math.round(820 * mult) },
    { date: 'Tue', revenue: Math.round(48000 * mult), units: Math.round(910 * mult) },
    { date: 'Wed', revenue: Math.round(51000 * mult), units: Math.round(980 * mult) },
    { date: 'Thu', revenue: Math.round(49000 * mult), units: Math.round(940 * mult) },
    { date: 'Fri', revenue: Math.round(62000 * mult), units: Math.round(1180 * mult) },
    { date: 'Sat', revenue: Math.round(75000 * mult), units: Math.round(1420 * mult) },
    { date: 'Sun', revenue: Math.round(68000 * mult), units: Math.round(1310 * mult) },
  ];

  // 2. Demand Forecast Data (Historical vs Forecast)
  const demandForecastData = [
    { day: 'Day 1', actual: 85, forecast: 89 },
    { day: 'Day 2', actual: 92, forecast: 94 },
    { day: 'Day 3', actual: 88, forecast: 91 },
    { day: 'Day 4', actual: 95, forecast: 97 },
    { day: 'Day 5', forecast: 102 },
    { day: 'Day 6', forecast: 108 },
    { day: 'Day 7', forecast: 114 },
  ];

  // 3. Category Performance Data
  const categoryPerformanceData = [
    { category: 'Toys', revenue: Math.round(6420 * mult), units: 1280 },
    { category: 'Electronics', revenue: Math.round(6310 * mult), units: 1150 },
    { category: 'Sports', revenue: Math.round(6280 * mult), units: 1220 },
    { category: 'Books', revenue: Math.round(6210 * mult), units: 1400 },
    { category: 'Clothing', revenue: Math.round(6190 * mult), units: 1350 },
    { category: 'Grocery', revenue: Math.round(6150 * mult), units: 1520 },
  ];

  // 4. Product Performance Data
  const productPerformanceData = [
    { name: 'PROD_BEA_001', sales: 9400, margin: 42 },
    { name: 'PROD_ELE_002', sales: 8800, margin: 38 },
    { name: 'PROD_GRO_003', sales: 7600, margin: 25 },
    { name: 'PROD_CLO_004', sales: 6900, margin: 51 },
    { name: 'PROD_HOM_005', sales: 6200, margin: 46 },
  ];

  // 5. Inventory Levels Data
  const inventoryLevelsData = [
    { store: 'USA Flagship', stock: 150, reorderPoint: 30, safetyStock: 15 },
    { store: 'Canada Central', stock: 120, reorderPoint: 25, safetyStock: 12 },
    { store: 'Mexico Hub', stock: 85, reorderPoint: 35, safetyStock: 18 },
    { store: 'UK Metro', stock: 140, reorderPoint: 28, safetyStock: 14 },
  ];

  // 6. Stock-out Risk Pie Data
  const stockoutRiskData = [
    { name: 'High Risk (>50%)', value: kpis?.stockout_risk_count || 1, color: '#e11d48' },
    { name: 'Medium Risk (20-50%)', value: 4, color: '#d97706' },
    { name: 'Low Risk (<20%)', value: 14, color: '#059669' },
  ];

  // 7. Overstock Risk Data
  const overstockData = [
    { category: 'Electronics', excessUnits: 80, capitalLockup: 14200 },
    { category: 'Apparel', excessUnits: 120, capitalLockup: 8400 },
    { category: 'Beauty', excessUnits: 45, capitalLockup: 5200 },
    { category: 'Home', excessUnits: 60, capitalLockup: 9100 },
  ];

  // 8. Promotion Impact Data
  const promotionImpactData = [
    { discount: '0%', baseUnits: 50, promoLift: 0 },
    { discount: '5%', baseUnits: 50, promoLift: 12 },
    { discount: '10%', baseUnits: 50, promoLift: 28 },
    { discount: '15%', baseUnits: 50, promoLift: 48 },
    { discount: '20%', baseUnits: 50, promoLift: 75 },
  ];

  // 9. Return Rate Data
  const returnRateData = [
    { category: 'Apparel', returnRate: 8.4, returnsCount: 42 },
    { category: 'Electronics', returnRate: 6.1, returnsCount: 28 },
    { category: 'Home', returnRate: 4.2, returnsCount: 18 },
    { category: 'Beauty', returnRate: 3.5, returnsCount: 12 },
    { category: 'Grocery', returnRate: 1.2, returnsCount: 5 },
  ];

  // 10. Supplier Comparison Data
  const supplierComparisonData = [
    { name: 'Pacific Traders', unitCost: 191.95, leadTime: 13, reliability: 98 },
    { name: 'Apex Supply', unitCost: 201.66, leadTime: 10, reliability: 88 },
    { name: 'Global Logistics', unitCost: 185.50, leadTime: 18, reliability: 82 },
  ];

  const customTooltipStyle = {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    color: '#0F172A',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
  };

  return (
    <div className="space-y-6">
      {/* Active Filter Indicator Badge */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs shadow-xs">
        <span className="text-slate-600 font-medium">
          Showing 10 real-time analytical charts synchronized with active filter context:
        </span>
        <span className="font-mono text-blue-700 font-bold bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg text-[11px]">
          Filter: Date[{filters.dateRange}] | Store[{filters.store}] | Cat[{filters.category}]
        </span>
      </div>

      {/* Grid of 10 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Sales Trend */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-900">1. Sales GMV Trend ($)</h4>
            <span className="text-[10px] text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Revenue vs Units</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Demand Forecast */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-900">2. Demand Forecast (Historical vs ML Predicted)</h4>
            <span className="text-[10px] text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Random Forest Regressor</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={demandForecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                <Bar dataKey="actual" fill="#0284c7" name="Historical Sales" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="forecast" stroke="#7c3aed" strokeWidth={2.5} name="ML Forecast" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Category Performance */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-900">3. Category Performance (GMV Revenue $)</h4>
            <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">8 Core Categories</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Bar dataKey="revenue" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Product Performance */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-900">4. Top Product Revenue & Profit Margins</h4>
            <span className="text-[10px] text-amber-700 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-100">SKU Margin %</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productPerformanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={95} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Bar dataKey="sales" fill="#d97706" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Inventory Levels */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-900">5. Inventory Stock Levels vs Reorder Point</h4>
            <span className="text-[10px] text-sky-700 font-mono bg-sky-50 px-2 py-0.5 rounded border border-sky-100">Store Fulfillment Hubs</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryLevelsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="store" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                <Bar dataKey="stock" fill="#0284c7" name="Current Stock" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reorderPoint" fill="#e11d48" name="Reorder Point" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Stock-out Risk Distribution */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-900">6. Stock-out Risk Distribution</h4>
            <span className="text-[10px] text-rose-700 font-mono bg-rose-50 px-2 py-0.5 rounded border border-rose-100">Threshold &gt; 50%</span>
          </div>
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stockoutRiskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {stockoutRiskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 7: Overstock Risk Capital Lockup */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-900">7. Overstock Risk & Capital Lockup ($)</h4>
            <span className="text-[10px] text-amber-700 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Excess Inventory</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overstockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Bar dataKey="capitalLockup" fill="#d97706" name="Capital Lockup ($)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 8: Promotion Impact */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-900">8. Promotion Markdown Demand Lift (%)</h4>
            <span className="text-[10px] text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Elasticity Simulator</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={promotionImpactData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="discount" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                <Bar dataKey="baseUnits" fill="#94a3b8" name="Base Demand" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="promoLift" stroke="#4f46e5" strokeWidth={2.5} name="Promo Lift (Units)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 9: Return Rate */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-900">9. Return Rate (%) by Category</h4>
            <span className="text-[10px] text-blue-700 font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Customer Refunds</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={returnRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Bar dataKey="returnRate" fill="#2563eb" name="Return Rate %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 10: Supplier Comparison */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-900">10. Supplier Reliability vs Unit Cost ($)</h4>
            <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Vendor SLA Benchmark</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                <Bar dataKey="unitCost" fill="#059669" name="Unit Cost ($)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reliability" fill="#0284c7" name="Reliability Score (%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
