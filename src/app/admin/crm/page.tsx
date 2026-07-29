'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { CartProvider } from '@/context/CartContext';
import { useToast } from '@/components/Toast';
import { 
  Users, DollarSign, ShoppingBag, CreditCard, ShieldAlert, 
  Search, Plus, Minus, CheckCircle2, UserCheck, Shield, RefreshCw,
  TrendingUp, PiggyBank, Coins, Receipt, ArrowUpRight, Wallet, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CrmAnalyticsChart } from '@/components/CrmAnalyticsChart';

interface CrmUser {
  id: string;
  name: string;
  email: string;
  role: string;
  balance: number | string;
  createdAt: string;
  _count?: { orders: number; transactions: number };
}

interface Stats {
  totalUsers: number;
  totalBalance: number;
  ordersCount: number;
  totalRevenue: number;
}

interface SteamCapitalRecord {
  id: string;
  amount: number;
  note: string;
  date: string;
}

export default function AdminCrmPage() {
  const router = useRouter();
  const { showToast, confirmAction } = useToast();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Strict Admin Auth Guard Check
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ods_user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user && (user.role === 'ADMIN' || user.email === 'admin@odsstore.vn')) {
          setIsAuthorized(true);
          setIsCheckingAuth(false);
          return;
        }
      }
    } catch (e) {}

    setIsAuthorized(false);
    setIsCheckingAuth(false);
    showToast('⚠️ Vui lòng đăng nhập bằng tài khoản Admin để truy cập!', 'error');
    router.push('/profile');
  }, [router, showToast]);

  const [users, setUsers] = useState<CrmUser[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalBalance: 0,
    ordersCount: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Balance adjustment modal state
  const [selectedUser, setSelectedUser] = useState<CrmUser | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustAction, setAdjustAction] = useState<'add' | 'deduct'>('add');

  // Steam Working Capital State
  const [steamCapitalHistory, setSteamCapitalHistory] = useState<SteamCapitalRecord[]>([]);
  const [isCapitalModalOpen, setIsCapitalModalOpen] = useState(false);
  const [capitalAmountInput, setCapitalAmountInput] = useState('');
  const [capitalNoteInput, setCapitalNoteInput] = useState('');

  // Load Steam Capital history from localStorage
  const loadSteamCapital = () => {
    try {
      const stored = localStorage.getItem('ods_steam_capital');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out sample demo seed cap-1 if present
        const filtered = Array.isArray(parsed) ? parsed.filter((item: any) => item.id !== 'cap-1') : [];
        setSteamCapitalHistory(filtered);
        localStorage.setItem('ods_steam_capital', JSON.stringify(filtered));
      } else {
        setSteamCapitalHistory([]);
        localStorage.setItem('ods_steam_capital', JSON.stringify([]));
      }
    } catch (e) {
      setSteamCapitalHistory([]);
    }
  };

  const fetchCrmData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();

      let fetchedUsers = res.ok && Array.isArray(data.users) ? data.users : [];
      let fetchedStats = data.stats || { totalUsers: 0, totalBalance: 0, ordersCount: 0, totalRevenue: 0 };

      // Also gather users from LocalStorage
      const localUsers: CrmUser[] = [];
      try {
        const storedUser = localStorage.getItem('ods_user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          if (u && u.email) {
            localUsers.push({
              id: u.id || 'u-local-1',
              name: u.name || 'Khách hàng ODS',
              email: u.email,
              role: u.role || 'USER',
              balance: u.balance || 0,
              createdAt: new Date().toISOString(),
              _count: { orders: 1, transactions: 1 },
            });
          }
        }
        const registeredStr = localStorage.getItem('ods_registered_users');
        if (registeredStr) {
          const regList = JSON.parse(registeredStr);
          if (Array.isArray(regList)) {
            regList.forEach((u: any, idx: number) => {
              if (u && u.email && !localUsers.some((lu) => lu.email === u.email)) {
                localUsers.push({
                  id: u.id || `u-reg-${idx}`,
                  name: u.name || 'Khách hàng mới',
                  email: u.email,
                  role: u.role || 'USER',
                  balance: u.balance || 0,
                  createdAt: u.createdAt || new Date().toISOString(),
                  _count: { orders: 0, transactions: 0 },
                });
              }
            });
          }
        }
      } catch (e) {}

      // Merge fetched & local users
      const mergedUsers = [...fetchedUsers];
      localUsers.forEach((lu) => {
        if (!mergedUsers.some((u) => u.email === lu.email || u.id === lu.id)) {
          mergedUsers.push(lu);
        }
      });

      // Preserve admin balance or insert default master admin if absent
      let adminIndex = mergedUsers.findIndex((u) => u.email === 'admin@odsstore.vn');
      if (adminIndex === -1) {
        mergedUsers.unshift({
          id: 'admin-id-master',
          name: 'ODS ADMIN',
          email: 'admin@odsstore.vn',
          role: 'ADMIN',
          balance: 0,
          createdAt: new Date().toISOString(),
          _count: { orders: 99, transactions: 99 },
        });
      }

      setUsers(mergedUsers);

      const calculatedTotalBal = mergedUsers.reduce((sum, u) => sum + Number(u.balance || 0), 0);
      setStats({
        totalUsers: mergedUsers.length,
        totalBalance: calculatedTotalBal,
        ordersCount: fetchedStats.ordersCount || 0,
        totalRevenue: fetchedStats.totalRevenue || 0,
      });
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu CRM:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchCrmData();
      loadSteamCapital();
    }
  }, [isAuthorized]);

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + ' đ';

  // Calculate CRM Financial Accounting
  const totalSteamCapital = useMemo(() => {
    return steamCapitalHistory.reduce((sum, item) => sum + item.amount, 0);
  }, [steamCapitalHistory]);

  // Estimated Cost of Goods Sold (COGS) ~ 70% of gross revenue
  const estimatedCOGS = useMemo(() => {
    return Math.round(stats.totalRevenue * 0.7);
  }, [stats.totalRevenue]);

  const netProfit = useMemo(() => {
    return Math.max(0, stats.totalRevenue - estimatedCOGS);
  }, [stats.totalRevenue, estimatedCOGS]);

  const remainingSteamPool = useMemo(() => {
    return Math.max(0, totalSteamCapital - estimatedCOGS);
  }, [totalSteamCapital, estimatedCOGS]);

  const profitMargin = useMemo(() => {
    if (stats.totalRevenue === 0) return 0;
    return Math.round((netProfit / stats.totalRevenue) * 100);
  }, [netProfit, stats.totalRevenue]);

  // Helper handlers for live formatted currency inputs with dots
  const handleCapitalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '');
    if (!rawDigits) {
      setCapitalAmountInput('');
      return;
    }
    setCapitalAmountInput(Number(rawDigits).toLocaleString('vi-VN'));
  };

  const handleAdjustAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '');
    if (!rawDigits) {
      setAdjustAmount('');
      return;
    }
    setAdjustAmount(Number(rawDigits).toLocaleString('vi-VN'));
  };

  // Handle Recording New Steam Capital Deposit
  const handleAddSteamCapital = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(capitalAmountInput.replace(/\./g, ''));
    if (isNaN(amount) || amount <= 0) {
      showToast('Số tiền vốn nạp không hợp lệ!', 'error');
      return;
    }

    const newRecord: SteamCapitalRecord = {
      id: `cap-${Date.now()}`,
      amount,
      note: capitalNoteInput.trim() || 'Nạp vốn Steam/Nhà cung cấp',
      date: new Date().toISOString(),
    };

    const updated = [newRecord, ...steamCapitalHistory];
    setSteamCapitalHistory(updated);
    localStorage.setItem('ods_steam_capital', JSON.stringify(updated));

    showToast(`Đã ghi nhận nạp ${formatCurrency(amount)} vốn vào Steam!`, 'success');
    setCapitalAmountInput('');
    setCapitalNoteInput('');
    setIsCapitalModalOpen(false);
  };

  // Handle Adjusting User Wallet Balance
  const handleAdjustBalance = async () => {
    if (!selectedUser) return;
    const amountNum = parseFloat(adjustAmount.replace(/\./g, ''));

    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Vui lòng nhập số tiền hợp lệ!', 'error');
      return;
    }

    const currentBal = Number(selectedUser.balance || 0);
    const delta = adjustAction === 'add' ? amountNum : -amountNum;
    const newBalance = Math.max(0, currentBal + delta);

    setIsLoading(true);

    try {
      // 1. Send update request to server
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          email: selectedUser.email,
          balance: newBalance,
        }),
      });

      // 2. Update LocalStorage ods_user if editing active logged-in account
      try {
        const storedUser = localStorage.getItem('ods_user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          if (u && (u.id === selectedUser.id || u.email === selectedUser.email)) {
            u.balance = newBalance;
            localStorage.setItem('ods_user', JSON.stringify(u));
          }
        }
      } catch (e) {}

      // 3. Update LocalStorage ods_registered_users list
      try {
        const regStr = localStorage.getItem('ods_registered_users');
        if (regStr) {
          const regList = JSON.parse(regStr);
          if (Array.isArray(regList)) {
            const idx = regList.findIndex((u: any) => u && (u.id === selectedUser.id || u.email === selectedUser.email));
            if (idx !== -1) {
              regList[idx].balance = newBalance;
            } else {
              regList.push({ ...selectedUser, balance: newBalance });
            }
            localStorage.setItem('ods_registered_users', JSON.stringify(regList));
          }
        }
      } catch (e) {}

      // 4. Update in-memory user balance state
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === selectedUser.id || u.email === selectedUser.email ? { ...u, balance: newBalance } : u
        )
      );

      // 5. Dispatch events to refresh Header balance badge & Profile page instantly
      window.dispatchEvent(new Event('ods_user_update'));
      window.dispatchEvent(new Event('storage'));

      showToast(`Đã ${adjustAction === 'add' ? 'cộng' : 'trừ'} ${formatCurrency(delta)} vào ví của ${selectedUser.name || selectedUser.email}!`, 'success');
      setSelectedUser(null);
      setAdjustAmount('');
      fetchCrmData();
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi cập nhật ví!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle User Role
  const handleToggleRole = (user: CrmUser) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    confirmAction({
      title: 'Đổi Vai Trò Tài Khoản',
      message: `Bạn có chắc muốn đổi vai trò của ${user.email} thành ${newRole}?`,
      confirmText: 'Đồng Ý Đổi',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              email: user.email,
              role: newRole,
            }),
          });

          if (res.ok) {
            showToast(`Đã đổi vai trò của ${user.email} thành ${newRole} thành công!`, 'success');
            fetchCrmData();
          } else {
            showToast('Lỗi khi đổi vai trò tài khoản!', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Có lỗi máy chủ xảy ra!', 'error');
        }
      },
    });
  };

  const filteredUsers = users.filter((u) => {
    return (
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-4 border-ods-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Đang xác thực quyền truy cập Admin...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto font-black text-xl">
            🚫
          </div>
          <h2 className="font-heading text-lg font-extrabold text-black uppercase">TRUY CẬP BỊ TỪ CHỐI</h2>
          <p className="text-xs text-gray-600 font-light leading-relaxed">
            Bạn chưa đăng nhập hoặc không có quyền Quản Trị Viên (Admin) để truy cập trang quản lý người dùng.
          </p>
          <button
            onClick={() => router.push('/profile')}
            className="w-full rounded-ods bg-black hover:bg-zinc-800 text-white py-3 text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            Đăng Nhập Tài Khoản Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col antialiased">
        <Header />

        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {/* HEADER BAR */}
          <div className="border-b border-ods-border pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] text-ods-primary font-bold tracking-widest uppercase">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>ODS CRM & STEAM FINANCIAL MANAGEMENT</span>
              </div>
              <h1 className="font-heading text-2xl font-extrabold tracking-wider uppercase mt-1">
                HỆ THỐNG CRM QUẢN LÝ VỐN STEAM & KHÁCH HÀNG
              </h1>
              <p className="text-xs text-ods-textMuted mt-0.5">
                Quản lý vốn nạp Steam, doanh thu bán lẻ, giá vốn, lợi nhuận ròng và ví tài khoản người dùng.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCapitalModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-ods bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-md px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>+ Nạp Vốn Steam / Nhập Hàng</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  fetchCrmData();
                  loadSteamCapital();
                  showToast('Đã cập nhật dữ liệu CRM mới nhất!', 'info');
                }}
                className="inline-flex items-center gap-2 rounded-ods border border-ods-border bg-white hover:bg-ods-surface px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-all cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 text-ods-primary" />
                <span>Làm Mới</span>
              </button>
            </div>
          </div>

          {/* FINANCIAL ACCOUNTING CARDS GRID (Steam Capital & Revenue Accounting) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {/* 1. STEAM WORKING CAPITAL DEPOSITED */}
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-5 space-y-2 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                  <PiggyBank className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Tổng Vốn Nạp Steam</span>
                </span>
                <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  <Coins className="h-4 w-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-emerald-950 block">{formatCurrency(totalSteamCapital)}</span>
              <div className="flex items-center justify-between text-[10px] text-emerald-700 font-bold pt-1 border-t border-emerald-200/60">
                <span>Vốn Steam Còn Lại:</span>
                <span className="font-extrabold text-emerald-900">{formatCurrency(remainingSteamPool)}</span>
              </div>
            </div>

            {/* 2. GROSS REVENUE */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest">Tổng Doanh Thu Bán Lẻ</span>
                <div className="h-7 w-7 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-zinc-900 block">{formatCurrency(stats.totalRevenue)}</span>
              <p className="text-[10px] text-zinc-500 font-medium">Từ {stats.ordersCount} đơn hàng hoàn thành</p>
            </div>

            {/* 3. NET PROFIT & MARGIN */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest">Lợi Nhuận Ròng Ước Tính</span>
                <div className="h-7 w-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-amber-600 block">{formatCurrency(netProfit)}</span>
              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold pt-1 border-t border-zinc-150">
                <span>Tỷ Suất Lợi Nhuận:</span>
                <span className="font-black text-emerald-600">~{profitMargin}%</span>
              </div>
            </div>

            {/* 4. TOTAL CUSTOMER WALLET BALANCES */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest">Tổng Ví Khách Hàng</span>
                <div className="h-7 w-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                  <CreditCard className="h-4 w-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-zinc-900 block">{formatCurrency(stats.totalBalance)}</span>
              <p className="text-[10px] text-purple-700 font-bold">{stats.totalUsers} tài khoản khách hàng</p>
            </div>
          </div>

          {/* INTERACTIVE ANALYTICS CHART (TỪNG NGÀY, TỪNG THÁNG, TỪNG NĂM) */}
          <CrmAnalyticsChart
            revenueTotal={stats.totalRevenue}
            capitalTotal={totalSteamCapital}
            netProfitTotal={netProfit}
          />

          {/* STEAM CAPITAL DEPOSIT HISTORY LOG */}
          <div className="mb-10 bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <History className="h-4 w-4 text-emerald-600" />
                <span>Lịch Sử Nạp Tiền Vốn Vào Steam / Nhà Cung Cấp:</span>
              </h2>
              <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Tổng nạp: {formatCurrency(totalSteamCapital)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Mã Vốn</th>
                    <th className="py-2.5 px-3">Số Tiền Nạp</th>
                    <th className="py-2.5 px-3">Ghi Chú</th>
                    <th className="py-2.5 px-3">Thời Gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150">
                  {steamCapitalHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-xs text-zinc-500 font-medium">
                        Chưa có lịch sử nạp vốn Steam nào. Bấm <strong className="text-emerald-700 font-extrabold">+ NẠP VỐN STEAM / NHẬP HÀNG</strong> góc trên để ghi nhận đợt nạp tiền đầu tiên!
                      </td>
                    </tr>
                  ) : (
                    steamCapitalHistory.map((cap) => (
                      <tr key={cap.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-zinc-600">{cap.id}</td>
                        <td className="py-3 px-3 font-extrabold text-emerald-700">{formatCurrency(cap.amount)}</td>
                        <td className="py-3 px-3 text-zinc-800 font-medium">{cap.note}</td>
                        <td className="py-3 px-3 text-zinc-400 text-[11px]">
                          {new Date(cap.date).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* CUSTOMERS MANAGEMENT SECTION */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-xs overflow-hidden space-y-4 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="font-heading text-xs font-extrabold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                <UserCheck className="h-4.5 w-4.5 text-sky-600" /> DANH SÁCH KHÁCH HÀNG & SỐ DƯ VÍ
              </h2>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-4 text-xs font-semibold text-zinc-900 placeholder-zinc-400 focus:border-sky-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* USERS TABLE */}
            <div className="overflow-x-auto border border-zinc-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Tài Khoản / Email</th>
                    <th className="py-3 px-4">Vai Trò</th>
                    <th className="py-3 px-4">Số Dư Ví</th>
                    <th className="py-3 px-4">Đơn Hàng</th>
                    <th className="py-3 px-4 text-right">Thao Tác Quản Trị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-zinc-400">
                        Không tìm thấy tài khoản nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const numBal = typeof user.balance === 'string' ? parseFloat(user.balance) : Number(user.balance);

                      return (
                        <tr key={user.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="py-3.5 px-4 font-semibold">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs shrink-0">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <span className="font-extrabold text-zinc-900 block">{user.name || 'Khách hàng ODS'}</span>
                                <span className="text-[11px] text-zinc-400 font-mono">{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => handleToggleRole(user)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                                user.role === 'ADMIN'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                  : 'bg-zinc-100 text-zinc-700 border border-zinc-200 hover:bg-sky-50'
                              }`}
                            >
                              {user.role}
                            </button>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-zinc-900 text-sm">{formatCurrency(numBal)}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-zinc-600 font-bold">{user._count?.orders || 0} đơn</span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUser(user);
                                setAdjustAmount('');
                                setAdjustAction('add');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs transition-all shadow-2xs active:scale-95 cursor-pointer"
                            >
                              ĐIỀU CHỈNH VÍ
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* MODAL 1: STEAM CAPITAL DEPOSIT MODAL */}
        <AnimatePresence>
          {isCapitalModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-zinc-200 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
                  <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <PiggyBank className="h-5 w-5 text-emerald-600" />
                    <span>NẠP VỐN STEAM / NHẬP HÀNG</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsCapitalModalOpen(false)}
                    className="text-zinc-400 hover:text-zinc-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddSteamCapital} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Số Tiền Vốn Nạp (VNĐ):
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: 20.000.000 (20 Triệu)"
                      value={capitalAmountInput}
                      onChange={handleCapitalAmountChange}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white tracking-wide"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Ghi Chú Nạp Vốn:
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Nạp Steam Wallet qua Visa đợt Sale mùa hè..."
                      value={capitalNoteInput}
                      onChange={(e) => setCapitalNoteInput(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCapitalModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-extrabold hover:bg-emerald-700 shadow-sm"
                    >
                      Xác Nhận Nạp Vốn
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL 2: USER BALANCE ADJUSTMENT MODAL */}
        <AnimatePresence>
          {selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-zinc-200 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
                  <h3 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                    ĐIỀU CHỈNH SỐ DƯ VÍ
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="text-zinc-400 hover:text-zinc-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-xs">
                  <span className="text-zinc-500 block font-medium">Tài khoản:</span>
                  <span className="font-extrabold text-zinc-900">{selectedUser.name || 'Khách hàng'}</span>
                  <span className="text-zinc-400 block font-mono text-[11px]">{selectedUser.email}</span>
                  <div className="mt-2 pt-2 border-t border-zinc-200 flex justify-between">
                    <span className="text-zinc-500">Số dư hiện tại:</span>
                    <span className="font-extrabold text-sky-600">{formatCurrency(Number(selectedUser.balance || 0))}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustAction('add')}
                      className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                        adjustAction === 'add'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-white'
                      }`}
                    >
                      + Cộng Tiền
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustAction('deduct')}
                      className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all border cursor-pointer ${
                        adjustAction === 'deduct'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-white'
                      }`}
                    >
                      - Trừ Tiền
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Số Tiền Điều Chỉnh (VNĐ):
                    </label>
                    <input
                      type="text"
                      placeholder="VD: 500.000"
                      value={adjustAmount}
                      onChange={handleAdjustAmountChange}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-bold focus:outline-none focus:border-sky-500 focus:bg-white tracking-wide"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleAdjustBalance}
                    className="px-5 py-2 rounded-xl bg-sky-600 text-white text-xs font-extrabold hover:bg-sky-700 shadow-sm"
                  >
                    Lưu Thay Đổi Ví
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <Footer />
      </div>
  );
}
