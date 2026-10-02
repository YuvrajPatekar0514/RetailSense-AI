import React, { useState } from 'react';
import { Bot, Send, Sparkles, CheckCircle2, ShieldAlert, FileText, Database, ArrowRight, RefreshCw, BarChart2, ShieldCheck, UserCheck, Layers, HelpCircle } from 'lucide-react';
import { api } from '../services/api';

const SAMPLE_NATURAL_GOALS = [
  "Which products may go out of stock next week?",
  "Optimize my electronics inventory.",
  "Why are sales falling for Product P001?",
  "Which supplier should I consider for Product P002?",
  "Recommend products for customer C001.",
  "Can this order be returned?",
  "Summarize my business performance."
];

export default function AIAssistantPage({ userRole }) {
  const [inputGoal, setInputGoal] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Welcome to RetailSense AI! I am your autonomous multi-agent operational assistant. Type a goal or click any sample question below to orchestrate our specialized agents.',
      sources: [
        { title: 'Orchestrator Architecture SLA', category: 'System', content: 'All requests route through Orchestrator to specialized Demand, Inventory, Procurement, Pricing, Personalization, Support, and Returns agents.' }
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [activeWorkflowState, setActiveWorkflowState] = useState(null);

  const handleSendGoal = async (goalText) => {
    const goal = goalText || inputGoal;
    if (!goal.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: goal }]);
    setInputGoal('');
    setLoading(true);

    try {
      const result = await api.executeAgentGoal(goal, userRole);
      setActiveWorkflowState(result);

      const decisionNotes = result?.final_decision?.resolution_notes?.join(' ') || 'Plan executed with out-of-time validation compliance.';
      const summaryText = `Orchestrator routed request to specialized sub-agents [${result.completed_tasks?.join(' → ')}]. ${decisionNotes}`;

      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: summaryText,
          data: result,
          sources: result.retrieved_sources || []
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Error orchestrating multi-agent workflow. Check backend endpoint status.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Interactive Multi-Agent Chat Transcript */}
      <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl flex flex-col justify-between overflow-hidden shadow-sm">
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>RetailSense Multi-Agent Assistant</span>
                <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[9px] uppercase font-mono font-semibold">Orchestrator Active</span>
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">Natural language goal routing across ML models, SQL database, and RAG vector store</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            8 Agents Synchronized
          </span>
        </div>

        {/* Conversation Transcript Area */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-2xl rounded-xl p-4 text-xs space-y-3 ${
                m.sender === 'user' 
                  ? 'bg-blue-600 text-white font-medium rounded-tr-none shadow-xs' 
                  : 'bg-slate-50/90 border border-slate-200/90 text-slate-800 rounded-tl-none'
              }`}>
                <p className="leading-relaxed font-sans">{m.text}</p>

                {/* Structured Agent Evidence Payload */}
                {m.data && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-3">
                    {/* Section 1: ML Model Predictions */}
                    {m.data.tool_results?.forecast_demand && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200/80 space-y-1.5 shadow-xs">
                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                          <BarChart2 className="w-3 h-3 text-blue-600" />
                          <span>Machine Learning Prediction Output</span>
                        </span>
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-slate-500">Model Architecture:</span>
                          <span className="text-slate-900 font-bold">{m.data.tool_results.forecast_demand.model_name}</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-slate-500">Predicted Demand (7 Days):</span>
                          <span className="text-blue-700 font-bold">{m.data.tool_results.forecast_demand.total_predicted_units} units</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-slate-500">Evaluation Metrics:</span>
                          <span className="text-emerald-700 font-semibold">MAE: {m.data.tool_results.forecast_demand.evaluation_metrics?.MAE} | R²: {m.data.tool_results.forecast_demand.evaluation_metrics?.R2}</span>
                        </div>
                      </div>
                    )}

                    {/* Section 2: Factual SQL Business Data */}
                    {m.data.tool_results?.calculate_procurement_cost && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200/80 space-y-1.5 shadow-xs">
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                          <Database className="w-3 h-3 text-amber-600" />
                          <span>Factual SQL Database Record</span>
                        </span>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Chosen Supplier:</span>
                          <span className="text-slate-900 font-bold">{m.data.tool_results.calculate_procurement_cost.chosen_supplier_name}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">PO Subtotal + Shipping:</span>
                          <span className="text-emerald-700 font-bold">${m.data.tool_results.calculate_procurement_cost.total_procurement_cost?.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    {/* Section 3: RAG Retrieved Knowledge */}
                    {m.sources && m.sources.length > 0 && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200/80 space-y-1.5 shadow-xs">
                        <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                          <FileText className="w-3 h-3 text-indigo-600" />
                          <span>RAG Vector Store Citation</span>
                        </span>
                        {m.sources.map((src, i) => (
                          <div key={i} className="text-[11px] text-slate-700 border-l-2 border-indigo-500 pl-2 py-0.5">
                            <strong className="text-slate-900 block font-semibold">{src.doc_title} ({src.chunk_id || 'Policy'})</strong>
                            <p className="text-[10px] text-slate-500">"{src.content}"</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Section 4: Recommended Action & Approval Status */}
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200">
                      <span className="text-slate-500 font-medium">Human SLA Approval Status:</span>
                      <span className={`font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                        m.data.approval_status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        m.data.approval_status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {m.data.approval_status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-slate-500 text-xs p-2 font-medium">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Orchestrating agents and generating verified response...</span>
            </div>
          )}
        </div>

        {/* Prompt Input Form & Chips Bar */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 space-y-3">
          {/* Sample Prompts Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 text-[11px]">
            {SAMPLE_NATURAL_GOALS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendGoal(prompt)}
                className="bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all shrink-0 font-medium shadow-xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendGoal();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask RetailSense AI anything (e.g., Which products may go out of stock next week?)..."
              value={inputGoal}
              onChange={(e) => setInputGoal(e.target.value)}
              className="flex-1 bg-white border border-slate-200/90 rounded-lg px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={loading || !inputGoal.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
            >
              <Send className="w-3.5 h-3.5 fill-current" />
              <span>Send Goal</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right Col: Live Workflow Inspector State Panel */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-4 overflow-y-auto shadow-sm">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-3">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Active Orchestrator State Inspector</span>
        </h3>

        {activeWorkflowState ? (
          <div className="space-y-4 text-xs">
            {/* Goal */}
            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-lg space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Target Goal</span>
              <p className="font-semibold text-slate-900">{activeWorkflowState.goal}</p>
            </div>

            {/* Plan Execution Trace */}
            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-lg space-y-2">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Decomposed Plan Steps</span>
              <div className="space-y-1">
                {activeWorkflowState.plan?.map((step, idx) => {
                  const isDone = activeWorkflowState.completed_tasks?.includes(step);
                  return (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-700">{idx + 1}. {step}</span>
                      {isDone ? (
                        <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">✓ DONE</span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">PENDING</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Outcome Verification */}
            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-lg space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Outcome Verification</span>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{activeWorkflowState.verification_result?.status}</span>
              </div>
            </div>

            {/* Raw JSON Debug View */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Shared AgentState Payload</span>
              <pre className="bg-slate-900 p-3 rounded-lg text-[10px] font-mono text-slate-100 overflow-x-auto border border-slate-800 max-h-48">
                {JSON.stringify(activeWorkflowState, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs space-y-2">
            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-medium text-slate-600">No active workflow executed yet.</p>
            <p className="text-[11px] text-slate-400">Click any prompt chip on the left to trigger the Orchestrator.</p>
          </div>
        )}
      </div>
    </div>
  );
}
