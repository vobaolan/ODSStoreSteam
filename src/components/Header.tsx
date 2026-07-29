'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingBag, User, Wallet, ShieldAlert, Package, Users, ChevronDown,
  Clock, Flame, Tag, Key, Bell, ClipboardList, MessageCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomerChatModal } from './CustomerChatModal';
import { AdminChatModal } from './AdminChatModal';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { cartCount, setCartOpen } = useCart();
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Dynamic user state loaded from localStorage
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    balance: number;
    email: string;
    role?: string;
  } | null>(null);

  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [isAdminNotifOpen, setIsAdminNotifOpen] = useState(false);
  const [adminChatOpen, setAdminChatOpen] = useState(false);
  const [activeAdminChat, setActiveAdminChat] = useState<any>(null);

  const [hasUserNewMessage, setHasUserNewMessage] = useState(false);
  const [isUserNotifOpen, setIsUserNotifOpen] = useState(false);
  const [customerChatOpen, setCustomerChatOpen] = useState(false);
  const isAdmin = currentUser?.email === 'admin@odsstore.vn' || currentUser?.role === 'ADMIN';

  useEffect(() => {
    const loadUser = async () => {
      const stored = localStorage.getItem('ods_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          
          // Set user safely to avoid loops
          setCurrentUser(prev => prev?.id === parsed.id && prev?.balance === parsed.balance ? prev : parsed);

          // Synchronize latest live balance from API if available
          if (parsed && parsed.email) {
            try {
              const res = await fetch('/api/admin/users');
              if (res.ok) {
                const data = await res.json();
                if (data && Array.isArray(data.users)) {
                  const match = data.users.find((u: any) => u.email === parsed.email || u.id === parsed.id);
                  if (match && match.balance !== undefined && Number(match.balance) !== Number(parsed.balance)) {
                    const updatedUser = { ...parsed, balance: Number(match.balance) };
                    setCurrentUser(updatedUser);
                    localStorage.setItem('ods_user', JSON.stringify(updatedUser));
                  }
                }
              }
            } catch (e) {}
          }
        } catch (e) {
          console.error('Failed to parse user info in Header:', e);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };

    const handleStorage = () => {
      loadUser();
    };

    loadUser();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('ods_user_update', loadUser);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('ods_user_update', loadUser);
    };
  }, []);

  useEffect(() => {
    // Notification Polling
    const checkNotifications = async () => {
      try {
        if (isAdmin) {
          const res = await fetch('/api/notifications');
          if (res.ok) {
            const parsed = await res.json();
            setAdminNotifications(parsed);
            const hasUnread = parsed.some((n: any) => !n.read);
            if (hasUnread && !hasNewNotification) {
              setHasNewNotification(true);
              try {
                const audio = new Audio('/notification.mp3');
                audio.play().catch(e => console.log('Audio play blocked:', e));
              } catch (e) {}
            } else if (!hasUnread && hasNewNotification) {
              setHasNewNotification(false);
            }
          }
        } else if (currentUser) {
          const res = await fetch('/api/support');
          if (res.ok) {
            const allMessages = await res.json();
            const hasUnread = allMessages.some((m: any) => m.receiverId === currentUser.id && !m.isRead);
            if (hasUnread && !hasUserNewMessage) {
              setHasUserNewMessage(true);
              try {
                const audio = new Audio('/notification.mp3');
                audio.play().catch(e => console.log('Audio play blocked:', e));
              } catch (e) {}
            } else if (!hasUnread && hasUserNewMessage) {
              setHasUserNewMessage(false);
            }
          }
        }
      } catch (error) {
        console.error('Lỗi khi tải thông báo:', error);
      }
    };
    
    const notifInterval = setInterval(checkNotifications, 3000);
    checkNotifications();

    const handleOpenChat = () => setCustomerChatOpen(true);
    window.addEventListener('open_customer_chat', handleOpenChat);

    return () => {
      clearInterval(notifInterval);
      window.removeEventListener('open_customer_chat', handleOpenChat);
    };
  }, [isAdmin, hasNewNotification, hasUserNewMessage, currentUser]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN') + ' đ';
  };

  // Do not show central nav links on unauthenticated /profile login page
  const isUnauthProfilePage = pathname === '/profile' && !currentUser;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-ods-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LOGO ODS */}
        <div className="flex items-center gap-10">
          <Link href="/" className="group flex items-center">
            <img
              src="/images/logo.png"
              alt="ODS Logo"
              className="h-6 w-auto object-contain transition-all duration-300 group-hover:opacity-80 group-hover:scale-[0.98]"
            />
          </Link>

          {/* DIRECT NAVIGATION LINKS */}
          {!isUnauthProfilePage && (
            <nav className="hidden md:flex items-center space-x-7">
              {/* 1. SẢN PHẨM VỪA XEM - SHOWN STRICTLY WHEN LOGGED IN */}
              {currentUser && (
                <Link
                  href="/products/recently-viewed"
                  className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ods-textMuted hover:text-black transition-colors relative py-2 group"
                >
                  <Clock className="h-3.5 w-3.5 text-ods-primary" />
                  <span>SẢN PHẨM VỪA XEM</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-ods-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              )}

              {/* 2. SẢN PHẨM MUA NHIỀU - ALWAYS SHOWN */}
              <Link
                href="/products/best-sellers"
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ods-textMuted hover:text-black transition-colors relative py-2 group"
              >
                <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span>SẢN PHẨM MUA NHIỀU</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-amber-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>

              {/* 3. SẢN PHẨM KHUYẾN MÃI - ALWAYS SHOWN */}
              <Link
                href="/products/discounts"
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ods-textMuted hover:text-black transition-colors relative py-2 group"
              >
                <Tag className="h-3.5 w-3.5 text-red-500" />
                <span>SẢN PHẨM KHUYẾN MÃI</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-red-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>

              {/* ADMIN MANAGEMENT HOVER DROPDOWN MENU - SHOWN STRICTLY TO ADMIN ACCOUNTS */}
              {isAdmin && (
                <div
                  className="relative py-2"
                  onMouseEnter={() => setIsAdminOpen(true)}
                  onMouseLeave={() => setIsAdminOpen(false)}
                >
                  <button className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ods-primary hover:text-black transition-colors group cursor-pointer">
                    <ShieldAlert className="h-3.5 w-3.5 text-ods-primary" />
                    <span>QUẢN LÝ</span>
                    <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isAdminOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isAdminOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute top-full left-0 w-52 rounded-ods border border-ods-border bg-white p-1.5 shadow-2xl z-50 mt-1"
                      >
                        <Link
                          href="/admin/products"
                          className="flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-xs font-bold text-black hover:bg-ods-surface hover:text-ods-primary transition-colors"
                        >
                          <Package className="h-4 w-4 text-ods-primary" />
                          <span>1. Quản lý sản phẩm</span>
                        </Link>

                        <Link
                          href="/admin/inventory"
                          className="flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-xs font-bold text-black hover:bg-ods-surface hover:text-ods-primary transition-colors"
                        >
                          <Key className="h-4 w-4 text-ods-primary" />
                          <span>2. Quản lý kho Key & Tài khoản</span>
                        </Link>
                        
                        <Link
                          href="/admin/orders"
                          className="flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-xs font-bold text-black hover:bg-ods-surface hover:text-ods-primary transition-colors"
                        >
                          <ClipboardList className="h-4 w-4 text-ods-primary" />
                          <span>3. Lịch sử khách mua hàng</span>
                        </Link>

                        <Link
                          href="/admin/crm"
                          className="flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-xs font-bold text-black hover:bg-ods-surface hover:text-ods-primary transition-colors"
                        >
                          <Users className="h-4 w-4 text-ods-primary" />
                          <span>4. Hệ thống CRM</span>
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </nav>
          )}
        </div>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center space-x-4">
          {/* DEPOSIT BUTTON (Separate - Moved to Left) */}
          {currentUser && (
            <Link
              href="/deposit"
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 px-4 py-2 transition-all shadow-md group"
              title="Nạp tiền"
            >
              <span className="text-xs font-black text-white tracking-wide">NẠP TIỀN</span>
            </Link>
          )}

          {/* WALLET BUTTON (Separate - Moved to Right) */}
          {currentUser && (
            <Link
              href="/profile"
              className="hidden sm:flex items-center gap-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 px-3.5 py-2 transition-all shadow-sm"
              title="Xem số dư"
            >
              <Wallet className="h-4 w-4 text-sky-500" />
              <span className="text-sm font-bold text-black">{formatCurrency(currentUser.balance)}</span>
            </Link>
          )}

          {/* NOTIFICATION BELL */}
          {currentUser && (
            isAdmin ? (
              <div className="relative">
                <button
                  onClick={() => setIsAdminNotifOpen(!isAdminNotifOpen)}
                  className="relative flex items-center justify-center rounded-ods border border-ods-border bg-white p-2 text-ods-textMuted hover:text-black hover:border-black hover:shadow-lightShadow transition-all cursor-pointer"
                  title="Thông báo quản trị"
                >
                  <Bell className={`h-4.5 w-4.5 ${hasNewNotification ? 'animate-swing text-ods-primary' : ''}`} />
                  {hasNewNotification && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  )}
                </button>

                {/* ADMIN NOTIFICATIONS DROPDOWN */}
                <AnimatePresence>
                  {isAdminNotifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-80 rounded-xl bg-white shadow-2xl border border-zinc-100 overflow-hidden z-50"
                    >
                      <div className="bg-zinc-50 border-b border-zinc-100 px-4 py-3 flex justify-between items-center">
                        <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800">Thông Báo Quản Trị</h4>
                        <div className="flex gap-2 items-center">
                          {hasNewNotification && (
                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Mới
                            </span>
                          )}
                          {adminNotifications.length > 0 && (
                            <button
                              onClick={async () => {
                                await fetch('/api/notifications', { method: 'DELETE' });
                                setAdminNotifications([]);
                                setHasNewNotification(false);
                              }}
                              className="text-[10px] text-red-500 hover:text-red-700 font-bold px-1"
                              title="Xóa tất cả thông báo"
                            >
                              Dọn dẹp
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-[350px] overflow-y-auto">
                        {adminNotifications.length === 0 ? (
                          <div className="px-4 py-8 text-center flex flex-col items-center justify-center">
                            <Bell className="h-8 w-8 text-zinc-200 mb-2" />
                            <p className="text-xs text-zinc-400 font-medium">Chưa có thông báo nào.</p>
                          </div>
                        ) : (
                          adminNotifications.slice(0, 20).map((notif: any) => (
                            <button
                              key={notif.id}
                              onClick={async () => {
                                // Đánh dấu đã đọc trên server
                                await fetch('/api/notifications', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: notif.id })
                                });
                                
                                const updatedNotifs = adminNotifications.map((n: any) => 
                                  n.id === notif.id ? { ...n, read: true } : n
                                );
                                setAdminNotifications(updatedNotifs);
                                setIsAdminNotifOpen(false);

                                if (notif.isGift) {
                                  setActiveAdminChat({
                                    customerId: notif.customerId,
                                    customerName: notif.customerName,
                                    orderId: notif.orderId
                                  });
                                  setAdminChatOpen(true);
                                } else {
                                  // Chuyển tới trang quản lý đơn hàng
                                  window.location.href = '/admin/orders';
                                }
                              }}
                              className={`w-full text-left px-4 py-3 hover:bg-zinc-50 border-b border-zinc-100 flex items-start gap-3 transition-colors ${!notif.read ? 'bg-sky-50/30' : ''}`}
                            >
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${notif.isGift ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                                {notif.isGift ? <MessageCircle className="h-4 w-4 text-amber-600" /> : <Package className="h-4 w-4 text-emerald-600" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-bold text-zinc-900 mb-0.5">
                                  {notif.customerName} <span className="font-normal text-zinc-500">vừa mua</span>
                                </p>
                                <p className="text-[11px] text-zinc-700 line-clamp-1">{notif.productNames}</p>
                                <p className="text-[10px] text-zinc-400 mt-1">{new Date(notif.timestamp).toLocaleString('vi-VN')}</p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                {!notif.read && <div className="h-2 w-2 bg-red-500 rounded-full flex-shrink-0"></div>}
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await fetch(`/api/notifications?id=${notif.id}`, { method: 'DELETE' });
                                    setAdminNotifications(adminNotifications.filter((n: any) => n.id !== notif.id));
                                  }}
                                  className="text-zinc-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                                  title="Xóa thông báo này"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                      <Link href="/admin/orders" className="block w-full text-center py-2.5 text-[11px] font-bold text-sky-600 bg-zinc-50 hover:bg-zinc-100 transition-colors border-t border-zinc-100">
                        Xem tất cả đơn hàng
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsUserNotifOpen(!isUserNotifOpen)}
                  className="relative flex items-center justify-center rounded-ods border border-ods-border bg-white p-2 text-ods-textMuted hover:text-black hover:border-black hover:shadow-lightShadow transition-all cursor-pointer"
                  title="Thông báo"
                >
                  <Bell className={`h-4.5 w-4.5 ${hasUserNewMessage ? 'animate-swing text-ods-primary' : ''}`} />
                  {hasUserNewMessage && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  )}
                </button>

                {/* USER NOTIFICATIONS DROPDOWN */}
                <AnimatePresence>
                  {isUserNotifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-80 rounded-xl bg-white shadow-2xl border border-zinc-100 overflow-hidden z-50"
                    >
                      <div className="bg-zinc-50 border-b border-zinc-100 px-4 py-3 flex justify-between items-center">
                        <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800">Thông báo của bạn</h4>
                        <div className="flex gap-2 items-center">
                          {hasUserNewMessage && (
                            <span className="bg-sky-100 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              1 Mới
                            </span>
                          )}
                          {hasUserNewMessage && (
                            <button
                              onClick={async () => {
                                await fetch('/api/support?orderId=all', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ receiverId: currentUser.id })
                                });
                                setHasUserNewMessage(false);
                              }}
                              className="text-[10px] text-red-500 hover:text-red-700 font-bold px-1"
                              title="Dọn thông báo"
                            >
                              Dọn dẹp
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {hasUserNewMessage ? (
                          <button
                            onClick={() => {
                              setHasUserNewMessage(false);
                              setIsUserNotifOpen(false);
                              setCustomerChatOpen(true);
                            }}
                            className="w-full text-left px-4 py-4 hover:bg-zinc-50 border-b border-zinc-100 flex items-start gap-3 transition-colors"
                          >
                            <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <MessageCircle className="h-4 w-4 text-sky-600" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-zinc-900 mb-0.5">Tin nhắn mới từ Admin</p>
                              <p className="text-[11px] text-zinc-500">Admin đã phản hồi hoặc hỗ trợ đơn hàng của bạn. Bấm để xem.</p>
                            </div>
                            <div className="h-2 w-2 bg-sky-500 rounded-full mt-1.5 flex-shrink-0"></div>
                          </button>
                        ) : (
                          <div className="px-4 py-8 text-center flex flex-col items-center justify-center">
                            <Bell className="h-8 w-8 text-zinc-200 mb-2" />
                            <p className="text-xs text-zinc-400 font-medium">Bạn chưa có thông báo nào mới.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          )}

          {/* CART TOGGLE (Only shown when logged in) */}
          {currentUser && (
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center justify-center rounded-ods border border-ods-border bg-white p-2 text-ods-textMuted hover:text-black hover:border-black hover:shadow-lightShadow transition-all cursor-pointer"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-extrabold text-white shadow-md shadow-black/10"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>
          )}

          {/* USER ACC */}
          <Link
            href="/profile"
            className="flex items-center justify-center rounded-ods border border-ods-border bg-white p-2 text-ods-textMuted hover:text-black hover:border-black transition-all"
            title="Tài khoản của bạn"
          >
            <User className="h-4.5 w-4.5" />
          </Link>
        </div>
      </div>

      {/* CUSTOMER CHAT MODAL */}
      {currentUser && !isAdmin && (
        <CustomerChatModal
          isOpen={customerChatOpen}
          onClose={() => setCustomerChatOpen(false)}
          currentUser={currentUser}
        />
      )}

      {/* ADMIN CHAT MODAL (DIRECT FROM HEADER) */}
      {isAdmin && activeAdminChat && (
        <AdminChatModal
          isOpen={adminChatOpen}
          onClose={() => {
            setAdminChatOpen(false);
            setActiveAdminChat(null);
          }}
          customerId={activeAdminChat.customerId}
          customerName={activeAdminChat.customerName}
          orderId={activeAdminChat.orderId}
          onSupportSuccess={() => {
            // Có thể thêm logic call api duyệt đơn tại đây, nhưng hiện tại chỉ cần hiện Toast (AdminChatModal đã gọi showToast)
          }}
        />
      )}
    </header>
  );
};
