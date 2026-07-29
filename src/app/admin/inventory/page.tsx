'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { showToast } from '@/components/Toast';
import { 
  Key, Gift, User, ShieldCheck, Plus, Search, CheckCircle2, 
  Clock, AlertTriangle, Copy, Trash2, Edit3, Send, RefreshCw,
  Layers, Lock, Database, Package, Sparkles, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface InventoryKeyItem {
  id: string;
  productId: string;
  productName: string;
  variantName?: string;
  type: 'AUTO_KEY' | 'GIFT' | 'SHARED' | 'OFFLINE' | 'NEW_ACC';
  keyOrAccount: string; // CD Key or Username|Password|Auth
  notes?: string;
  status: 'AVAILABLE' | 'DELIVERED' | 'GIFT_PENDING';
  assignedOrderCode?: string;
  assignedUserEmail?: string;
  createdAt: string;
  deliveredAt?: string;
}

export default function AdminInventoryPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<'ALL' | 'AUTO_KEY' | 'GIFT' | 'SHARED' | 'OFFLINE' | 'NEW_ACC'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'DELIVERED' | 'GIFT_PENDING'>('ALL');

  // Inventory Data State
  const [inventoryList, setInventoryList] = useState<InventoryKeyItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add Item Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('Dying Light: The Beast');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [deliveryTypeInput, setDeliveryTypeInput] = useState<'AUTO_KEY' | 'GIFT' | 'SHARED' | 'OFFLINE' | 'NEW_ACC'>('AUTO_KEY');
  const [bulkInputText, setBulkInputText] = useState('');
  const [modalNotes, setModalNotes] = useState('');

  // Gift Process Modal State
  const [selectedGiftItem, setSelectedGiftItem] = useState<InventoryKeyItem | null>(null);
  const [giftConfirmLink, setGiftConfirmLink] = useState('');

  // Custom Confirmation Modal State (No native browser popups)
  const [isQuickGiftModalOpen, setIsQuickGiftModalOpen] = useState(false);
  const [quickGiftProduct, setQuickGiftProduct] = useState('');
  const [quickGiftVariant, setQuickGiftVariant] = useState('');
  const [quickGiftQuantity, setQuickGiftQuantity] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const triggerConfirm = (title: string, message: string, onConfirm: () => void, confirmText = 'Xác Nhận Xóa') => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      onConfirm: () => {
        onConfirm();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Dynamic Admin Products loaded from Quản lý sản phẩm (localStorage ods_admin_products & API)
  const [adminProductsList, setAdminProductsList] = useState<{ id: string; title: string; deliveryType?: string; variants?: any[] }[]>([]);

  // Load Admin Products from localStorage and API
  useEffect(() => {
    const loadProducts = async () => {
      let list: { id: string; title: string; deliveryType?: string; variants?: any[] }[] = [];
      try {
        const stored = localStorage.getItem('ods_admin_products');
        if (stored) {
          const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              list = parsed.map((p: any) => ({
                id: p.id || p.slug || p.title,
                title: p.title || p.name || 'Sản phẩm không tên',
                deliveryType: p.deliveryType,
                variants: p.variants,
              }));
            }
        }
      } catch (e) {
        console.error('Error loading ods_admin_products:', e);
      }

      // If local storage is empty, fallback to fetching /api/products
      if (list.length === 0) {
        try {
          const res = await fetch('/api/products');
          if (res.ok) {
            const data = await res.json();
            const rawList = data.products || data || [];
              if (Array.isArray(rawList)) {
                list = rawList.map((p: any) => ({
                  id: p.id || p.slug || p.title,
                  title: p.name || p.title || 'Sản phẩm không tên',
                  deliveryType: p.deliveryMethod || p.type || 'AUTO_KEY',
                  variants: p.variants,
                }));
              }
          }
        } catch (err) {
          console.error('Error fetching /api/products:', err);
        }
      }

      // Default seed fallbacks if still empty
      if (list.length === 0) {
        list = [
          { id: '1', title: 'Dying Light: The Beast', deliveryType: 'SHARED' },
          { id: '2', title: 'Resident Evil Requiem', deliveryType: 'GIFT' },
          { id: '3', title: 'Palworld', deliveryType: 'AUTO_KEY' },
          { id: '4', title: 'Black Myth: Wukong', deliveryType: 'OFFLINE' },
        ];
      }

      setAdminProductsList(list);
      if (list.length > 0) {
        setSelectedProduct(list[0].title);
        setQuickGiftProduct(list[0].title);
      }
    };

    loadProducts();
  }, []);

  const handleQuickGiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quickGiftQuantity < 1 || quickGiftQuantity > 100) {
      showToast('Số lượng phải từ 1 đến 100', 'error');
      return;
    }

    const prod = adminProductsList.find(p => p.title === quickGiftProduct);
    if (!prod) {
      showToast('Không tìm thấy sản phẩm này trong DB', 'error');
      return;
    }

    const lines = Array(quickGiftQuantity).fill('Chờ ODS Liên Hệ & Gửi Gift');

    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: prod.id, 
          keys: lines,
          variantName: null
        }),
      });
      if (res.ok) {
        showToast(`Đã tạo nhanh ${quickGiftQuantity} Gift cho sản phẩm ${prod.title}!`, 'success');
        setIsQuickGiftModalOpen(false);
        setQuickGiftQuantity(1);
        loadInventory();
      } else {
        showToast('Lỗi khi tạo nhanh, vui lòng thử lại!', 'error');
      }
    } catch (err) {
      showToast('Lỗi mạng', 'error');
    }
  };

  // Auth Check
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ods_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u.role === 'ADMIN') {
          setCurrentUser(u);
          setIsCheckingAuth(false);
          return;
        }
      }
    } catch (e) {}

    setIsCheckingAuth(false);
    showToast('⚠️ Vui lòng đăng nhập bằng tài khoản Admin để truy cập!', 'error');
    router.push('/profile');
  }, [router]);

  // Load Inventory from API
  const loadInventory = async () => {
    try {
      const res = await fetch('/api/admin/keys');
      if (res.ok) {
        const data = await res.json();
        const mappedKeys: InventoryKeyItem[] = data.keys.map((k: any) => {
          let itemType = k.product?.deliveryMethod || k.product?.type || 'AUTO_KEY';
          if (k.keyCode && k.keyCode.includes('Chờ ODS Liên Hệ & Gửi Gift')) {
            itemType = 'GIFT';
          }
          return {
            id: k.id,
            productId: k.productId,
            productName: k.product?.name || 'Unknown',
            variantName: k.variantName,
            type: itemType,
            keyOrAccount: k.keyCode,
            status: k.status === 'AVAILABLE' ? 'AVAILABLE' : 'DELIVERED', // Simplify status map
            assignedOrderCode: k.order?.id?.slice(0, 8),
            assignedUserEmail: k.user?.email,
            createdAt: k.createdAt,
            deliveredAt: k.soldAt,
          };
        });
        setInventoryList(mappedKeys);
      }
    } catch (e) {
      console.error(e);
      showToast('Lỗi tải danh sách kho', 'error');
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const saveInventory = (items: InventoryKeyItem[]) => {
    setInventoryList(items);
    // Legacy support disabled, relying entirely on DB
  };

  // Handle Bulk Import Keys/Accounts via API
  const handleBulkAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkInputText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      showToast('Vui lòng nhập ít nhất 1 Key hoặc Tài Khoản!', 'error');
      return;
    }

    const prod = adminProductsList.find(p => p.title === selectedProduct);
    if (!prod) {
      showToast('Không tìm thấy sản phẩm này trong DB', 'error');
      return;
    }

    if (Array.isArray(prod.variants) && prod.variants.length > 0 && !selectedVariant) {
      showToast('Vui lòng chọn Gói Thời Hạn!', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: prod.id, 
          keys: lines,
          variantName: selectedVariant || null 
        }),
      });
      if (res.ok) {
        showToast(`Đã thêm thành công ${lines.length} Key/Tài khoản mới!`, 'success');
        setBulkInputText('');
        setModalNotes('');
        setIsAddModalOpen(false);
        loadInventory();
      } else {
        showToast('Lỗi khi thêm kho, vui lòng thử lại!', 'error');
      }
    } catch (err) {
      showToast('Lỗi mạng', 'error');
    }
  };

  // Handle Confirming Admin Gift Sent (We don't need to update GameKey for this demo because GIFT_PENDING is usually updated via Orders page now, but we'll mock it here for UI consistency)
  const handleConfirmGiftSent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGiftItem) return;

    const updated = inventoryList.map((item) => {
      if (item.id === selectedGiftItem.id) {
        return {
          ...item,
          status: 'DELIVERED' as const,
          keyOrAccount: giftConfirmLink.trim() || 'Gift Game đã được Admin gửi thành công tới tài khoản Steam của bạn!',
          deliveredAt: new Date().toISOString(),
        };
      }
      return item;
    });

    saveInventory(updated);
    showToast(`Đã xác nhận gửi Gift Game cho đơn hàng ${selectedGiftItem.assignedOrderCode || ''}!`, 'success');
    setSelectedGiftItem(null);
    setGiftConfirmLink('');
  };

  // Delete item with custom confirmation modal and API
  const handleDeleteItem = (id: string) => {
    triggerConfirm(
      'XÓA KEY / TÀI KHOẢN KHỎI KHO',
      'Bạn có chắc chắn muốn xóa Key / Tài khoản này khỏi kho? Thao tác này không thể hoàn tác.',
      async () => {
        try {
          const res = await fetch(`/api/admin/keys?id=${id}`, { method: 'DELETE' });
          if (res.ok) {
            showToast('Đã xóa sản phẩm khỏi kho thành công!', 'success');
            loadInventory();
          } else {
            showToast('Không thể xóa sản phẩm', 'error');
          }
        } catch (e) {
          showToast('Lỗi mạng', 'error');
        }
      },
      'Đồng Ý'
    );
  };

  // Copy to clipboard helper
  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Đã sao chép vào bộ nhớ tạm!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return inventoryList.filter((item) => {
      const matchesTab = activeTab === 'ALL' || item.type === activeTab;
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchesSearch =
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.keyOrAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.assignedOrderCode && item.assignedOrderCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.assignedUserEmail && item.assignedUserEmail.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesTab && matchesStatus && matchesSearch;
    });
  }, [inventoryList, activeTab, statusFilter, searchTerm]);

  // Inventory Stats
  const stats = useMemo(() => {
    const total = inventoryList.length;
    const available = inventoryList.filter((i) => i.status === 'AVAILABLE').length;
    const delivered = inventoryList.filter((i) => i.status === 'DELIVERED').length;
    const giftPending = inventoryList.filter((i) => i.status === 'GIFT_PENDING').length;
    return { total, available, delivered, giftPending };
  }, [inventoryList]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-xs font-bold text-zinc-400">
        Đang kiểm tra quyền Admin...
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-white text-black flex flex-col antialiased">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* HEADER BAR & TITLE */}
        <div className="border-b border-zinc-200 pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-6 w-6 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs font-extrabold shadow-sm">
                3
              </span>
              <h1 className="font-heading text-lg font-black uppercase tracking-wider text-zinc-900">
                QUẢN LÝ TÀI KHOẢN & KEY SẢN PHẨM (KHO VẬT LÝ)
              </h1>
            </div>
            <p className="text-xs text-zinc-500 font-medium">
              Quản lý kho CD-Key tự động, hàng chờ Gift Game Steam, tài khoản dùng chung & tài khoản offline
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsQuickGiftModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Gift className="h-4 w-4" />
              <span>Tạo Gift Nhanh</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm Key / Tài Khoản Mới</span>
            </button>
          </div>
        </div>

        {/* 4 STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider block">Tổng Kho Tồn</span>
              <span className="text-2xl font-black text-zinc-900">{stats.total} món</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-zinc-200 text-zinc-700">
              <Database className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-sky-50/70 rounded-2xl p-4 border border-sky-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-sky-900 uppercase tracking-wider block">Key/Tài Khoản Sẵn Sàng</span>
              <span className="text-2xl font-black text-sky-700">{stats.available} món</span>
            </div>
            <div className="p-3 rounded-xl bg-sky-600 text-white shadow-xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider block">Hàng Chờ Gift Game</span>
              <span className="text-2xl font-black text-amber-700">{stats.giftPending} đơn</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-500 text-white shadow-xs animate-pulse">
              <Gift className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider block">Đã Giao Cho Khách</span>
              <span className="text-2xl font-black text-emerald-700">{stats.delivered} món</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Send className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* GIFT PENDING NOTIFICATION QUEUE BANNER */}
        {stats.giftPending > 0 && (
          <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 border-2 border-amber-400/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-sm shrink-0">
                <Gift className="h-6 w-6 animate-bounce" />
              </div>
              <div>
                <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-2">
                  <span>CẢNH BÁO 🔔 BÁO ĐỘNG HÀNG CHỜ GIFT GAME STEAM ({stats.giftPending})</span>
                </h3>
                <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
                  Khách hàng vừa mua Game Gift Steam. Admin cần truy cập ứng dụng Steam để gửi Gift Game theo yêu cầu!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('GIFT');
                setStatusFilter('GIFT_PENDING');
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition-all shadow-xs shrink-0 cursor-pointer"
            >
              Xử Lý Đơn Gift Ngay ➔
            </button>
          </div>
        )}

        {/* TABS & FILTERS */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
            {/* 5 DELIVERY TYPE TABS */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-zinc-100 border border-zinc-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'ALL' ? 'bg-white text-sky-700 shadow-xs font-black' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Tất Cả Kho
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('AUTO_KEY')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'AUTO_KEY' ? 'bg-white text-sky-700 shadow-xs font-black' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Key className="h-3.5 w-3.5 text-sky-600" /> Key Tự Động
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('GIFT')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'GIFT' ? 'bg-white text-purple-700 shadow-xs font-black' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Gift className="h-3.5 w-3.5 text-purple-600" /> Gift Tài Khoản
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('SHARED')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'SHARED' ? 'bg-white text-teal-700 shadow-xs font-black' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <User className="h-3.5 w-3.5 text-teal-600" /> TK Dùng Chung
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('OFFLINE')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'OFFLINE' ? 'bg-white text-amber-700 shadow-xs font-black' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Lock className="h-3.5 w-3.5 text-amber-600" /> TK Offline
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('NEW_ACC')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'NEW_ACC' ? 'bg-white text-indigo-700 shadow-xs font-black' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" /> TK Mới / Chính Chủ
              </button>
            </div>

            {/* STATUS FILTER DROPDOWN */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-zinc-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-800 font-bold focus:outline-none focus:border-sky-500"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="AVAILABLE">Sẵn sàng (Chưa bán)</option>
                <option value="GIFT_PENDING">Chờ Admin Gift</option>
                <option value="DELIVERED">Đã giao cho khách</option>
              </select>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo Tên game, Chuỗi Key, Mã Đơn Hàng hoặc Email Khách Hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 font-semibold focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
            />
          </div>

          {/* INVENTORY TABLE */}
          <div className="overflow-x-auto border border-zinc-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Sản Phẩm Game</th>
                  <th className="py-3 px-4">Hình Thức Giao</th>
                  <th className="py-3 px-4">Nội Dung Key / Tài Khoản Mật Khẩu</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4">Thông Tin Khách Nhận</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-zinc-400 font-medium">
                      Không tìm thấy sản phẩm hoặc Key nào phù hợp trong kho.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => {
                    return (
                      <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-extrabold text-zinc-900 max-w-[180px] truncate">
                          {item.productName}
                          {item.variantName && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold border border-sky-200 uppercase">
                              {item.variantName}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                              item.type === 'AUTO_KEY'
                                ? 'bg-sky-100 text-sky-800 border-sky-200'
                                : item.type === 'GIFT'
                                ? 'bg-purple-100 text-purple-800 border-purple-200'
                                : item.type === 'SHARED'
                                ? 'bg-teal-100 text-teal-800 border-teal-200'
                                : item.type === 'OFFLINE'
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                            }`}
                          >
                            {item.type === 'AUTO_KEY'
                              ? '⚡ Key Tự Động'
                              : item.type === 'GIFT'
                              ? '🎁 Gift Tài Khoản'
                              : item.type === 'SHARED'
                              ? '🔑 TK Dùng Chung'
                              : item.type === 'OFFLINE'
                              ? '🎮 TK Offline'
                              : '✨ TK Mới'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs font-mono text-[11px] font-bold text-zinc-800">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate select-all">{item.keyOrAccount}</span>
                            <button
                              type="button"
                              onClick={() => copyText(item.keyOrAccount, item.id)}
                              className="p-1 rounded hover:bg-zinc-200 text-zinc-500 shrink-0"
                              title="Sao chép"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {item.status === 'AVAILABLE' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-200 inline-flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Sẵn Sàng
                            </span>
                          ) : item.status === 'GIFT_PENDING' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-200 inline-flex items-center gap-1 animate-pulse">
                              <Clock className="h-3 w-3 text-amber-600" /> Chờ Admin Gift
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-extrabold border border-zinc-200 inline-flex items-center gap-1">
                              <Send className="h-3 w-3 text-zinc-500" /> Đã Giao Khách
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {item.assignedOrderCode ? (
                            <div>
                              <span className="font-mono font-extrabold text-sky-700 block">{item.assignedOrderCode}</span>
                              <span className="text-[10.5px] text-zinc-400 font-medium block truncate max-w-[140px]">
                                {item.assignedUserEmail}
                              </span>
                            </div>
                          ) : (
                            <span className="text-zinc-400 text-[11px] italic">Chưa phân phối</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status === 'GIFT_PENDING' && (
                              <button
                                type="button"
                                onClick={() => setSelectedGiftItem(item)}
                                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] shadow-2xs active:scale-95 cursor-pointer flex items-center gap-1"
                              >
                                <Send className="h-3 w-3" />
                                <span>Gửi Gift</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                              title="Xóa khỏi kho"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
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

      {/* MODAL 1: BULK ADD KEY / ACCOUNT MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-zinc-200 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                  <Plus className="h-4 w-4 text-sky-600" />
                  <span>THÊM KEY / TÀI KHOẢN VÀO KHO VẬT LÝ</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-zinc-400 hover:text-zinc-700 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleBulkAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Chọn Sản Phẩm:
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => {
                      const selectedTitle = e.target.value;
                      setSelectedProduct(selectedTitle);
                      setSelectedVariant('');
                      // Auto pre-select matching delivery type if defined
                      const foundProd = adminProductsList.find((p) => p.title === selectedTitle);
                      if (foundProd && foundProd.deliveryType) {
                        setDeliveryTypeInput(foundProd.deliveryType as any);
                        if (foundProd.deliveryType === 'GIFT') {
                          setBulkInputText('Chờ ODS Liên Hệ & Gửi Gift');
                        }
                      }
                    }}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-bold focus:outline-none focus:border-sky-500"
                  >
                    {adminProductsList.map((p) => (
                      <option key={p.id} value={p.title}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                {(() => {
                  const foundProd = adminProductsList.find((p) => p.title === selectedProduct);
                  if (foundProd && Array.isArray(foundProd.variants) && foundProd.variants.length > 0) {
                    return (
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          Chọn Gói Thời Hạn:
                        </label>
                        <select
                          value={selectedVariant}
                          onChange={(e) => setSelectedVariant(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-bold focus:outline-none focus:border-sky-500"
                        >
                          <option value="">-- Chọn Gói (Bắt buộc) --</option>
                          {foundProd.variants.map((v: any, idx: number) => (
                            <option key={v.id || idx} value={v.name}>{v.name}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Hình Thức Giao Hàng:
                  </label>
                  <select
                    value={deliveryTypeInput}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setDeliveryTypeInput(val);
                      if (val === 'GIFT') {
                        setBulkInputText('Chờ ODS Liên Hệ & Gửi Gift');
                      } else if (bulkInputText === 'Chờ ODS Liên Hệ & Gửi Gift') {
                        setBulkInputText('');
                      }
                    }}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-bold focus:outline-none focus:border-sky-500"
                  >
                    <option value="AUTO_KEY">⚡ Giao Key Tự Động (CD-Key xxxxx-xxxxx)</option>
                    <option value="GIFT">🎁 Gift Tài Khoản (Gửi quà qua Steam)</option>
                    <option value="SHARED">🔑 Tài Khoản Dùng Chung (Steam Shared)</option>
                    <option value="OFFLINE">🎮 Tài Khoản Offline (Steam Offline Mode)</option>
                    <option value="NEW_ACC">✨ Tài Khoản Mới / Chính Chủ (User | Pass | Auth)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Nhập Danh Sách Key / Mật Khẩu (Mỗi dòng 1 Key hoặc 1 Tài Khoản):
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder={
                      deliveryTypeInput === 'AUTO_KEY'
                        ? 'XXXXX-YYYYY-ZZZZZ\nAAAAA-BBBBB-CCCCC'
                        : 'User1 | Pass123 | Note: Guard Code\nUser2 | Pass456 | Note: Guard Code'
                    }
                    value={bulkInputText}
                    onChange={(e) => setBulkInputText(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-mono font-bold focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                  <p className="text-[10.5px] text-zinc-400 italic mt-1">
                    💡 Bạn có thể dán nhiều dòng cùng lúc. Hệ thống sẽ tự động tạo từng dòng thành 1 món trong kho!
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-sky-600 text-white text-xs font-extrabold hover:bg-sky-700 shadow-sm"
                  >
                    Xác Nhận Nhập Kho
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK GIFT MODAL */}
      <AnimatePresence>
        {isQuickGiftModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-amber-200 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
                <h3 className="text-sm font-black text-amber-900 uppercase tracking-wider flex items-center gap-2">
                  <Gift className="h-4 w-4 text-amber-600" />
                  <span>TẠO NHANH KHO GIFT TÀI KHOẢN</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsQuickGiftModalOpen(false)}
                  className="text-zinc-400 hover:text-zinc-700 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleQuickGiftSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Chọn Sản Phẩm:
                  </label>
                  <select
                    value={quickGiftProduct}
                    onChange={(e) => setQuickGiftProduct(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-bold focus:outline-none focus:border-amber-500"
                  >
                    {adminProductsList.map((p) => (
                      <option key={p.id} value={p.title}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Số Lượng (Tối đa 100):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={quickGiftQuantity}
                    onChange={(e) => setQuickGiftQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-bold focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10.5px] text-zinc-400 italic mt-1">
                    Hệ thống sẽ tự động tạo <span className="font-bold text-amber-600">{quickGiftQuantity}</span> mã Gift với nội dung "Chờ ODS Liên Hệ & Gửi Gift".
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsQuickGiftModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 text-white text-xs font-extrabold hover:bg-amber-600 shadow-sm flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Tạo Ngay</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: CONFIRM ADMIN GIFT SENT MODAL */}
      <AnimatePresence>
        {selectedGiftItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-amber-200 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
                <h3 className="text-sm font-black text-amber-900 uppercase tracking-wider flex items-center gap-2">
                  <Gift className="h-4 w-4 text-amber-600" />
                  <span>XÁC NHẬN ĐÃ GIFT GAME CHO KHÁCH</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedGiftItem(null)}
                  className="text-zinc-400 hover:text-zinc-700 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs space-y-1">
                <span className="text-zinc-500 block font-medium">Mã Đơn Hàng:</span>
                <span className="font-mono font-black text-amber-900 text-sm">{selectedGiftItem.assignedOrderCode}</span>
                <span className="text-zinc-500 block font-medium mt-1">Sản phẩm:</span>
                <span className="font-extrabold text-zinc-900">{selectedGiftItem.productName}</span>
                <span className="text-zinc-500 block font-medium mt-1">Email nhận:</span>
                <span className="font-bold text-sky-700">{selectedGiftItem.assignedUserEmail}</span>
              </div>

              <form onSubmit={handleConfirmGiftSent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Nhập Link Giao Dịch Gift Steam / Ghi Chú Gửi (Tùy Chọn):
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Đã gửi Gift qua Steam Friend Code 19284920..."
                    value={giftConfirmLink}
                    onChange={(e) => setGiftConfirmLink(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedGiftItem(null)}
                    className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-600 text-white text-xs font-extrabold hover:bg-amber-700 shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Xác Nhận Đã Send Gift</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: CUSTOM BEAUTIFUL CONFIRM MODAL (NO BROWSER POPUPS) */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-rose-200 text-center space-y-4"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-zinc-600 font-medium mt-1.5 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm transition-colors cursor-pointer"
                >
                  {confirmModal.confirmText || 'Đồng Ý'}
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
