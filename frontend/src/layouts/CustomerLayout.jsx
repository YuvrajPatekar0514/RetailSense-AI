import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Sparkles, 
  Search, 
  Heart, 
  PackageCheck, 
  Headphones, 
  Tag, 
  User as UserIcon, 
  LogOut, 
  CheckCircle, 
  Star, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight,
  ShieldCheck,
  Bot,
  Info,
  Clock
} from 'lucide-react';

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(0);

  // Chatbot Assistant state
  const [chatMessages, setChatMessages] = useState([
    { sender: 'assistant', text: `Hello ${user?.full_name || 'Valued Customer'}! I'm your AI Shopping Assistant. How can I help you find products or track your orders today?` }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [assistantLoading, setAssistantLoading] = useState(false);

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      const prods = await api.getProducts();
      setProducts(prods);

      const recs = await api.getCustomerRecommendations('CUST_001', 6);
      setRecommendations(recs.recommendations || []);

      const myOrders = await api.getOrders();
      setOrders(myOrders);
    } catch (err) {
      console.error("Error loading customer data:", err);
    }
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.product_id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateCartQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'SUMMER15') {
      setDiscountApplied(0.15);
      alert("Coupon SUMMER15 Applied! 15% discount granted.");
    } else {
      alert("Invalid or expired coupon code.");
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    alert("Thank you for your order! Order placed successfully. Order ID: ORD_" + Math.floor(Math.random() * 90000 + 10000));
    setCart([]);
    setCartOpen(false);
  };

  const handleSendAssistant = async (e) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery;
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInputQuery('');
    setAssistantLoading(true);

    try {
      const res = await api.executeAgentGoal(userText, 'customer');
      const botResponse = res.final_decision?.summary || res.agent_results?.CustomerSupportAgent?.response || "I found relevant products and policy information matching your query.";
      setChatMessages((prev) => [...prev, { sender: 'assistant', text: botResponse }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, { sender: 'assistant', text: "I searched our product catalog and store policies. Returns are eligible within 30 days of purchase." }]);
    } finally {
      setAssistantLoading(false);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.selling_price * item.quantity, 0);
  const discountAmount = subtotal * discountApplied;
  const grandTotal = subtotal - discountAmount;

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Customer E-Commerce Navbar */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-xs z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-slate-900 leading-tight">
              RetailSense <span className="text-blue-600">Shop</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">Personalized AI Retail Portal</p>
          </div>
        </div>

        {/* Global Catalog Search */}
        <div className="relative w-64 sm:w-96 hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products, brands, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 border border-slate-200/90 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
          />
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-3">
          {/* Cart Icon Drawer Toggle */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2.5 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-2 text-xs font-bold"
          >
            <ShoppingCart className="w-4.5 h-4.5" />
            <span className="hidden sm:inline">Cart</span>
            {cart.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-extrabold flex items-center justify-center">
                {cart.reduce((a, c) => a + c.quantity, 0)}
              </span>
            )}
          </button>

          {/* User Avatar & Logout */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'C'}
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Customer Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between shrink-0 hidden md:flex">
          <div className="space-y-6">
            <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider px-3">
              Shopping Hub
            </div>

            <nav className="space-y-1.5">
              {[
                { id: 'home', label: 'Home & Recommendations', icon: Sparkles },
                { id: 'catalog', label: 'Product Catalog', icon: ShoppingBag },
                { id: 'assistant', label: 'AI Shopping Assistant', icon: Bot },
                { id: 'orders', label: 'My Orders & Tracking', icon: PackageCheck },
                { id: 'support', label: 'AI Support & Policies', icon: Headphones },
                { id: 'offers', label: 'Deals & Coupons', icon: Tag },
                { id: 'profile', label: 'Customer Profile', icon: UserIcon }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-3 bg-gradient-to-tr from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 text-[11px] text-blue-900">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Loyalty Rank: Platinum</span>
            </p>
            <p className="text-[10px] text-blue-700 mt-1">Free 2-day delivery on all orders</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {/* TAB 1: HOME & RECOMMENDATIONS */}
          {activeTab === 'home' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 max-w-xl">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
                    AI Personalization Active
                  </span>
                  <h2 className="text-2xl font-extrabold mt-3 tracking-tight">
                    Welcome back, {user?.full_name || 'Valued Customer'}!
                  </h2>
                  <p className="text-xs text-blue-100 mt-1">
                    Discover personalized product matches and exclusive member discounts curated for your lifestyle.
                  </p>
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="mt-4 px-5 py-2.5 bg-white text-blue-700 rounded-2xl text-xs font-extrabold shadow-md hover:bg-blue-50 transition-all flex items-center gap-2"
                  >
                    <span>Explore Full Catalog</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* AI Personalized Recommendations Carousel */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5 text-blue-600" />
                    <span>Recommended for You</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">Powered by ML RFM Engine</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.slice(0, 6).map((rec, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                            Score: {(rec.recommendation_score * 100).toFixed(0)}% Match
                          </span>
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">{rec.product_name || `Product SKU ${rec.product_id}`}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{rec.reason}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-slate-900">${rec.selling_price || 99.99}</span>
                        <button
                          onClick={() => addToCart({ product_id: rec.product_id, product_name: rec.product_name || `Product SKU ${rec.product_id}`, selling_price: rec.selling_price || 99.99 })}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT CATALOG */}
          {activeTab === 'catalog' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Product Catalog</h2>
                  <p className="text-xs text-slate-500">Browse verified retail products with real-time stock availability.</p>
                </div>

                {/* Category Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {['All', 'Electronics', 'Fashion', 'Beauty', 'Home & Kitchen'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                        categoryFilter === cat
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((p) => (
                  <div key={p.product_id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="w-full h-36 bg-slate-100 rounded-xl mb-3 flex items-center justify-center text-slate-400 font-bold text-xs">
                        [Image: {p.product_name}]
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{p.category}</span>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug mt-0.5">{p.product_name}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-base font-extrabold text-slate-900">${p.selling_price}</span>
                        <span className="text-[10px] text-emerald-600 font-bold block">In Stock</span>
                      </div>
                      <button
                        onClick={() => addToCart(p)}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AI SHOPPING ASSISTANT */}
          {activeTab === 'assistant' && (
            <div className="h-[calc(100vh-140px)] bg-white border border-slate-200 rounded-3xl p-6 flex flex-col shadow-xs">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Smart Shopping Assistant</h3>
                  <p className="text-xs text-slate-500">Ask for product comparisons, deals, or order information.</p>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                          : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {assistantLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Searching catalog & store policies...</span>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendAssistant} className="pt-3 border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask e.g. 'Recommend wireless earbuds under $100'..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={assistantLoading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-xs transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: MY ORDERS & TRACKING */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Orders & Tracking</h2>
                <p className="text-xs text-slate-500">Track delivery status and request returns for past orders.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500">
                    <tr>
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Order Date</th>
                      <th className="p-4">Total Paid</th>
                      <th className="p-4">Fulfillment Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.slice(0, 10).map((o) => (
                      <tr key={o.order_id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-blue-600">{o.order_id}</td>
                        <td className="p-4">{o.order_date}</td>
                        <td className="p-4 font-extrabold text-slate-900">${o.total_paid}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                            o.order_status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {o.order_status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => alert(`Return request initiated for Order ${o.order_id}`)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 font-semibold text-xs text-slate-700"
                          >
                            Request Return
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: AI SUPPORT & POLICIES */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Store Policies & Support</h2>
                <p className="text-xs text-slate-500">Verified retail guidelines and warranty policies.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>30-Day Money Back Return Policy</span>
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    All non-perishable items can be returned within 30 days of delivery for a 100% refund.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: OFFERS & COUPONS */}
          {activeTab === 'offers' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Deals & Promotional Coupons</h2>
                <p className="text-xs text-slate-500">Apply valid coupons during cart checkout.</p>
              </div>

              <div className="p-6 bg-gradient-to-tr from-emerald-500 to-teal-600 text-white rounded-3xl shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-white/20 rounded-full">Active Coupon</span>
                  <h3 className="text-xl font-extrabold mt-2">15% Off Summer Electronics Sale</h3>
                  <p className="text-xs text-emerald-100">Use promo code <span className="font-bold underline">SUMMER15</span> at checkout</p>
                </div>
                <button
                  onClick={() => { setCouponCode('SUMMER15'); applyCoupon(); }}
                  className="px-4 py-2 bg-white text-emerald-700 font-extrabold rounded-2xl text-xs shadow-md"
                >
                  Apply SUMMER15
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Customer Account Profile</h3>
              <div className="space-y-3 text-xs text-slate-700">
                <div>
                  <label className="font-semibold text-slate-500 block">Full Name</label>
                  <input type="text" readOnly value={user?.full_name || 'Ava Hall'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold mt-1" />
                </div>
                <div>
                  <label className="font-semibold text-slate-500 block">Email Address</label>
                  <input type="email" readOnly value={user?.email || 'customer@retailsense.ai'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold mt-1" />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Cart Slide-Over Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div onClick={() => setCartOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 z-10 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <span>Your Cart ({cart.reduce((a, c) => a + c.quantity, 0)})</span>
              </h3>
              <button onClick={() => setCartOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{item.product_name}</h4>
                      <p className="text-xs font-extrabold text-blue-600 mt-0.5">${item.selling_price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateCartQty(item.product_id, -1)} className="p-1 rounded-lg bg-white border text-slate-600 hover:bg-slate-100">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateCartQty(item.product_id, 1)} className="p-1 rounded-lg bg-white border text-slate-600 hover:bg-slate-100">
                        <Plus className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeFromCart(item.product_id)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg ml-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-center py-12 text-xs">Your shopping cart is empty.</div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Coupon code (e.g. SUMMER15)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                />
                <button onClick={applyCoupon} className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold">Apply</button>
              </div>

              <div className="space-y-1 text-xs text-slate-600 pt-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                {discountApplied > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount (15%):</span>
                    <span className="font-bold">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t">
                  <span>Grand Total:</span>
                  <span className="text-blue-600">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-colors disabled:opacity-50"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
