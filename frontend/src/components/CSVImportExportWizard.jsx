import React, { useState } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight, 
  Database,
  FileText,
  Sliders,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

const ENTITY_FIELDS = {
  customers: [
    { key: 'customer_id', label: 'Customer ID', required: true },
    { key: 'customer_name', label: 'Customer Name', required: true },
    { key: 'city', label: 'City', required: false },
    { key: 'age_group', label: 'Age Group', required: false },
    { key: 'preferred_category', label: 'Preferred Category', required: false },
    { key: 'budget_range', label: 'Budget Range', required: false },
    { key: 'loyalty_level', label: 'Loyalty Level', required: false }
  ],
  products: [
    { key: 'product_id', label: 'Product ID', required: true },
    { key: 'product_name', label: 'Product Name', required: true },
    { key: 'category', label: 'Category', required: true },
    { key: 'subcategory', label: 'Subcategory', required: false },
    { key: 'brand', label: 'Brand', required: false },
    { key: 'cost_price', label: 'Cost Price ($)', required: false },
    { key: 'selling_price', label: 'Selling Price ($)', required: false }
  ],
  inventory: [
    { key: 'product_id', label: 'Product ID', required: true },
    { key: 'store_id', label: 'Store Location ID', required: true },
    { key: 'current_stock', label: 'Current Stock Qty', required: true },
    { key: 'reorder_point', label: 'Reorder Point', required: false },
    { key: 'lead_time_days', label: 'Lead Time (Days)', required: false },
    { key: 'safety_stock', label: 'Safety Stock', required: false }
  ],
  sales: [
    { key: 'transaction_id', label: 'Transaction ID', required: true },
    { key: 'user_name', label: 'Customer Name', required: false },
    { key: 'country', label: 'Country / Location', required: false },
    { key: 'product_category', label: 'Product Category', required: false },
    { key: 'purchase_amount', label: 'Purchase Amount ($)', required: true },
    { key: 'payment_method', label: 'Payment Method', required: false },
    { key: 'transaction_date', label: 'Date Time', required: false }
  ],
  suppliers: [
    { key: 'supplier_id', label: 'Supplier ID', required: true },
    { key: 'supplier_name', label: 'Supplier Company Name', required: true },
    { key: 'product_id', label: 'Product ID Supplied', required: true },
    { key: 'unit_cost', label: 'Unit Supply Cost ($)', required: true },
    { key: 'lead_time_days', label: 'Lead Time Days', required: false }
  ]
};

