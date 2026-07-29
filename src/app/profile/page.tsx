'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { CartProvider } from '@/context/CartContext';
import { 
  User, Mail, Lock, LogIn, UserPlus, CreditCard, Shield, 
  ShoppingBag, Heart, Settings, LogOut, CheckCircle2, Copy, Check, ArrowRight, Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/Toast';

interface GameKey {
  id: string;
  keyCode: string;
  product?: {
    name: string;
    coverImage: string;
    platform: string;
    type: string;
  };
  createdAt?: string;
}

interface Order {
  id: string;
  createdAt: string;
  netAmount: number | string;
  status: string;
  gameKeys: GameKey[];
}

function ProfileContent() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  
  // Dashboard states
  const [dashboardTab, setDashboardTab] = useState<'orders' | 'vault' | 'wishlist' | 'settings' | 'transactions'>('orders');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // User state
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    balance: number;
    role: string;
  } | null>(null);

  // Live order list
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [activeChatOrderIds, setActiveChatOrderIds] = useState<Set<string>>(new Set());

  // Transaction list
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Check query params for active tab on mount
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'vault' || tabParam === 'wishlist' || tabParam === 'settings' || tabParam === 'orders' || tabParam === 'transactions') {
      setDashboardTab(tabParam as any);
    }
  }, [searchParams]);

  // Check login status on mount & restore remembered email
  useEffect(() => {
    const storedUser = localStorage.getItem('ods_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        setIsLoggedIn(true);
      } catch (err) {
        console.error('Failed to parse stored user:', err);
      }
    }

    const savedEmail = localStorage.getItem('ods_remembered_email');
    const isRemembered = localStorage.getItem('ods_remember_me') === 'true';
    if (savedEmail) {
      setLoginEmail(savedEmail);
    }
    setRememberMe(isRemembered);
  }, []);

  // Fetch real order history from database when user is logged in
  useEffect(() => {
    if (!currentUser?.id) {
      setOrders([]);
      return;
    }
    const fetchOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const res = await fetch(`/api/orders?userId=${currentUser.id}`);
        const data = await res.json();
        if (res.ok) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setIsLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [currentUser]);

  // Fetch transaction history
  useEffect(() => {
    if (!currentUser?.id) {
      setTransactions([]);
      return;
    }
    const fetchTransactions = async () => {
      setIsLoadingTransactions(true);
      try {
        const res = await fetch(`/api/wallet/transactions?userId=${currentUser.id}`);
        const data = await res.json();
        if (res.ok) {
          setTransactions(data.transactions || []);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setIsLoadingTransactions(false);
      }
    };
    fetchTransactions();
  }, [currentUser]);

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      // Check for active chats from admin
      fetch('/api/support')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const adminChats = data.filter((m: any) => m.senderId === 'ADMIN' && m.receiverId === currentUser.id);
            const orderIds = new Set(adminChats.map((m: any) => m.orderId).filter(Boolean));
            setActiveChatOrderIds(orderIds as Set<string>);
          }
        })
        .catch(() => {});
    }
  }, [isLoggedIn, currentUser]);

  const formatCurrency = (value: number | string) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(numericValue);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || 'Đăng nhập thất bại!', 'error');
        return;
      }
      showToast('Đăng nhập thành công! Chào mừng bạn quay lại ODS.', 'success');
      localStorage.setItem('ods_user', JSON.stringify(data.user));

      if (rememberMe) {
        localStorage.setItem('ods_remembered_email', loginEmail);
        localStorage.setItem('ods_remember_me', 'true');
      } else {
        localStorage.removeItem('ods_remembered_email');
        localStorage.removeItem('ods_remember_me');
      }

      window.dispatchEvent(new Event('ods_user_update'));
      setCurrentUser(data.user);
      setIsLoggedIn(true);
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra, vui lòng thử lại sau!', 'error');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      showToast('Mật khẩu nhập lại không khớp!', 'error');
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || 'Đăng ký thất bại!', 'error');
        return;
      }
      showToast('Đăng ký tài khoản thành công!', 'success');
      localStorage.setItem('ods_user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('ods_user_update'));
      setCurrentUser(data.user);
      setIsLoggedIn(true);
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra, vui lòng thử lại sau!', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ods_user');
    window.dispatchEvent(new Event('ods_user_update'));
    setCurrentUser(null);
    setOrders([]);
    setIsLoggedIn(false);
    showToast('Đã đăng xuất khỏi tài khoản.', 'info');
  };

  const handleCopy = (id: string, keyCode: string) => {
    navigator.clipboard.writeText(keyCode);
    setCopiedKeyId(id);
    showToast('Đã sao chép mã Key Game thành công!', 'success');
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col antialiased">
      {/* HEADER */}
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            /* ================== AUTHENTICATION FORM (LOGIN / REGISTER) ================== */
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="mx-auto max-w-md my-12"
            >
              <div className="rounded-ods border border-ods-border bg-white p-8 shadow-sm space-y-6">
                {/* Tabs selection */}
                <div className="flex border-b border-ods-border space-x-4 mb-6">
                  <button
                    onClick={() => setAuthTab('login')}
                    className={`flex-1 text-center font-heading text-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-all ${
                      authTab === 'login'
                        ? 'border-ods-primary text-ods-primary'
                        : 'border-transparent text-ods-textMuted hover:text-black'
                    }`}
                  >
                    Đăng Nhập
                  </button>
                  <button
                    onClick={() => setAuthTab('register')}
                    className={`flex-1 text-center font-heading text-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-all ${
                      authTab === 'register'
                        ? 'border-ods-primary text-ods-primary'
                        : 'border-transparent text-ods-textMuted hover:text-black'
                    }`}
                  >
                    Tạo Tài Khoản
                  </button>
                </div>

                {/* Tab Contents */}
                {authTab === 'login' ? (
                  /* LOGIN FORM */
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Địa chỉ Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-ods-textMuted" />
                        <input
                          type="email"
                          required
                          placeholder="username@gmail.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full rounded-ods border border-ods-border bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-black placeholder-zinc-400 focus:border-ods-primary focus:outline-none focus:ring-1 focus:ring-ods-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Mật khẩu</label>
                        <span className="text-[9px] text-ods-primary hover:underline cursor-pointer font-bold">Quên mật khẩu?</span>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-ods-textMuted" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full rounded-ods border border-ods-border bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-black placeholder-zinc-400 focus:border-ods-primary focus:outline-none focus:ring-1 focus:ring-ods-primary transition-all"
                        />
                      </div>
                    </div>

                    {/* REMEMBER ME CHECKBOX */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-gray-700">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-ods-primary focus:ring-ods-primary accent-ods-primary"
                        />
                        <span>Ghi nhớ tài khoản</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-4 flex items-center justify-center gap-2 rounded-ods bg-ods-primary hover:bg-ods-primaryHover text-white py-3.5 text-xs font-bold uppercase tracking-wider transition-all hover:shadow-buttonGlow active:scale-95"
                    >
                      <LogIn className="h-4.5 w-4.5" />
                      <span>Đăng Nhập</span>
                    </button>
                  </form>
                ) : (
                  /* REGISTER FORM */
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Họ và Tên</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-ods-textMuted" />
                        <input
                          type="text"
                          required
                          placeholder="Nguyễn Văn A"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full rounded-ods border border-ods-border bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-black placeholder-zinc-400 focus:border-ods-primary focus:outline-none focus:ring-1 focus:ring-ods-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Địa chỉ Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-ods-textMuted" />
                        <input
                          type="email"
                          required
                          placeholder="username@gmail.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full rounded-ods border border-ods-border bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-black placeholder-zinc-400 focus:border-ods-primary focus:outline-none focus:ring-1 focus:ring-ods-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Mật khẩu</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-ods-textMuted" />
                        <input
                          type="password"
                          required
                          placeholder="Tối thiểu 6 ký tự"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full rounded-ods border border-ods-border bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-black placeholder-zinc-400 focus:border-ods-primary focus:outline-none focus:ring-1 focus:ring-ods-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Nhập lại mật khẩu</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-ods-textMuted" />
                        <input
                          type="password"
                          required
                          placeholder="Trùng khớp mật khẩu trên"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className="w-full rounded-ods border border-ods-border bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-black placeholder-zinc-400 focus:border-ods-primary focus:outline-none focus:ring-1 focus:ring-ods-primary transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-4 flex items-center justify-center gap-2 rounded-ods bg-ods-primary hover:bg-ods-primaryHover text-white py-3.5 text-xs font-bold uppercase tracking-wider transition-all hover:shadow-buttonGlow active:scale-95"
                    >
                      <UserPlus className="h-4.5 w-4.5" />
                      <span>Tạo Tài Khoản</span>
                    </button>
                  </form>
                )}

                {/* Secure Notice */}
                <div className="mt-6 border-t border-ods-border pt-4 text-center flex items-center justify-center gap-2 text-[9.5px] text-ods-textMuted uppercase font-bold tracking-wider">
                  <Shield className="h-3.5 w-3.5 text-ods-primary" />
                  <span>Dữ liệu đăng nhập được mã hóa an toàn</span>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ================== GAMER DASHBOARD LAYOUT ================== */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-6"
            >
              {/* LEFT COLUMN: GAMER PROFILE CARD (4 cols) */}
              <div className="lg:col-span-4 rounded-ods border border-ods-border bg-white p-6 space-y-6 shadow-sm">
                {/* User info header */}
                <div className="flex items-center gap-4">
                  {/* Avatar circle */}
                  <div className="h-16 w-16 rounded-full bg-ods-surface border border-ods-border flex items-center justify-center text-black font-extrabold text-2xl shrink-0">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'G'}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-heading text-base font-bold text-black uppercase tracking-wide truncate">
                      {currentUser?.name || 'Game Thủ ODS'}
                    </h2>
                    <p className="text-[10px] text-ods-textMuted mt-0.5 truncate">{currentUser?.email || ''}</p>
                    
                    {/* VIP Tier Badge */}
                    <span className="inline-block mt-2 bg-ods-accent text-black text-[9px] font-extrabold px-2 py-0.5 rounded-sm">
                      MEMBER VIP 1
                    </span>
                  </div>
                </div>

                {/* WALLET CARD BOX */}
                <div className="rounded-ods bg-gradient-to-br from-blue-50/40 via-white to-white border border-blue-100 p-5 space-y-4 shadow-sm hover:shadow-skyGlow transition-shadow duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-[9.5px] text-gray-400 font-bold uppercase tracking-widest">Số dư ví của bạn</span>
                    <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center text-ods-primary">
                      <CreditCard className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div>
                    <span className="text-3xl font-extrabold text-black tracking-tight">
                      {formatCurrency(currentUser?.balance || 0)}
                    </span>
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Nạp tự động VietQR không phí</p>
                    </div>
                  </div>

                  <Link
                    href="/deposit"
                    className="w-full flex items-center justify-center gap-1.5 rounded-ods bg-black hover:bg-ods-primary text-white py-3 text-[10px] font-extrabold uppercase tracking-widest transition-all duration-300 hover:shadow-buttonGlow active:scale-95 cursor-pointer text-center"
                  >
                    Nạp thêm tiền vào ví
                  </Link>
                </div>

                {/* DASHBOARD NAVIGATION */}
                <div className="border-t border-ods-border pt-4 flex flex-col space-y-1">
                  {/* TAB 1: LỊCH SỬ ĐƠN HÀNG */}
                  <button
                    onClick={() => setDashboardTab('orders')}
                    className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      dashboardTab === 'orders'
                        ? 'bg-ods-primary text-white'
                        : 'text-ods-textMuted hover:text-black hover:bg-gray-100'
                    }`}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Lịch Sử Đơn Hàng</span>
                  </button>

                  {/* TAB 1.5: LỊCH SỬ NẠP TIỀN */}
                  <button
                    onClick={() => setDashboardTab('transactions')}
                    className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      dashboardTab === 'transactions'
                        ? 'bg-ods-primary text-white'
                        : 'text-ods-textMuted hover:text-black hover:bg-gray-100'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Lịch Sử Nạp Tiền</span>
                  </button>

                  {/* TAB 2: KHO GAME ĐÃ MUA */}
                  <button
                    onClick={() => setDashboardTab('vault')}
                    className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      dashboardTab === 'vault'
                        ? 'bg-ods-primary text-white'
                        : 'text-ods-textMuted hover:text-black hover:bg-gray-100'
                    }`}
                  >
                    <Key className="h-4 w-4" />
                    <span>Kho Game Đã Mua</span>
                  </button>

                  {/* TAB 3: DANH SÁCH YÊU THÍCH */}
                  <button
                    onClick={() => setDashboardTab('wishlist')}
                    className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      dashboardTab === 'wishlist'
                        ? 'bg-ods-primary text-white'
                        : 'text-ods-textMuted hover:text-black hover:bg-gray-100'
                    }`}
                  >
                    <Heart className="h-4 w-4" />
                    <span>Danh Sách Yêu Thích</span>
                  </button>

                  {/* TAB 4: ĐỔI MẬT KHẨU */}
                  <button
                    onClick={() => setDashboardTab('settings')}
                    className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      dashboardTab === 'settings'
                        ? 'bg-ods-primary text-white'
                        : 'text-ods-textMuted hover:text-black hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Đổi Mật Khẩu</span>
                  </button>

                  {/* LOGOUT */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 transition-all mt-6 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Đăng Xuất</span>
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: DETAIL WORKSPACE (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* TRANSACTIONS TAB */}
                {dashboardTab === 'transactions' && (
                  <div className="rounded-ods border border-ods-border bg-white p-6 space-y-4">
                    <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-black border-b border-ods-border pb-3">
                      Lịch Sử Nạp & Biến Động Số Dư
                    </h3>

                    {isLoadingTransactions ? (
                      <div className="text-center py-12 text-xs text-ods-textMuted">
                        Đang tải lịch sử giao dịch...
                      </div>
                    ) : transactions.length === 0 ? (
                      <div className="text-center py-12 px-4 flex flex-col items-center justify-center space-y-4">
                        <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-ods-primary">
                          <CreditCard className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-black uppercase tracking-wider">Chưa có lịch sử nạp tiền</h4>
                          <p className="text-xs text-ods-textMuted font-light max-w-xs leading-relaxed mx-auto">
                            Bạn chưa có bất kỳ giao dịch nạp tiền nào.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {transactions.map((tx) => (
                          <div key={tx.id} className="rounded-ods border border-ods-border bg-ods-surface p-4 space-y-3.5">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                              <div>
                                <span className="text-[10px] text-ods-textMuted font-mono block mb-1">
                                  {new Date(tx.createdAt).toLocaleDateString('vi-VN', {
                                    year: 'numeric', month: '2-digit', day: '2-digit',
                                    hour: '2-digit', minute: '2-digit',
                                  })}
                                </span>
                                <h4 className="font-heading text-xs font-bold text-black">
                                  {tx.description || 'Nạp tiền vào ví'}
                                </h4>
                                {tx.referenceId && (
                                  <span className="text-[10px] text-ods-textMuted font-mono mt-1 block">
                                    Mã tham chiếu: {tx.referenceId}
                                  </span>
                                )}
                              </div>
                              <div className="text-left sm:text-right shrink-0">
                                <span className={`text-xs font-extrabold block ${tx.type === 'DEPOSIT' ? 'text-emerald-600' : 'text-red-500'}`}>
                                  {tx.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[9.5px] text-emerald-600 font-bold uppercase mt-1">
                                  <CheckCircle2 className="h-3 w-3" /> Thành công
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 1. ORDERS TAB */}
                {dashboardTab === 'orders' && (
                  <div className="rounded-ods border border-ods-border bg-white p-6 space-y-4">
                    <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-black border-b border-ods-border pb-3">
                      Lịch Sử Giao Dịch Đơn Hàng
                    </h3>

                    {isLoadingOrders ? (
                      <div className="text-center py-12 text-xs text-ods-textMuted">
                        Đang tải lịch sử giao dịch...
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12 px-4 flex flex-col items-center justify-center space-y-4">
                        <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-ods-primary">
                          <ShoppingBag className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-black uppercase tracking-wider">Lịch sử giao dịch trống</h4>
                          <p className="text-xs text-ods-textMuted font-light max-w-xs leading-relaxed mx-auto">
                            Bạn chưa thực hiện bất kỳ giao dịch mua hàng nào. Hãy khám phá và mua key game chất lượng tại ODS!
                          </p>
                        </div>
                        <Link
                          href="/"
                          className="inline-flex items-center gap-1.5 rounded-ods bg-black hover:bg-ods-primary text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 hover:shadow-buttonGlow"
                        >
                          <span>Mua Sắm Ngay</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="rounded-ods border border-ods-border bg-ods-surface p-4 space-y-3.5">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                              <div>
                                <span className="text-[10px] text-ods-textMuted font-mono">
                                  {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                <h4 className="font-heading text-xs font-bold uppercase text-black mt-0.5">
                                  Đơn hàng #{order.id.slice(0, 8)}
                                </h4>
                              </div>
                              <div className="text-left sm:text-right shrink-0">
                                <span className="text-xs font-extrabold text-black block">
                                  {formatCurrency(order.netAmount)}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[9.5px] text-emerald-600 font-bold uppercase mt-1">
                                  <CheckCircle2 className="h-3 w-3" /> Hoàn thành
                                </span>
                              </div>
                            </div>

                            {/* KEY DISPLAY ROW */}
                            <div className="space-y-2">
                              {order.gameKeys && order.gameKeys.map((key) => (
                                <div key={key.id} className="flex items-center justify-between gap-3 bg-white border border-dashed border-ods-border p-3 rounded-ods">
                                  <code className="text-xs font-mono text-ods-primary font-bold select-all break-all pr-2">
                                    {key.keyCode}
                                  </code>
                                  <button
                                    onClick={() => handleCopy(key.id, key.keyCode)}
                                    className="flex items-center gap-1 rounded border border-ods-border bg-white px-3 py-1.5 text-[9.5px] font-bold text-black hover:bg-black hover:text-white transition-all shrink-0 cursor-pointer"
                                  >
                                    {copiedKeyId === key.id ? (
                                      <>
                                        <Check className="h-3 w-3 text-emerald-600" />
                                        <span className="text-emerald-600">COPIED</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="h-3 w-3" />
                                        <span>SAO CHÉP</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. KHO GAME ĐÃ MUA TAB */}
                {dashboardTab === 'vault' && (
                  <div className="rounded-ods border border-ods-border bg-white p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-ods-border pb-3 gap-2">
                      <div>
                        <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-black flex items-center gap-2">
                          <Key className="h-4 w-4 text-ods-primary" />
                          <span>KHO GAME ĐÃ MUA (ODS VAULT)</span>
                        </h3>
                        <p className="text-[11px] text-ods-textMuted mt-0.5">Tất cả bản quyền key game & tài khoản dịch vụ bạn đã sở hữu.</p>
                      </div>
                      <Link
                        href="/policies/guide"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-ods-primary uppercase hover:underline"
                      >
                        <span>Hướng dẫn kích hoạt key</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    {isLoadingOrders ? (
                      <div className="text-center py-12 text-xs text-ods-textMuted">
                        Đang tải kho game bản quyền...
                      </div>
                    ) : (() => {
                      const allVaultKeys: any[] = [];
                      orders.forEach((order) => {
                        if (order.gameKeys && order.gameKeys.length > 0) {
                          order.gameKeys.forEach((k: any) => {
                            allVaultKeys.push({
                              id: k.id,
                              orderId: order.id,
                              keyCode: k.keyCode,
                              gameName: k.product?.name || 'Sản Phẩm Bản Quyền ODS',
                              platform: k.product?.platform || 'STEAM',
                              coverImage: k.product?.coverImage || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800',
                              type: k.product?.type || 'KEY_CODE',
                              purchaseDate: new Date(k.createdAt || order.createdAt).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              }),
                            });
                          });
                        }
                      });

                      if (allVaultKeys.length === 0) {
                        return (
                          <div className="text-center py-12 px-4 flex flex-col items-center justify-center space-y-4">
                            <div className="h-14 w-14 rounded-full bg-sky-50 flex items-center justify-center text-ods-primary">
                              <Key className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-black uppercase tracking-wider">Kho game đã mua trống</h4>
                              <p className="text-xs text-ods-textMuted font-light max-w-xs leading-relaxed mx-auto">
                                Bạn chưa sở hữu sản phẩm bản quyền nào trong Kho Key ODS. Hãy khám phá và mua key game chất lượng ngay!
                              </p>
                            </div>
                            <Link
                              href="/"
                              className="inline-flex items-center gap-1.5 rounded-ods bg-black hover:bg-ods-primary text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 hover:shadow-buttonGlow"
                            >
                              <span>Khám Phá Cửa Hàng Ngay</span>
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          {allVaultKeys.map((item) => (
                            <div key={item.id} className="rounded-ods border border-ods-border bg-ods-surface p-4 space-y-3 hover:border-black transition-all">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={item.coverImage}
                                    alt={item.gameName}
                                    className="h-12 w-16 rounded-ods object-cover bg-black border border-ods-border shrink-0"
                                  />
                                  <div>
                                    <h4 className="font-heading text-xs font-bold text-black uppercase">{item.gameName}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[9px] font-extrabold text-black bg-zinc-200 px-2 py-0.5 rounded uppercase">
                                        {item.platform}
                                      </span>
                                      <span className="text-[10px] text-ods-textMuted">
                                        Ngày mua: {item.purchaseDate}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 w-max">
                                  <CheckCircle2 className="h-3 w-3" /> SẴN SÀNG KÍCH HOẠT
                                </span>
                              </div>

                              {/* DYNAMIC CONTENT BLOCK */}
                              {(() => {
                                const isAccount = item.keyCode.includes('|');
                                const isGiftPending = item.keyCode.includes('Chờ ODS') || item.keyCode.includes('Chờ Admin') || item.type === 'GIFT';
                                
                                if (isAccount) {
                                  const [username, password] = item.keyCode.split('|').map((s: string) => s.trim());
                                  return (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                      <div className="flex items-center justify-between gap-3 bg-white border border-ods-border p-2.5 rounded-ods">
                                        <div className="flex flex-col">
                                          <span className="text-[9px] font-bold text-gray-400 uppercase">Tài Khoản</span>
                                          <span className="font-mono font-black text-xs sm:text-sm text-ods-primary select-all truncate">{username}</span>
                                        </div>
                                        <button
                                          onClick={() => handleCopy(`${item.id}-user`, username)}
                                          className="p-1.5 rounded bg-gray-100 hover:bg-black hover:text-white transition-colors"
                                          title="Copy Tài Khoản"
                                        >
                                          {copiedKeyId === `${item.id}-user` ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                        </button>
                                      </div>
                                      <div className="flex items-center justify-between gap-3 bg-white border border-ods-border p-2.5 rounded-ods">
                                        <div className="flex flex-col">
                                          <span className="text-[9px] font-bold text-gray-400 uppercase">Mật Khẩu</span>
                                          <span className="font-mono font-black text-xs sm:text-sm text-ods-primary select-all truncate">{password || 'N/A'}</span>
                                        </div>
                                        <button
                                          onClick={() => handleCopy(`${item.id}-pass`, password)}
                                          className="p-1.5 rounded bg-gray-100 hover:bg-black hover:text-white transition-colors"
                                          title="Copy Mật Khẩu"
                                        >
                                          {copiedKeyId === `${item.id}-pass` ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                }

                                if (isGiftPending) {
                                  return (
                                    <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 p-3 rounded-ods mt-3">
                                      <div className="min-w-0 font-sans font-bold text-xs sm:text-sm text-amber-700 tracking-wide truncate">
                                        {item.keyCode}
                                      </div>
                                    </div>
                                  );
                                }

                                return (
                                  <div className="flex items-center justify-between gap-3 bg-white border border-ods-border p-3 rounded-ods mt-3">
                                    <div className="flex flex-col">
                                      <span className="text-[9px] font-bold text-gray-400 uppercase">Mã Kích Hoạt (Key Code)</span>
                                      <div className="min-w-0 font-mono font-black text-xs sm:text-sm text-ods-primary tracking-wider select-all truncate mt-0.5">
                                        {item.keyCode}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleCopy(item.id, item.keyCode)}
                                      className="flex items-center gap-1 rounded border border-ods-border bg-white px-3 py-1.5 text-[9.5px] font-bold text-black hover:bg-black hover:text-white transition-all shrink-0 cursor-pointer"
                                    >
                                      {copiedKeyId === item.id ? (
                                        <>
                                          <Check className="h-3 w-3 text-emerald-600" />
                                          <span className="text-emerald-600">ĐÃ SAO CHÉP</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="h-3 w-3" />
                                          <span>SAO CHÉP</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                );
                              })()}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 3. WISHLIST TAB */}
                {dashboardTab === 'wishlist' && (
                  <div className="rounded-ods border border-ods-border bg-white p-6 space-y-4">
                    <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-black border-b border-ods-border pb-3">
                      Danh Sách Game Yêu Thích
                    </h3>
                    <div className="text-center py-12 px-4 flex flex-col items-center justify-center space-y-4">
                      <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                        <Heart className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-black uppercase tracking-wider">Danh sách yêu thích trống</h4>
                        <p className="text-xs text-ods-textMuted font-light max-w-xs leading-relaxed mx-auto">
                          Bạn chưa thêm sản phẩm nào vào danh sách yêu thích. Hãy bấm nút ❤️ trên thẻ game để lưu lại!
                        </p>
                      </div>
                      <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 rounded-ods bg-black hover:bg-ods-primary text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 hover:shadow-buttonGlow"
                      >
                        <span>Khám Phá Game Ngay</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* 4. SETTINGS TAB */}
                {dashboardTab === 'settings' && (
                  <div className="rounded-ods border border-ods-border bg-white p-6 space-y-4">
                    <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-black border-b border-ods-border pb-3">
                      Bảo Mật & Đổi Mật Khẩu
                    </h3>
                    <form onSubmit={(e) => { e.preventDefault(); showToast('Đổi mật khẩu thành công!', 'success'); }} className="space-y-4 max-w-md">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 font-bold uppercase block">Mật khẩu hiện tại</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          className="w-full rounded-ods border border-ods-border bg-white py-2 px-3 text-xs font-semibold text-black focus:border-ods-primary focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 font-bold uppercase block">Mật khẩu mới</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          className="w-full rounded-ods border border-ods-border bg-white py-2 px-3 text-xs font-semibold text-black focus:border-ods-primary focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="rounded-ods bg-black hover:bg-ods-primary text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-buttonGlow"
                      >
                        Cập Nhật Mật Khẩu
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-xs font-bold text-ods-textMuted">Đang tải trang cá nhân...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
