import React, { useEffect, useState } from 'react';
import { ShoppingBag, Search, RefreshCw, CheckCircle, Clock, Truck, XCircle, DollarSign } from 'lucide-react';
import { api } from '../services/api';

export default function OrdersPage({ filters }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await api.getOrders(statusFilter !== 'all' ? statusFilter : null);
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = orders.filter(o =>
    o.order_id.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_id.toLowerCase().includes(search.toLowerCase()) ||
    o.product_id.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_paid || 0), 0);
  const deliveredCount = orders.filter(o => o.order_status === 'DELIVERED').length;
  const pendingCount = orders.filter(o => o.order_status === 'PENDING').length;
  const shippedCount = orders.filter(o => o.order_status === 'SHIPPED').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span>Orders & Fulfillment Logistics</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time transaction tracking, status monitoring, payment auditing, and line item details.
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-lg border border-slate-200 transition-all self-start sm:self-auto shrink-0 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Order Volume</span>
            <div className="text-xl font-bold text-slate-900 mt-1">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500">Delivered Orders</span>
            <div className="text-xl font-bold text-emerald-600 mt-1">{deliveredCount}</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500">In-Transit / Shipped</span>
            <div className="text-xl font-bold text-sky-600 mt-1">{shippedCount}</div>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-lg border border-sky-100">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500">Pending Fulfillment</span>
            <div className="text-xl font-bold text-amber-600 mt-1">{pendingCount}</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Order ID, Customer ID, Product ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-medium"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Statuses' },
            { id: 'DELIVERED', label: 'Delivered' },
            { id: 'SHIPPED', label: 'Shipped' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${
                statusFilter === st.id
                  ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2 font-medium">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading orders catalog...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">
            No orders found matching parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer ID</th>
                  <th className="px-4 py-3">Product ID</th>
                  <th className="px-4 py-3">Order Date</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Unit Price</th>
                  <th className="px-4 py-3">Total Paid</th>
                  <th className="px-4 py-3">Payment Status</th>
                  <th className="px-4 py-3">Fulfillment Status</th>
                  <th className="px-4 py-3">Delivery Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((o) => {
                  const isDelivered = o.order_status === 'DELIVERED';
                  const isPending = o.order_status === 'PENDING';
                  const isShipped = o.order_status === 'SHIPPED';
                  const isCancelled = o.order_status === 'CANCELLED';

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono text-blue-700 font-bold">{o.order_id}</td>
                      <td className="px-4 py-3 font-mono text-slate-600 font-medium">{o.customer_id}</td>
                      <td className="px-4 py-3 font-mono text-slate-600 font-medium">{o.product_id}</td>
                      <td className="px-4 py-3 text-slate-500 font-medium">{o.order_date}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{o.quantity}</td>
                      <td className="px-4 py-3 text-slate-500 font-medium">${o.unit_price?.toFixed(2)}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">${o.total_paid?.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.payment_status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {o.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 w-fit ${
                          isDelivered ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          isShipped ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                          isPending ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isDelivered && <CheckCircle className="w-3 h-3" />}
                          {isShipped && <Truck className="w-3 h-3" />}
                          {isPending && <Clock className="w-3 h-3" />}
                          {isCancelled && <XCircle className="w-3 h-3" />}
                          {o.order_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-medium">{o.delivery_date || 'N/A'}</td>
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