export default function CSVImportExportWizard({ initialEntity = 'customers', onImportSuccess }) {
  const [entityType, setEntityType] = useState(initialEntity);
  const [step, setStep] = useState(1); // 1: Upload, 2: Mapping & Preview, 3: Executing, 4: Result Summary
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [rawCSVText, setRawCSVText] = useState('');
  const [columnMapping, setColumnMapping] = useState({});
  const [duplicateStrategy, setDuplicateStrategy] = useState('update'); // skip, update, import_new
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [importResult, setImportResult] = useState(null);

  // Handle Drag & Drop / File Select
  const handleFileChange = async (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setErrorMessage('Invalid file format. Please upload a .csv file.');
      return;
    }
    
    setErrorMessage('');
    setSelectedFile(file);

    // Read raw text for post processing execution
    const text = await file.text();
    setRawCSVText(text);

    // Send to backend preview endpoint
    setLoading(true);
    try {
      const res = await api.previewCSV(file);
      setPreviewData(res);

      // Auto map fields
      const autoMap = {};
      const expected = ENTITY_FIELDS[entityType] || [];
      res.headers.forEach(header => {
        const cleanHeader = header.toLowerCase().replace(/[^a-z0-9_]/g, '');
        const match = expected.find(f => f.key === cleanHeader || cleanHeader.includes(f.key));
        if (match) {
          autoMap[header] = match.key;
        } else {
          autoMap[header] = header; // default fallback
        }
      });
      setColumnMapping(autoMap);
      setStep(2);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to preview CSV file.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteImport = async () => {
    setLoading(true);
    setStep(3);
    setErrorMessage('');

    try {
      const res = await api.executeCSVImport({
        entity_type: entityType,
        column_mapping: columnMapping,
        duplicate_strategy: duplicateStrategy,
        csv_content: rawCSVText
      });

      setImportResult(res);
      setStep(4);
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      setErrorMessage(err.message || 'Import execution failed.');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setSelectedFile(null);
    setPreviewData(null);
    setRawCSVText('');
    setColumnMapping({});
    setImportResult(null);
    setErrorMessage('');
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <span>CSV Data Import & Export Management Center</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Bulk import, field mapping, duplicate reconciliation, and template downloads.
          </p>
        </div>

        {/* Action Controls & Downloads */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => api.downloadCSVTemplate(entityType)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download Sample CSV Template"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Download Sample ({entityType.toUpperCase()})</span>
          </button>

          <button
            onClick={() => api.exportCSVData(entityType)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export Current Database Records to CSV"
          >
            <FileText className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Target Entity Selector */}
      <div className="px-6 py-3 bg-slate-100/60 border-b border-slate-200/60 flex items-center gap-2 overflow-x-auto text-xs font-bold text-slate-600">
        <span className="text-[11px] text-slate-400 uppercase tracking-wider mr-2 shrink-0">Target Entity:</span>
        {['customers', 'products', 'inventory', 'sales', 'suppliers'].map((ent) => (
          <button
            key={ent}
            onClick={() => {
              setEntityType(ent);
              resetWizard();
            }}
            className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
              entityType === ent 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200/80'
            }`}
          >
            {ent}
          </button>
        ))}
      </div>

      {/* Wizard Step Progress Tracker */}
      <div className="px-6 py-3 border-b border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-500">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600 font-bold' : ''}`}>
          <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
          <span>Upload CSV</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600 font-bold' : ''}`}>
          <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
          <span>Column Mapping & Preview</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600 font-bold' : ''}`}>
          <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
          <span>Database Import</span>
        </div>
      </div>

      {/* Step Content Area */}
      <div className="p-6">
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: UPLOAD CSV */}
        {step === 1 && (
          <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-10 text-center transition-colors bg-slate-50/50 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4 shadow-xs">
              <Upload className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-900">Drag and drop your CSV file here</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Supports standard UTF-8 or Latin-1 .csv files up to 50MB for bulk entity processing.
            </p>

            <label className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Browse CSV File</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* STEP 2: MAPPING & PREVIEW */}
        {step === 2 && previewData && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-50/60 border border-blue-200/80 p-4 rounded-xl">
              <div>
                <p className="text-xs font-extrabold text-blue-900">
                  File Loaded: {previewData.filename} ({previewData.total_rows} total rows detected)
                </p>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Verify header mapping and duplicate handling rules below before executing import.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-700">Duplicate Strategy:</label>
                <select
                  value={duplicateStrategy}
                  onChange={(e) => setDuplicateStrategy(e.target.value)}
                  className="bg-white border border-slate-200 text-xs font-bold text-slate-800 rounded-lg px-3 py-1.5 focus:outline-none shadow-2xs cursor-pointer"
                >
                  <option value="update">Update Existing Records (Idempotent)</option>
                  <option value="skip">Skip Existing Records</option>
                  <option value="import_new">Import All as New Records</option>
                </select>
              </div>
            </div>

            {/* Field Mapping Section */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Column Field Mapping ({previewData.headers.length} CSV Headers)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {previewData.headers.map((hdr) => (
                  <div key={hdr} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="text-[11px] font-bold text-slate-600 truncate" title={hdr}>
                      CSV Header: <span className="text-slate-900">{hdr}</span>
                    </div>
                    <select
                      value={columnMapping[hdr] || hdr}
                      onChange={(e) => setColumnMapping({ ...columnMapping, [hdr]: e.target.value })}
                      className="w-full bg-white border border-slate-200 text-xs font-semibold text-slate-800 rounded px-2 py-1 focus:outline-none"
                    >
                      <option value={hdr}>Map to: {hdr}</option>
                      {(ENTITY_FIELDS[entityType] || []).map((f) => (
                        <option key={f.key} value={f.key}>
                          Map to: {f.label} ({f.key})
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Preview Table (First 20 rows) */}
            <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-extrabold text-xs text-slate-700 flex justify-between items-center">
                <span>CSV Data Sample Preview (First 20 Rows)</span>
                <span className="text-[10px] text-slate-500 font-normal">Showing {previewData.sample_rows.length} preview rows</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100/70 border-b border-slate-200 font-bold text-slate-600">
                    <tr>
                      {previewData.headers.map((h) => (
                        <th key={h} className="p-3 border-r border-slate-200/60 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.sample_rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        {previewData.headers.map((h) => (
                          <td key={h} className="p-3 border-r border-slate-100 font-mono text-[11px] whitespace-nowrap">
                            {row[h] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Step Controls */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={resetWizard}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel / Choose Another File
              </button>

              <button
                onClick={handleExecuteImport}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                <span>Execute Bulk Import</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: EXECUTING */}
        {step === 3 && (
          <div className="py-12 text-center space-y-4">
            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
            <h4 className="text-base font-extrabold text-slate-900">Importing CSV Data into Database...</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Parsing records, applying ORM validation, updating database state, and indexing records.
            </p>
          </div>
        )}

        {/* STEP 4: IMPORT RESULT SUMMARY REPORT */}
        {step === 4 && importResult && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-extrabold text-emerald-900">Bulk CSV Import Completed Successfully</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Processed {importResult.total_rows} rows for <span className="font-extrabold uppercase">{importResult.entity_type}</span> at {importResult.timestamp}.
                </p>
              </div>
            </div>

            {/* Import Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Newly Imported</span>
                <p className="text-xl font-extrabold text-emerald-600 mt-1">{importResult.imported}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Updated Existing</span>
                <p className="text-xl font-extrabold text-blue-600 mt-1">{importResult.updated}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Skipped Duplicates</span>
                <p className="text-xl font-extrabold text-amber-600 mt-1">{importResult.skipped}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Failed Validation</span>
                <p className="text-xl font-extrabold text-red-600 mt-1">{importResult.failed}</p>
              </div>
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
                <p className="font-bold text-red-900">Row Validation Errors:</p>
                {importResult.errors.map((err, idx) => (
                  <p key={idx} className="font-mono text-[11px]">• {err}</p>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={resetWizard}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                Import Another File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
