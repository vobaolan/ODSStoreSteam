'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { showToast } from '@/components/Toast';
import { AdminChatModal } from '@/components/AdminChatModal';
import { 
  ClipboardList, Search, Filter, CheckCircle2, MessageCircle, Gift, User, Trash2
} from 'lucide-react';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<{
    customerId: string;
    customerName: string;
    orderId: string;
  } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ods_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.email === 'admin@odsstore.vn' || u.role === 'ADMIN') {
          setIsAdmin(true);
          setIsCheckingAuth(false);
          loadOrders();
          return;
        }
      }
    } catch (e) {}

    setIsCheckingAuth(false);
    showToast('⚠️ Vui lòng đăng nhập bằng tài khoản Admin để truy cập!', 'error');
    router.push('/profile');
  }, [router]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
      showToast('Lỗi tải danh sách đơn hàng', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return Number(val).toLocaleString('vi-VN') + ' đ';
  };

  const handleMarkGiftSuccess = async (orderId: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action: 'MARK_GIFT_SUCCESS' })
      });
      if (res.ok) {
        showToast('Đã xác nhận hoàn thành đơn hàng!', 'success');
        loadOrders();
        
        // Cập nhật thông báo đã đọc
        try {
          const notifs = localStorage.getItem('ods_admin_notifications');
          if (notifs) {
            let parsed = JSON.parse(notifs);
            parsed = parsed.map((n: any) => n.orderId === orderId ? { ...n, read: true } : n);
            localStorage.setItem('ods_admin_notifications', JSON.stringify(parsed));
          }
        } catch(e) {}
      } else {
        showToast('Lỗi cập nhật đơn hàng', 'error');
      }
    } catch(e) {
      showToast('Lỗi mạng', 'error');
    }
  };

  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      const res = await fetch(`/api/admin/orders?id=${orderToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Đã xóa đơn hàng thành công!', 'success');
        loadOrders();
      } else {
        showToast('Lỗi khi xóa đơn hàng', 'error');
      }
    } catch(e) {
      showToast('Lỗi mạng', 'error');
    } finally {
      setOrderToDelete(null);
    }
  };

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-bold text-xs">Đang kiểm tra quyền...</div>;
  }
  
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans antialiased text-black">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-ods-primary flex items-center justify-center text-white shadow-lg">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-black">Lịch Sử Khách Mua Hàng</h1>
            <p className="text-xs font-bold text-ods-textMuted mt-1">Quản lý và hỗ trợ đơn hàng trực tiếp</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex gap-4 items-center bg-gray-50/50">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm mã đơn, email khách hàng..." 
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-ods-primary focus:ring-1 focus:ring-ods-primary"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="h-4 w-4" /> Lọc đơn Gift
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Mã Đơn</th>
                  <th className="px-6 py-4">Khách Hàng</th>
                  <th className="px-6 py-4">Sản Phẩm</th>
                  <th className="px-6 py-4">Tổng Tiền</th>
                  <th className="px-6 py-4">Trạng Thái</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Đang tải dữ liệu...</td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Chưa có đơn hàng nào</td>
                  </tr>
                ) : orders.map((order) => {
                  const hasGift = order.gameKeys?.some((k: any) => 
                    k.product?.type === 'STEAM_GIFT' || 
                    k.product?.deliveryMethod === 'GIFT' || 
                    k.product?.deliveryMethod === 'Gift Tài Khoản'
                  );
                  const isCompleted = order.status === 'COMPLETED';

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-gray-600">
                        {order.id.startsWith('ODS') ? `#${order.id}` : `#${order.id.slice(0, 8)}`}
                        <div className="text-[10px] text-gray-400 mt-1 font-sans">
                          {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {order.user?.name ? order.user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-xs">{order.user?.name || 'Khách hàng'}</p>
                            <p className="text-[10px] text-gray-500">{order.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {order.gameKeys?.map((k: any) => (
                            <div key={k.id} className="text-xs font-semibold flex items-center gap-1">
                              {k.product?.type === 'STEAM_GIFT' || k.product?.deliveryMethod?.includes('GIFT') ? (
                                <Gift className="h-3 w-3 text-purple-500" />
                              ) : null}
                              {k.product?.name}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-xs">
                        {formatCurrency(Number(order.netAmount))}
                      </td>
                      <td className="px-6 py-4">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Hoàn Thành
                          </span>
                        ) : hasGift ? (
                          <button
                            onClick={() => handleMarkGiftSuccess(order.id)}
                            title="Click để hoàn thành giao dịch"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                          >
                            <Gift className="h-3 w-3" />
                            Đang đợi
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                            Đang Xử Lý
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {hasGift && !isCompleted && (
                            <button
                              onClick={() => handleMarkGiftSuccess(order.id)}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-bold uppercase transition-colors"
                            >
                              Đã Gift Thành Công
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setActiveChat({
                                customerId: order.userId,
                                customerName: order.user?.name || order.user?.email || 'Khách hàng',
                                orderId: order.id
                              });
                              setChatModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-ods-border hover:bg-ods-surface text-black rounded text-[10px] font-bold uppercase transition-colors"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>Chat</span>
                          </button>
                          <button
                            onClick={() => setOrderToDelete(order.id)}
                            className="p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors ml-1"
                            title="Xóa đơn hàng"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <Footer />

      {activeChat && (
        <AdminChatModal
          isOpen={chatModalOpen}
          onClose={() => setChatModalOpen(false)}
          customerId={activeChat.customerId}
          customerName={activeChat.customerName}
          orderId={activeChat.orderId}
          onSupportSuccess={() => handleMarkGiftSuccess(activeChat.orderId)}
        />
      )}

      {/* DELETE CONFIRM MODAL */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-zinc-200">
            <h3 className="text-lg font-black text-red-600 mb-2">Xác nhận xóa</h3>
            <p className="text-sm font-medium text-zinc-600 mb-6">
              Bạn có chắc chắn muốn xóa đơn hàng này? Khách hàng sẽ bị mất lịch sử mua hàng và không thể khôi phục!
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteOrder}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition-colors shadow-sm"
              >
                Xóa Vĩnh Viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
