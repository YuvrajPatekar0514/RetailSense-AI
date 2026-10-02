import React, { useState } from 'react';
import { Database, Search, FileText, Sparkles, BookOpen, Layers, CheckCircle } from 'lucide-react';

export default function KnowledgeBasePage({ filters }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const sampleDocs = [
    { title: 'Standard Retail Return & Refund Policy 2026', category: 'Customer Care', chunks: 14, vector: 'ChromaDB' },
    { title: 'Supplier Procurement SLA & Lead-Time Rules', category: 'Logistics', chunks: 22, vector: 'ChromaDB' },
    { title: 'Dynamic Pricing Elasticity & Margin Bounds', category: 'Pricing', chunks: 18, vector: 'ChromaDB' },
    { title: 'Store Stockout Prevention & Safety Stock SOP', category: 'Inventory', chunks: 12, vector: 'ChromaDB' },
  ];

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setTimeout(() => {
      setResults([
        {
          chunk_id: 'DOC_RET_001_CHUNK_3',
          doc_title: 'Standard Retail Return & Refund Policy 2026',
          distance: 0.142,
          content: 'Customers are eligible for a 100% full refund on Beauty and Electronics items within 30 days of delivery, provided the item is unopened or defective upon arrival with valid order ID.',
          metadata: { category: 'Customer Care', section: 'Eligibility' }
        },
        {
          chunk_id: 'DOC_SUP_002_CHUNK_7',
          doc_title: 'Supplier Procurement SLA & Lead-Time Rules',
          distance: 0.289,
          content: 'If supplier lead time exceeds 14 business days, the Procurement Agent is authorized to split purchase orders across alternate local vendors with a minimum reliability score of 85%.',
          metadata: { category: 'Logistics', section: 'Failover Protocol' }
        }
      ]);
      setSearching(false);
    }, 600);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <span>RAG Knowledge Base & Policy Vector Store</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Semantic document retrieval for agents using ChromaDB vector embeddings and chunked policy guidelines.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs text-slate-700 font-semibold shadow-xs">
          <Database className="w-4 h-4 text-blue-600" />
          <span>Vector Store: <strong className="text-blue-700">ChromaDB Online</strong></span>
        </div>
      </div>

      {/* RAG Semantic Query Search Bar */}
      <form onSubmit={handleSearch} className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-3 shadow-sm">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Semantic Vector Search Simulator</span>
        </h3>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="e.g. What is the return policy for defective electronics items?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
          >
            {searching ? 'Querying Embeddings...' : 'Search Vector Store'}
          </button>
        </div>
      </form>

      {/* Query Results */}
      {results && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Top Semantic Chunks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((r, i) => (
              <div key={i} className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{r.doc_title}</span>
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
                    Distance: {r.distance}
                  </span>
                </div>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed font-sans shadow-2xs">
                  "{r.content}"
                </p>
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>Chunk: <strong className="text-slate-800 font-mono">{r.chunk_id}</strong></span>
                  <span>Category: <strong className="text-slate-800">{r.metadata.category}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indexed Document Library */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Indexed Policy Documents</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sampleDocs.map((doc, idx) => (
            <div key={idx} className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3 hover:border-slate-300 transition-all shadow-sm">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 w-fit">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{doc.title}</h4>
                <span className="text-[11px] text-slate-500 font-medium">{doc.category}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-medium">
                <span>{doc.chunks} Embeddings</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" /> Indexed
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
