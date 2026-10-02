import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import CustomerDataManagement from '../components/CustomerDataManagement';
import CSVImportExportWizard from '../components/CSVImportExportWizard';
import { 
  Shield, 
  Users, 
  Store as StoreIcon, 
  TrendingUp, 
  Bot, 
  Activity, 
  FileText, 
  LogOut, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Building,
  UserCheck,
  UserX,
  Sliders,
  Database,
  BarChart3,
  Download,
  BrainCircuit,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
  Bell,
  FileSpreadsheet
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewStats, setOverviewStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [agentStatuses, setAgentStatuses] = useState([
    { name: 'Platform Intelligence Agent', status: 'Online', latency: '45ms', tasks: 1280, active: true },
    { name: 'User Management Agent', status: 'Online', latency: '32ms', tasks: 450, active: true },
    { name: 'System Monitoring Agent', status: 'Online', latency: '18ms', tasks: 3200, active: true },
    { name: 'Governance Agent', status: 'Online', latency: '55ms', tasks: 890, active: true },
    { name: 'Demand Forecasting Agent', status: 'Online', latency: '120ms', tasks: 2100, active: true },
    { name: 'Inventory Optimization Agent', status: 'Online', latency: '85ms', tasks: 1750, active: true },
    { name: 'Procurement Agent', status: 'Online', latency: '95ms', tasks: 640, active: true },
    { name: 'Pricing & Promotion Agent', status: 'Online', latency: '110ms', tasks: 1120, active: true }
  ]);

  const [approvalsQueue, setApprovalsQueue] = useState([
    { id: 'APP-101', role: 'Procurement Manager', action: 'Submit Purchase Order #PO-982', reason: 'Safety stock below minimum threshold for Electronics', store: 'RetailSense Hub (USA)', risk: 'Medium', status: 'pending' },
    { id: 'APP-102', role: 'Pricing Agent', action: 'Apply 15% Promotional Discount', reason: 'Slow moving inventory detected for SKU PROD_BEA_002', store: 'RetailSense Hub (UK)', risk: 'Low', status: 'pending' }
  ]);

  useEffect(() => {
    loadAdminData();
  }, [roleFilter, searchQuery]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const stats = await api.getAdminOverview();
      setOverviewStats(stats);

      const users = await api.getAdminUsers(roleFilter, searchQuery);
      setUsersList(users);

      const logs = await api.getAuditLogs();
      setAuditLogs(logs.audit_logs || []);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await api.toggleUserStatus(userId, !currentStatus);
      loadAdminData();
    } catch (err) {
      alert("Failed to toggle status: " + err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      loadAdminData();
    } catch (err) {
      alert("Failed to update role: " + err.message);
    }
  };

  const handleApprovalAction = (id, approved) => {
    setApprovalsQueue(prev => prev.map(item => item.id === id ? { ...item, status: approved ? 'approved' : 'rejected' } : item));
  };

  const toggleAgent = (index) => {
    const updated = [...agentStatuses];
    updated[index].active = !updated[index].active;
    updated[index].status = updated[index].active ? 'Online' : 'Disabled';
    setAgentStatuses(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top White Enterprise Navbar */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 shadow-xs z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-base tracking-tight flex items-center gap-2 leading-none">
              <span>RetailSense</span>
              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md font-extrabold uppercase">
                Admin Center
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Enterprise Platform Governance & Multi-Agent Operations</p>
          </div>
        </div>

        {/* System Health Indicators */}
        <div className="hidden md:flex items-center gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Backend API: Operational</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-medium text-slate-700">Database Async ORM: Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-purple-600" />
            <span className="font-medium text-slate-700">8 LangGraph Agents</span>
          </div>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900">{user?.full_name || 'System Administrator'}</p>
            <p className="text-[10px] text-slate-500 font-medium">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Admin Navigation Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200/80 p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider px-3">
              Admin Platform Suite
            </div>

            <nav className="space-y-1.5">
              {[
                { id: 'overview', label: 'Platform Overview', icon: Activity },
                { id: 'users', label: 'User Directory', icon: Users },
                { id: 'customers_mgmt', label: 'Customer Data & Analytics', icon: UserCheck },
                { id: 'csv_hub', label: 'CSV Data Import & Export', icon: FileSpreadsheet },
                { id: 'retailers', label: 'Retailers & Stores', icon: StoreIcon },
                { id: 'bi', label: 'Global Business Intelligence', icon: BarChart3 },
                { id: 'agents', label: 'AI Agent Control Center', icon: Bot },
                { id: 'approvals', label: 'Human Approval Queue', icon: ShieldCheck, badge: approvalsQueue.filter(a => a.status === 'pending').length },
                { id: 'system', label: 'System Audit & Logs', icon: Database },
                { id: 'reports', label: 'Platform Reports', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge > 0 && (
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                        isActive ? 'bg-white text-blue-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600">
            <p className="font-bold text-slate-900">Security Clearance</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Admin Full Scope (`*`)</p>
          </div>
        </aside>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/70">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Platform Overview</h2>
                <p className="text-xs text-slate-500">Cross-platform statistics, user growth, and active multi-agent metrics.</p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                    <span>Total Retailers</span>
                    <Building className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-2">
                    {overviewStats?.total_retailers ?? '...'}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-1">Active Retailer Accounts</div>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                    <span>Registered Customers</span>
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-2">
                    {overviewStats?.total_customers ?? '...'}
                  </div>
                  <div className="text-[10px] text-purple-600 font-bold mt-1">Consumer Shopper Profiles</div>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                    <span>Platform GMV Volume</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-2">
                    ${overviewStats?.platform_gmv ? overviewStats.platform_gmv.toLocaleString() : '...'}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-1">Gross Merchandise Value</div>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                    <span>Active AI Agents</span>
                    <BrainCircuit className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-2">
                    {overviewStats?.active_agents ?? 8}
                  </div>
                  <div className="text-[10px] text-amber-600 font-bold mt-1">LangGraph Multi-Agent Engine</div>
                </div>
              </div>

              {/* Agent Health Grid */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-600" />
                  <span>Agent Network Health Status</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {agentStatuses.map((agent, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{agent.name}</p>
                        <p className="text-[10px] text-slate-500">Latency: {agent.latency} | Tasks: {agent.tasks}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                        agent.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Platform User Directory</h2>
                  <p className="text-xs text-slate-500">Manage user permissions, roles, and account statuses.</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white border border-slate-200/90 text-xs text-slate-800 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-white border border-slate-200/90 text-xs text-slate-700 font-semibold rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="retailer">Retailer / Store Mgr</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500">
                    <tr>
                      <th className="p-4">User Details</th>
                      <th className="p-4">Assigned Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Created Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersList.map((u) => (
                      <tr key={u.user_id} className="hover:bg-slate-50">
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{u.full_name}</p>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                        </td>
                        <td className="p-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                          >
                            <option value="admin">admin</option>
                            <option value="retailer">retailer</option>
                            <option value="customer">customer</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full border ${
                            u.is_active 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {u.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{u.created_at || '2026-10-02'}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleStatus(u.user_id, u.is_active)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              u.is_active
                                ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {u.is_active ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: CUSTOMER DATA MANAGEMENT & ML INSIGHTS */}
          {activeTab === 'customers_mgmt' && (
            <CustomerDataManagement />
          )}

          {/* TAB: CSV DATA IMPORT & EXPORT HUB */}
          {activeTab === 'csv_hub' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Enterprise CSV Data Import & Export Hub</h2>
                <p className="text-xs text-slate-500">Manage bulk CSV uploads, mapping configurations, duplicate reconciliation, and exports.</p>
              </div>
              <CSVImportExportWizard initialEntity="customers" />
            </div>
          )}

          {/* TAB 3: RETAILERS & STORES */}
          {activeTab === 'retailers' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Retailer & Store Directory</h2>
                <p className="text-xs text-slate-500">Manage registered store locations and operational health.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['USA', 'UK', 'Germany', 'Japan', 'Canada', 'Australia'].map((country, idx) => (
                  <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StoreIcon className="w-5 h-5 text-blue-600" />
                        <h4 className="font-bold text-slate-900 text-sm">RetailSense Hub ({country})</h4>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                        Operational
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Store ID: STORE_{country.toUpperCase()}</p>
                    <div className="pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-700">
                      <span>Monthly Revenue:</span>
                      <span className="font-extrabold text-emerald-600">${(45000 + idx * 8200).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: GLOBAL BUSINESS INTELLIGENCE */}
          {activeTab === 'bi' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Global Business Intelligence</h2>
                <p className="text-xs text-slate-500">Cross-store performance, revenue trends, and category GMV analytics.</p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">Platform GMV Growth Trend</h3>
                <div className="h-48 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-center text-slate-400 text-xs font-mono">
                  [Interactive Platform GMV Analytics Chart View]
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AGENT CONTROL CENTER */}
          {activeTab === 'agents' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">AI Agent Control Center</h2>
                <p className="text-xs text-slate-500">Monitor multi-agent execution, task counts, and governance controls.</p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500">
                    <tr>
                      <th className="p-4">Agent Name</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Avg Latency</th>
                      <th className="p-4">Total Tasks</th>
                      <th className="p-4 text-right">Control Toggle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {agentStatuses.map((agent, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900">{agent.name}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full ${
                            agent.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {agent.status}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-slate-500">{agent.latency}</td>
                        <td className="p-4 font-extrabold text-slate-900">{agent.tasks}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => toggleAgent(idx)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                              agent.active
                                ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-red-50 hover:text-red-700'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {agent.active ? 'Disable Agent' : 'Enable Agent'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: HUMAN APPROVAL QUEUE */}
          {activeTab === 'approvals' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Human Approval Queue</h2>
                <p className="text-xs text-slate-500">Approve or reject high-impact AI business actions before backend execution.</p>
              </div>

              <div className="space-y-3">
                {approvalsQueue.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-blue-600">{item.id}</span>
                        <span className="text-xs font-bold text-slate-900">{item.action}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                          item.risk === 'High' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.risk} Risk
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">Reason: {item.reason}</p>
                      <p className="text-[11px] text-slate-400">Target Store: {item.store} | Requested by: {item.role}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleApprovalAction(item.id, true)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleApprovalAction(item.id, false)}
                            className="px-4 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 font-extrabold text-xs rounded-xl transition-colors flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span className={`px-3 py-1 text-xs font-bold rounded-xl border ${
                          item.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: SYSTEM AUDIT & LOGS */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">System Audit & Tool Execution Logs</h2>
                <p className="text-xs text-slate-500">Audit log trail of execution tool calls and system events.</p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 font-mono text-xs text-slate-700 space-y-2 max-h-96 overflow-y-auto shadow-xs">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <span className="text-blue-600 font-bold">[{log.timestamp}] Tool: {log.tool_name}</span>
                      <span className="text-emerald-600 font-semibold">{log.status} ({log.latency_ms}ms)</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 py-8 text-center">No audit log entries recorded yet.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: PLATFORM REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Platform Analytics Reports</h2>
                <p className="text-xs text-slate-500">Export platform GMV, store metrics, and audit summary files.</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => alert("Downloading Platform GMV CSV Report...")}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Platform GMV (CSV)</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
