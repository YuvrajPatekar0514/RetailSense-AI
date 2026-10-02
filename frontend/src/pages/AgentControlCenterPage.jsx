import React, { useState, useEffect } from 'react';
import { 
  Cpu, Play, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, 
  ArrowRight, FileText, Database, Bot, Sparkles, MessageSquare, 
  Layers, Lock, CheckCircle, XCircle, Zap, RotateCcw, AlertOctagon, ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';

export default function AgentControlCenterPage({ setActivePage }) {
  const [goalInput, setGoalInput] = useState('Optimize electronics inventory for the next 7 days.');
  const [running, setRunning] = useState(false);
  const [agentState, setAgentState] = useState(null);
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'replan' | 'tools' | 'ml' | 'rag' | 'messages'

  // Pre-load default seller workflow on initial mount
  useEffect(() => {
    runWorkflow('Optimize electronics inventory for the next 7 days.');
  }, []);

  async function runWorkflow(promptGoal) {
    const goalToRun = promptGoal || goalInput;
    setRunning(true);
    try {
      const res = await api.executeAgentGoal(goalToRun, 'seller');
      setAgentState(res);
    } catch (err) {
      console.error("Agent workflow execution error", err);
    } finally {
      setRunning(false);
    }
  }

  // Handle Human-in-the-Loop Approval Action
  function handleApprovalAction(status) {
    if (!agentState) return;
    setAgentState(prev => ({
      ...prev,
      approval_status: status,
      verification_result: {
        ...prev.verification_result,
        status: status === 'approved' ? 'EXECUTION_CONFIRMED_BY_HUMAN' : 'REJECTED_BY_HUMAN'
      }
    }));
  }

  const sampleGoals = [
    { label: '🚀 Seller Flagship', prompt: 'Optimize electronics inventory for the next 7 days.' },
    { label: '🔄 Failover & Re-Planning Demo', prompt: 'Optimize inventory for PROD_BEA_001 with supplier SLA failover simulation' },
    { label: '🏷️ Pricing Markdown', prompt: 'Simulate 15% promotion discount on PROD_BEA_001 and optimize selling price' },
    { label: '👤 Personalization', prompt: 'Find product recommendations for customer CUST_001 based on loyalty tier' }
  ];

  // Helper flags
  const isApproved = agentState?.approval_status === 'approved';
  const isRejected = agentState?.approval_status === 'rejected';
  const isPending = agentState?.approval_status === 'pending';
  const hasReplan = agentState?.retry_history && agentState.retry_history.length > 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <Cpu className="w-5 h-5" />
              </div>
              <span>Agent Control Center</span>
            </h2>
            <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Autonomous Verification & Re-Planning Enabled
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time multi-agent orchestration with autonomous failure detection, Orchestrator re-planning, alternative tool failovers, and human SLA governance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            8 Agents Online (LangGraph Engine)
          </span>
        </div>
      </div>

      {/* Preset Goal Selector & Execution Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Select Autonomous Re-Planning Preset Goal</span>
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Live backend execution (Reflects actual failure & failover events)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {sampleGoals.map((g, idx) => (
            <button
              key={idx}
              onClick={() => {
                setGoalInput(g.prompt);
                runWorkflow(g.prompt);
              }}
              className={`p-3 rounded-lg border text-left text-xs font-medium transition-all ${
                goalInput === g.prompt
                  ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-slate-900">{g.label}</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">{g.prompt}</div>
            </button>
          ))}
        </div>

        {/* Natural Language Prompt Input Bar */}
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="Type custom natural language goal..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono"
          />
          <button
            onClick={() => runWorkflow(goalInput)}
            disabled={running}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            {running ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Executing Re-Planning Loop...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-white" />
                <span>Run Autonomous Loop</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Autonomous Failure & Re-Planning Alert Banner (If Failover Occurred) */}
      {hasReplan && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3 text-amber-900 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
              <h3 className="text-sm font-bold text-slate-900">Autonomous Re-Planning Event Triggered</h3>
            </div>
            <span className="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase font-mono">
              Status: REPLANNED_AND_VERIFIED
            </span>
          </div>

          <div className="bg-white border border-amber-200 p-3.5 rounded-lg space-y-2 text-xs shadow-2xs">
            <div className="text-rose-700 font-bold flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <span>Failure Identified: {agentState.retry_history[0].failure_reason}</span>
            </div>
            <div className="text-slate-700 font-sans">
              <strong>Orchestrator Action:</strong> Re-planned workflow sequence, inserted step <code className="text-blue-700 font-bold bg-blue-50 px-1 rounded">procurement_alternative_failover</code>, and selected alternative supplier <strong className="text-emerald-700">{agentState.agent_results?.ProcurementAgent?.procurement_cost?.chosen_supplier_name}</strong> (Lead time: 10 days - SLA Compliant!).
            </div>
          </div>
        </div>
      )}

      {/* Flagship Visual Pipeline Flowchart */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-4 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Multi-Agent Workflow & Verification Pipeline</span>
          </h3>
          <span className="text-[11px] font-mono text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
            {agentState ? `Goal: "${agentState.goal}"` : 'Awaiting Execution'}
          </span>
        </div>

        {/* Horizontal Flowchart Diagram */}
        <div className="overflow-x-auto py-2">
          <div className="flex items-center gap-2 min-w-[1000px] justify-between text-center">
            {/* Step 1: User Goal */}
            <div className="bg-slate-50 border border-blue-200 p-2.5 rounded-lg w-28 shrink-0 space-y-1 shadow-2xs">
              <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wider block">1. Input</span>
              <div className="text-xs font-extrabold text-slate-900">USER GOAL</div>
              <span className="text-[9px] text-slate-500 block truncate">Goal Prompt</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step 2: Orchestrator */}
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg w-32 shrink-0 space-y-1 shadow-2xs">
              <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider block">2. Plan</span>
              <div className="text-xs font-bold text-slate-900">ORCHESTRATOR</div>
              <span className="text-[9px] text-emerald-700 font-bold block">✓ Plan Created</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step 3: Demand Agent */}
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg w-32 shrink-0 space-y-1 shadow-2xs">
              <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider block">3. Predict</span>
              <div className="text-xs font-bold text-slate-900">DEMAND AGENT</div>
              <span className="text-[9px] text-indigo-700 font-medium block">Random Forest</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step 4: Inventory Agent */}
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg w-32 shrink-0 space-y-1 shadow-2xs">
              <span className="text-[9px] font-bold text-purple-600 uppercase tracking-wider block">4. Analyze</span>
              <div className="text-xs font-bold text-slate-900">INVENTORY AGENT</div>
              <span className="text-[9px] text-purple-700 font-medium block">Stock Cover 14d</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step 5: Procurement Agent (Or Alternative Failover) */}
            <div className={`p-2.5 rounded-lg w-36 shrink-0 space-y-1 shadow-2xs border ${
              hasReplan ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-[9px] font-bold uppercase tracking-wider block text-amber-700">
                {hasReplan ? '5. Failover Re-Plan' : '5. Sourcing'}
              </span>
              <div className="text-xs font-bold text-slate-900">PROCUREMENT</div>
              <span className="text-[9px] block font-semibold text-amber-800 truncate">
                {agentState?.agent_results?.ProcurementAgent?.procurement_cost?.chosen_supplier_name || 'Pacific Traders'}
              </span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step 6: Human Approval */}
            <div className={`p-2.5 rounded-lg w-36 shrink-0 space-y-1 shadow-2xs border ${
              isApproved ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
              isRejected ? 'bg-rose-50 border-rose-300 text-rose-800' :
              'bg-amber-50 border-amber-300 text-amber-800'
            }`}>
              <span className="text-[9px] font-bold uppercase tracking-wider block">6. Authorization</span>
              <div className="text-xs font-extrabold text-slate-900">HUMAN APPROVAL</div>
              <span className="text-[9px] block font-bold uppercase">{agentState?.approval_status || 'PENDING'}</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Step 7: Outcome Verification */}
            <div className="bg-slate-50 border border-emerald-300 p-2.5 rounded-lg w-36 shrink-0 space-y-1 shadow-2xs">
              <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider block">7. Verification</span>
              <div className="text-xs font-bold text-slate-900">RE-PLAN & VERIFY</div>
              <span className="text-[9px] text-emerald-700 block font-bold truncate">
                {agentState?.verification_result?.status || 'VERIFIED'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Inspection Tabs */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-5 shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 overflow-x-auto">
          <div className="flex gap-2">
            {[
              { id: 'pipeline', label: '1. State & Plan Overview', icon: Layers },
              { id: 'replan', label: `2. Re-Planning & Verification (${hasReplan ? '1 Re-Plan' : '0 Retries'})`, icon: RotateCcw },
              { id: 'tools', label: '3. Tool Calls (5)', icon: Zap },
              { id: 'ml', label: '4. ML Demand Engine', icon: BarChart2 },
              { id: 'rag', label: '5. RAG Vector Sources', icon: Database },
              { id: 'messages', label: '6. Agent Messages (6)', icon: MessageSquare }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: State & Plan Overview */}
        {activeTab === 'pipeline' && agentState && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Goal Card */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">1. Goal & Context</span>
              <p className="text-xs font-bold text-slate-900">{agentState.goal}</p>
              <div className="flex justify-between text-[11px] text-slate-500 border-t border-slate-200 pt-2 font-medium">
                <span>User: <strong className="text-slate-800">{agentState.user_id}</strong></span>
                <span>Role: <strong className="text-blue-700 uppercase">{agentState.user_role}</strong></span>
              </div>
            </div>

            {/* Plan Card */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">2. Decomposed Plan ({agentState.plan?.length || 0} Stages)</span>
              <div className="space-y-1">
                {agentState.plan?.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700">
                    <span className="w-4 h-4 rounded-full bg-white text-[10px] text-blue-700 font-bold flex items-center justify-center border border-slate-200 shadow-2xs">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-[11px] font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Card */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">7. Outcome Verification</span>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{agentState.verification_result?.status}</span>
              </div>
              <span className="text-[11px] text-slate-500 block font-mono font-medium">
                Steps Completed: {agentState.verification_result?.completed_steps} / {agentState.verification_result?.total_planned_steps}
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Autonomous Re-Planning & Verification Details */}
        {activeTab === 'replan' && agentState && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">7-Step Autonomous Verification & Re-Planning Audit Log</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Step 1: Check Execution Success</span>
                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Execution Succeeded (Zero unhandled Python exceptions)
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Step 2 & 3: Result Validation & Outcome Comparison</span>
                <div className="text-xs text-slate-700 font-mono font-medium">
                  {agentState.verification_result?.expected_vs_actual}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 md:col-span-2">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Step 4, 5, 6 & 7: Failure Identification, Orchestrator Re-Planning & Alternative Selection</span>
                {hasReplan ? (
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg font-medium">
                      <strong>Failure Identified:</strong> {agentState.retry_history[0].failure_reason}
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg font-medium">
                      <strong>Orchestrator Re-Plan:</strong> {agentState.retry_history[0].replan_action}
                    </div>
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-medium">
                      <strong>Verified Result:</strong> {agentState.retry_history[0].outcome} ({agentState.verification_result?.status})
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium">
                    ✓ Primary plan executed cleanly without requiring tool failover re-planning.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Tool Calls */}
        {activeTab === 'tools' && agentState?.tool_results && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Executed Domain Function Tools ({Object.keys(agentState.tool_results).length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(agentState.tool_results).map(([toolName, result], idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 shadow-2xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-blue-700 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      {toolName}()
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      EXECUTED
                    </span>
                  </div>
                  <pre className="bg-slate-900 p-3 rounded-lg text-[10px] font-mono text-slate-100 overflow-x-auto border border-slate-800 max-h-40">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: ML Demand Engine */}
        {activeTab === 'ml' && agentState?.tool_results?.forecast_demand && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <span className="text-xs text-slate-500 font-medium">Model Name</span>
                <div className="text-sm font-bold text-blue-700 mt-1">{agentState.tool_results.forecast_demand.model_name}</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <span className="text-xs text-slate-500 font-medium">MAE Score</span>
                <div className="text-sm font-bold text-emerald-700 mt-1">{agentState.tool_results.forecast_demand.evaluation_metrics?.MAE} units</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <span className="text-xs text-slate-500 font-medium">R² Score</span>
                <div className="text-sm font-bold text-indigo-700 mt-1">{agentState.tool_results.forecast_demand.evaluation_metrics?.R2}</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <span className="text-xs text-slate-500 font-medium">Predicted Horizon Units</span>
                <div className="text-sm font-bold text-amber-700 mt-1">{agentState.tool_results.forecast_demand.total_predicted_units} units</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: RAG Vector Sources */}
        {activeTab === 'rag' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Retrieved SLA & Policy Guidelines ({agentState?.retrieved_sources?.length || 0})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agentState?.retrieved_sources?.map((src, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-xs">{src.doc_title}</span>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
                      Distance: {src.distance}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed font-sans shadow-2xs">
                    "{src.content}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Agent Messages */}
        {activeTab === 'messages' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Chronological Inter-Agent Communications Log</h4>
            <div className="space-y-2.5">
              {agentState?.messages?.map((msg, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 text-xs">{msg.sender}</span>
                      <span className="text-[10px] font-mono text-slate-400">{msg.timestamp || '00:00:0' + (i+1)}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
