import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  BrainCircuit, 
  ShieldCheck, 
  AlertCircle,
  ArrowRight,
  UserCheck,
  Info,
  Shield,
  Building,
  ShoppingBag
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@retailsense.ai');
  const [password, setPassword] = useState('admin123');
  const [activeRoleName, setActiveRoleName] = useState('Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotMsg, setForgotMsg] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const demoAccounts = [
    { 
      role: 'Admin', 
      email: 'admin@retailsense.ai', 
      pass: 'admin123', 
      desc: 'Platform Administration & System Governance',
      icon: Shield,
      badge: 'bg-red-50 text-red-700 border-red-200' 
    },
    { 
      role: 'Retailer', 
      email: 'retail.manager@retailsense.ai', 
      pass: 'manager123', 
      desc: 'Store Operations, Inventory & Sales Analytics',
      icon: Building,
      badge: 'bg-blue-50 text-blue-700 border-blue-200' 
    },
    { 
      role: 'Customer', 
      email: 'customer@retailsense.ai', 
      pass: 'customer123', 
      desc: 'Personalized Shopping, Recommendations & Orders',
      icon: ShoppingBag,
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' 
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setForgotMsg(false);
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.message && err.message.includes('Failed to fetch')) {
        setError('Unable to reach RetailSense API server (http://127.0.0.1:8000). Please check backend status.');
      } else {
        setError(err.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setActiveRoleName(acc.role);
    setError('');
    setForgotMsg(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <BrainCircuit className="w-7 h-7" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            RetailSense <span className="text-blue-600">AI</span>
          </span>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign in to Enterprise System
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Multi-Agent Autonomous Retail Intelligence & Decision Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 font-medium">{error}</div>
            </div>
          )}

          {forgotMsg && (
            <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800 font-medium">
                For password resets, please contact <span className="font-bold underline">admin@retailsense.ai</span> or select one of the three primary role buttons below.
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Work Email</label>
              <div className="mt-2 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  placeholder="name@retailsense.ai"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <div className="mt-2 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs font-medium text-slate-600 cursor-pointer">
                  Remember session (24h)
                </label>
              </div>
              <button
                type="button"
                onClick={() => setForgotMsg(true)}
                className="text-xs font-medium text-blue-600 hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In as {activeRoleName}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Role Fill Section for 3 Distinct Dashboard Evaluation */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Select Dashboard Role Persona
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((acc, idx) => {
                const Icon = acc.icon;
                const isSelected = activeRoleName === acc.role;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => fillCredentials(acc)}
                    className={`p-2.5 rounded-xl border text-center font-semibold transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-800 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold">{acc.role}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>AES-256 Encrypted & Role-Based RBAC Protection</span>
        </div>
      </div>
    </div>
  );
}
