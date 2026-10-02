import React from 'react';
import { BarChart3, ShieldCheck, Download, Award, CheckCircle2, FileSpreadsheet, TrendingUp, AlertTriangle } from 'lucide-react';

export default function ReportsPage({ filters }) {
  const modelBenchmarks = [
    { name: 'Random Forest Regressor (Selected Best)', mae: '2.2501', rmse: '3.1245', r2: '0.8841', status: 'DEPLOYED IN PRODUCTION' },
    { name: 'XGBoost Regressor', mae: '2.4180', rmse: '3.3891', r2: '0.8520', status: 'BENCHMARKED' },
    { name: 'Linear Regression (Baseline)', mae: '4.8920', rmse: '6.1204', r2: '0.5102', status: 'BASELINE' },
  ];

  const dataQualityStats = [
    { metric: 'Missing Value Rate', value: '0.00%', status: 'PASSED', color: 'emerald' },
    { metric: 'Duplicate Row Rate', value: '0.00%', status: 'PASSED', color: 'emerald' },
    { metric: 'Target Leakage Compliance', value: 'Strict Time-Aware Split', status: 'PASSED', color: 'emerald' },
    { metric: 'Feature Dimension', value: '24 Engineered Features', status: 'OPTIMAL', color: 'blue' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span>Analytical Reports & ML Benchmarks</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Model performance evaluations, data quality metrics, and business intelligence reports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-200 transition-all shadow-xs">
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export PDF Report</span>
          </button>
          <button className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-3.5 py-2 rounded-lg border border-blue-200 transition-all shadow-xs">
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            <span>Export CSV Metrics</span>
          </button>
        </div>
      </div>

      {/* Data Quality Report Summary */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Data Quality & Preprocessing Report</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dataQualityStats.map((st, i) => (
            <div key={i} className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-1 shadow-sm">
              <span className="text-xs font-semibold text-slate-500">{st.metric}</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">{st.value}</div>
              <span className={`text-[10px] font-bold ${
                st.color === 'emerald' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-blue-700 bg-blue-50 border-blue-200'
              } border px-2 py-0.5 rounded flex items-center gap-1 w-fit mt-1.5`}>
                <CheckCircle2 className="w-3 h-3" /> {st.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Machine Learning Model Benchmark Comparison */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Demand Forecasting Model Evaluation Benchmark</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Evaluated on 15% out-of-time holdout validation dataset</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg w-fit">
            Empirical Metric Verification Passed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Model Architecture</th>
                <th className="px-4 py-3">MAE (Mean Abs Error)</th>
                <th className="px-4 py-3">RMSE (Root Mean Sq Error)</th>
                <th className="px-4 py-3">R² Score</th>
                <th className="px-4 py-3 text-right">Deployment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {modelBenchmarks.map((bm, i) => (
                <tr key={i} className={`hover:bg-slate-50/80 transition-colors ${i === 0 ? 'bg-blue-50/40' : ''}`}>
                  <td className="px-4 py-3 font-bold text-slate-900">{bm.name}</td>
                  <td className="px-4 py-3 font-mono text-blue-700 font-bold">{bm.mae} units</td>
                  <td className="px-4 py-3 font-mono text-slate-600 font-medium">{bm.rmse}</td>
                  <td className="px-4 py-3 font-mono text-indigo-700 font-bold">{bm.r2}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      i === 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {bm.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
