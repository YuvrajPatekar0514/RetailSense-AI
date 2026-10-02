/**
 * RetailSense AI — API Service Client
 * Connects frontend views to real FastAPI backend routes with JWT authentication.
 */

const API_BASE = '/api/v1';

async function fetchJSON(url, options = {}) {
  try {
    const token = localStorage.getItem('retailsense_token');
    const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};

    const res = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...options.headers
      },
      ...options
    });

    if (res.status === 401) {
      // Clear token if expired or unauthorized
      localStorage.removeItem('retailsense_token');
      localStorage.removeItem('retailsense_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.detail || `HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error [${url}]:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  login: (email, password) =>
    fetchJSON('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
  getMe: () => fetchJSON('/auth/me'),
  getRoles: () => fetchJSON('/auth/roles'),

  // Dashboard KPIs
  getDashboardKPIs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJSON(`/dashboard/kpis?${query}`);
  },

  // Sales
  getSalesSummary: () => fetchJSON('/sales/summary'),
  getSalesHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJSON(`/sales/history?${query}`);
  },

  // Demand Forecast & ML
  getDemandForecast: (product_id = 'PROD_BEA_001', store_id = 'STORE_USA', horizon_days = 7) => 
    fetchJSON(`/forecast/demand?product_id=${product_id}&store_id=${store_id}&horizon_days=${horizon_days}`),
  retrainForecastModel: () => fetchJSON('/forecast/retrain', { method: 'POST' }),

  // Inventory
  getInventoryItems: () => fetchJSON('/inventory/items'),
  reorderInventory: (product_id, store_id, quantity) => 
    fetchJSON('/inventory/reorder', {
      method: 'POST',
      body: JSON.stringify({ product_id, store_id, quantity })
    }),

  // Products
  getProducts: (category = null) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return fetchJSON(`/products${query}`);
  },

  // Customers & Recommendations
  getCustomers: (loyalty_level = null) => {
    const query = loyalty_level ? `?loyalty_level=${encodeURIComponent(loyalty_level)}` : '';
    return fetchJSON(`/customers${query}`);
  },
  getCustomerRecommendations: (customer_id = 'CUST_001', top_n = 5) =>
    fetchJSON(`/customers/${customer_id}/recommendations?top_n=${top_n}`),

  // Orders
  getOrders: (status = null) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return fetchJSON(`/orders${query}`);
  },

  // Suppliers & Procurement
  getSuppliers: () => fetchJSON('/suppliers'),
  createPurchaseOrder: (supplier_id, product_id, quantity) =>
    fetchJSON('/suppliers/purchase-order', {
      method: 'POST',
      body: JSON.stringify({ supplier_id, product_id, quantity })
    }),

  // Returns
  getReturns: () => fetchJSON('/returns'),
  processReturn: (order_id, reason) =>
    fetchJSON('/returns/process', {
      method: 'POST',
      body: JSON.stringify({ order_id, reason })
    }),

  // Agent Execution & Status
  executeAgentGoal: (goal, user_role = 'seller') => 
    fetchJSON('/agents/execute', {
      method: 'POST',
      body: JSON.stringify({ goal, user_role, user_id: 'USER_SELLER_01' })
    }),
  getAgentStatus: () => fetchJSON('/agents/status'),

  // RAG Knowledge Base
  searchKnowledgeBase: (query) =>
    fetchJSON(`/admin/knowledge-base/search?query=${encodeURIComponent(query)}`),

  // Admin APIs
  getAdminStats: () => fetchJSON('/admin/stats'),
  getAdminOverview: () => fetchJSON('/admin/overview'),
  getAdminUsers: (role = 'all', search = '') => 
    fetchJSON(`/admin/users?role=${role}&search=${encodeURIComponent(search)}`),
  toggleUserStatus: (user_id, active) =>
    fetchJSON(`/admin/users/${user_id}/status?active=${active}`, { method: 'PUT' }),
  updateUserRole: (user_id, new_role) =>
    fetchJSON(`/admin/users/${user_id}/role?new_role=${new_role}`, { method: 'PUT' }),
  getAuditLogs: () => fetchJSON('/admin/audit-logs'),

  // CSV Data Import & Export
  downloadCSVTemplate: (entityType) => {
    window.open(`/api/v1/data/template/${entityType}`, '_blank');
  },
  previewCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('retailsense_token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const res = await fetch('/api/v1/data/import/preview', {
      method: 'POST',
      headers,
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'CSV preview failed');
    }
    return await res.json();
  },
  executeCSVImport: (data) =>
    fetchJSON('/data/import/execute', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  exportCSVData: (entityType) => {
    window.open(`/api/v1/data/export?entity_type=${entityType}`, '_blank');
  }
};
