'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, QrCode, Wallet, ArrowLeft, ShieldCheck, CheckCircle2, 
  Zap, Copy, Building2, CreditCard, User, Tag, Lock, Sparkles
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { showToast } from '@/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, coupon, getDiscountAmount, getNetAmount, clearCart } = useCart();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'VIETQR' | 'WALLET'>('VIETQR');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string>('');

  const netAmount = getNetAmount();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ods_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {}

    const randomOrd = 'ODS' + Math.floor(100000 + Math.random() * 900000);
    setOrderCode(randomOrd);
  }, []);

  const transferMemo = useMemo(() => {
    return `${orderCode}`;
  }, [orderCode]);

  const vietQrUrl = useMemo(() => {
    return `https://img.vietqr.io/image/MB-0399224729-compact2.png?amount=${netAmount}&addInfo=${encodeURIComponent(transferMemo)}&accountName=VO%20BAO%20LAN`;
  }, [netAmount, transferMemo]);

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + ' đ';

  const userBalance = currentUser?.balance ? Number(currentUser.balance) : 0;
  const isBalanceEnough = userBalance >= netAmount;

  // Dynamic delivery badge & instruction text based on items in cart
  const deliveryBadgeInfo = useMemo(() => {
    if (cartItems.length === 0) {
      return { 
        text: '⚡ Giao Key', 
        style: 'bg-sky-100 text-sky-800 border-sky-200',
        subtext: 'Mở App Ngân Hàng quét mã QR để kích hoạt giao key tự động 24/7',
        buttonLabel: 'Xác Nhận Quét Mã QR (Kích Hoạt Key Ngay)'
      };
    }

    const hasSharedAcc = cartItems.some(
      (item: any) =>
        item.deliveryMethod === 'SHARED' ||
        item.deliveryMethod === 'Tài Khoản Dùng Chung' ||
        item.deliveryMethod === 'Cung Cấp Tài Khoản' ||
        (item.name && /dying light|wukong|black myth|elden ring|cyberpunk|hogwarts/i.test(item.name))
    );

    const hasGift = cartItems.some(
      (item: any) =>
        item.deliveryMethod === 'GIFT' ||
        item.deliveryMethod === 'Gift Tài Khoản' ||
        (item.name && /resident evil|palworld|stardew|rust/i.test(item.name))
    );

    const hasUpgrade = cartItems.some(
      (item: any) =>
        item.deliveryMethod === 'UPGRADE' ||
        item.deliveryMethod === 'Nâng Cấp' ||
        (item.name && /netflix|spotify|nitro|canva|youtube/i.test(item.name))
    );

    if (hasSharedAcc) {
      return { 
        text: '🔑 Giao Tài Khoản', 
        style: 'bg-teal-100 text-teal-800 border-teal-200',
        subtext: 'Mở App Ngân Hàng quét mã QR để nhận thông tin Tài Khoản Dùng Chung tự động 24/7',
        buttonLabel: 'Xác Nhận Quét Mã QR (Nhận Tài Khoản Ngay)'
      };
    }

    if (hasGift) {
      return { 
        text: '🎁 Giao Gift', 
        style: 'bg-purple-100 text-purple-800 border-purple-200',
        subtext: 'Mở App Ngân Hàng quét mã QR để nhận Gift Game Steam tự động 24/7',
        buttonLabel: 'Xác Nhận Quét Mã QR (Nhận Gift Game Ngay)'
      };
    }

    if (hasUpgrade) {
      return { 
        text: '🚀 Nâng Cấp Tự Động', 
        style: 'bg-amber-100 text-amber-800 border-amber-200',
        subtext: 'Mở App Ngân Hàng quét mã QR để nâng cấp tài khoản chính chủ tự động 24/7',
        buttonLabel: 'Xác Nhận Quét Mã QR (Nâng Cấp Tự Động)'
      };
    }

    return { 
      text: '⚡ Giao Key', 
      style: 'bg-sky-100 text-sky-800 border-sky-200',
      subtext: 'Mở App Ngân Hàng quét mã QR để kích hoạt giao key tự động 24/7',
      buttonLabel: 'Xác Nhận Quét Mã QR (Kích Hoạt Key Ngay)'
    };
  }, [cartItems]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Đã sao chép ${fieldName}!`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Handle Order Completion & Digital Key Distribution into Vault
  const handleProcessPayment = async () => {
    if (cartItems.length === 0) {
      showToast('Giỏ hàng của bạn đang trống!', 'error');
      return;
    }

    if (paymentMethod === 'WALLET' && !isBalanceEnough) {
      showToast('Số dư ví ODS không đủ để thanh toán đơn hàng này!', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Call Backend API to process order and deduct balance
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          cartItems,
          netAmount,
          paymentMethod
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Lỗi xử lý đơn hàng từ server');
      }

      // 2. Update local state if paying with WALLET
      if (paymentMethod === 'WALLET') {
        const finalBal = userBalance - netAmount;
        const updatedUser = { ...currentUser, balance: finalBal };
        localStorage.setItem('ods_user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        window.dispatchEvent(new Event('ods_user_update'));
        window.dispatchEvent(new Event('storage'));
      }

      // 3. Push Admin Notification via API
      try {
        const hasGift = data.hasGift || cartItems.some(i => i.name.toLowerCase().includes('gift'));
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: data.order?.id,
            customerId: currentUser?.id,
            customerName: currentUser?.name || currentUser?.email || 'Khách hàng',
            isGift: hasGift,
            productNames: cartItems.map(i => i.name).join(', ')
          })
        });
      } catch (e) {
        console.error('Lỗi khi gửi thông báo cho Admin:', e);
      }

      // 4. Clear cart & trigger completion state
      clearCart();
      setIsSuccess(true);
      showToast(`🎉 Thanh toán thành công! Mã đơn: ${data.order?.id?.slice(0, 8) || orderCode}`, 'success');
      
      // Auto redirect to vault after 3s
      setTimeout(() => {
        router.push('/profile?tab=vault');
      }, 3000);
      
    } catch (err: any) {
      console.error('Lỗi khi tiến hành thanh toán:', err);
      showToast(err.message || 'Có lỗi xảy ra khi xử lý đơn hàng!', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col antialiased">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-sky-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại Trang Chủ ODS Store</span>
          </Link>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full border border-emerald-200 text-xs font-bold shadow-2xs">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>Thanh Toán Bảo Mật Chẩn SSL 256-Bit</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Payment Methods & Order Items */}
          <div className="lg:col-span-7 space-y-6">
            {/* Payment Method Selector Card */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
              <h2 className="text-base font-extrabold text-zinc-900 tracking-tight mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-sky-600" />
                <span>Chọn Phương Thức Thanh Toán:</span>
              </h2>

              <div className="space-y-3">
                {/* Method 1: VietQR Auto Pay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('VIETQR')}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    paymentMethod === 'VIETQR'
                      ? 'border-2 border-sky-500 bg-sky-50/80 ring-1 ring-sky-300 shadow-sm'
                      : 'border-zinc-200 bg-zinc-50 hover:bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-lg bg-sky-600 text-white shadow-sm">
                      <QrCode className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-zinc-900">Quét Mã VietQR Ngân Hàng Tự Động 24/7</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Thanh toán trực tiếp từ ứng dụng MB Bank, VCB, Momo, Zalopay...
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-2xs ${deliveryBadgeInfo.style}`}>
                    {deliveryBadgeInfo.text}
                  </span>
                </button>

                {/* Method 2: Wallet Balance */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('WALLET')}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    paymentMethod === 'WALLET'
                      ? 'border-2 border-sky-500 bg-sky-50/80 ring-1 ring-sky-300 shadow-sm'
                      : 'border-zinc-200 bg-zinc-50 hover:bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-lg bg-amber-500 text-white shadow-sm">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-zinc-900 flex items-center gap-2">
                        <span>Số Dư Ví ODS Store</span>
                        <span className="text-amber-600 font-black">({formatCurrency(userBalance)})</span>
                      </h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Thanh toán tức thì 1-Click bằng số dư ví khả dụng của bạn
                      </p>
                    </div>
                  </div>
                  {isBalanceEnough ? (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                      Đủ Số Dư
                    </span>
                  ) : (
                    <Link
                      href="/deposit"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full hover:bg-rose-200 transition-colors"
                    >
                      Nạp Thêm
                    </Link>
                  )}
                </button>
              </div>
            </div>

            {/* Order Items Review */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
              <h2 className="text-base font-extrabold text-zinc-900 tracking-tight mb-4 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-sky-600" />
                <span>Sản Phẩm Trong Đơn Hàng ({cartItems.length}):</span>
              </h2>

              {cartItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">
                  Giỏ hàng đang trống! Vui lòng chọn game trước khi thanh toán.
                </div>
              ) : (
                <div className="divide-y divide-zinc-150">
                  {cartItems.map((item) => {
                    const price = item.discountPrice ?? item.price;
                    return (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.coverImage}
                            alt={item.name}
                            className="h-12 w-16 rounded-lg object-cover bg-black border border-zinc-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-zinc-900 truncate">{item.name}</h4>
                            <span className="text-[10px] text-sky-600 font-extrabold uppercase">{item.platform}</span>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-zinc-900 shrink-0">{formatCurrency(price)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: VietQR Code or Wallet Trigger & Invoice Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-lg relative overflow-hidden">
              {/* Payment Summary */}
              <div className="bg-zinc-900 -mx-6 -mt-6 p-5 text-white mb-6">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Mã Đơn Hàng:</span>
                  <span className="font-mono font-bold text-sky-400">{orderCode}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-extrabold">
                  <span>Tổng Cần Thanh Toán:</span>
                  <span className="text-xl text-amber-400 font-black">{formatCurrency(netAmount)}</span>
                </div>
              </div>

              {/* VietQR View Mode */}
              {paymentMethod === 'VIETQR' ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
                    <div className="relative aspect-square w-52 max-w-full bg-white p-2.5 rounded-xl shadow-md border border-zinc-200">
                      <img src={vietQrUrl} alt="VietQR Code" className="w-full h-full object-contain rounded-lg" />
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-2 font-medium text-center">
                      {deliveryBadgeInfo.subtext}
                    </p>
                  </div>

                  {/* Account Info Details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                      <span className="text-zinc-500">Ngân Hàng:</span>
                      <span className="font-extrabold text-zinc-900">MB BANK (Quân Đội)</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                      <span className="text-zinc-500">Số TK:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sky-700">0399224729</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('0399224729', 'Số tài khoản')}
                          className="p-1 rounded bg-white hover:bg-sky-100 text-sky-700 border border-sky-200"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                      <span className="text-zinc-500">Chủ TK:</span>
                      <span className="font-extrabold text-zinc-900">VO BAO LAN</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-50/90 to-blue-50/70 border border-sky-200 shadow-2xs flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-600"></span>
                          <span className="text-[10px] font-extrabold text-sky-900 uppercase tracking-wider">Nội Dung Chuyển Khoản</span>
                          <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            Bắt buộc
                          </span>
                        </div>
                        <span className="text-base font-black text-sky-950 tracking-wider select-all font-mono">
                          {transferMemo}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyToClipboard(transferMemo, 'Nội dung chuyển khoản')}
                        className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>{copiedField === 'Nội dung chuyển khoản' ? 'Đã chép!' : 'Sao chép'}</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-extrabold text-xs uppercase tracking-wider hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Zap className="h-4 w-4 text-amber-300 fill-amber-300 animate-bounce" />
                    <span>{deliveryBadgeInfo.buttonLabel}</span>
                  </button>
                </div>
              ) : (
                /* Wallet Pay View Mode */
                <div className="space-y-4 py-4 text-center">
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                    <p className="font-bold">Thanh toán 1-Click bằng số dư ví ODS Store</p>
                    <p className="text-[11px] text-amber-700">
                      Số dư sau khi thanh toán: <strong>{formatCurrency(Math.max(0, userBalance - netAmount))}</strong>
                    </p>
                  </div>

                  {isBalanceEnough ? (
                    <button
                      type="button"
                      onClick={handleProcessPayment}
                      disabled={isProcessing}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs uppercase tracking-wider hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      <span>Xác Nhận Thanh Toán Bằng Ví ({formatCurrency(netAmount)})</span>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-rose-600 font-bold">Số dư ví của bạn không đủ để thực hiện thanh toán này.</p>
                      <Link
                        href="/deposit"
                        className="block w-full py-3 rounded-xl bg-sky-600 text-white font-extrabold text-xs uppercase text-center hover:bg-sky-700 transition-colors"
                      >
                        Nạp Thêm Tiền Vào Ví Ngay
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Order Success Overlay */}
              <AnimatePresence>
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 bg-white/95 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center z-30"
                  >
                    <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-lg">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h3 className="text-lg font-extrabold text-zinc-900">THANH TOÁN THÀNH CÔNG!</h3>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                      Đơn hàng <strong className="text-sky-600">{orderCode}</strong> đã được thanh toán hoàn tất. Key game đã được chuyển vào Kho Game của bạn!
                    </p>

                    <div className="mt-6 flex items-center gap-3 w-full max-w-xs">
                      <Link
                        href="/vault"
                        className="flex-1 py-3 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors text-center shadow-sm"
                      >
                        Xem Kho Game (Vault)
                      </Link>
                      <Link
                        href="/"
                        className="flex-1 py-3 rounded-xl border border-zinc-300 text-zinc-700 text-xs font-bold hover:bg-zinc-100 transition-colors text-center"
                      >
                        Về Trang Chủ
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
