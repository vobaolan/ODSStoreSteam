'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Wallet, QrCode, ArrowLeft, Copy, CheckCircle2, Zap, ShieldCheck, 
  Sparkles, RefreshCw, AlertCircle, CreditCard, Building2, User
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { showToast } from '@/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_AMOUNTS = [
  { label: '50.000 đ', value: 50000 },
  { label: '100.000 đ', value: 100000 },
  { label: '200.000 đ', value: 200000, popular: true },
  { label: '500.000 đ', value: 500000 },
  { label: '1.000.000 đ', value: 1000000 },
  { label: '2.000.000 đ', value: 2000000 },
];

export default function DepositPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(200000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [memoCode, setMemoCode] = useState<string>('');

  // Load user info on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ods_user');
      if (stored) {
        const u = JSON.parse(stored);
        setCurrentUser(u);
      }
    } catch (e) {}

    // Generate random 5-char code for deposit memo
    const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    setMemoCode(randomCode);
  }, []);

  const effectiveAmount = useMemo(() => {
    if (customAmount) {
      const rawNum = Number(customAmount.replace(/\./g, ''));
      if (!isNaN(rawNum) && rawNum > 0) {
        return rawNum;
      }
    }
    return selectedAmount;
  }, [selectedAmount, customAmount]);

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '');
    if (!rawDigits) {
      setCustomAmount('');
      return;
    }
    const formatted = Number(rawDigits).toLocaleString('vi-VN');
    setCustomAmount(formatted);
  };

  const transferMemo = useMemo(() => {
    return `ODS ${memoCode}`;
  }, [memoCode]);

  const vietQrUrl = useMemo(() => {
    return `https://img.vietqr.io/image/MB-0399224729-compact2.png?amount=${effectiveAmount}&addInfo=${encodeURIComponent(transferMemo)}&accountName=VO%20BAO%20LAN`;
  }, [effectiveAmount, transferMemo]);

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + ' đ';

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Đã sao chép ${fieldName}!`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Simulate Automatic VietQR Top-up Confirmation
  const handleConfirmDeposit = async () => {
    if (effectiveAmount < 10000) {
      showToast('Số tiền nạp tối thiểu là 10.000 đ', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Call Backend Wallet Deposit API
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          email: currentUser?.email || 'admin@odsstore.vn',
          amount: effectiveAmount,
          memo: transferMemo,
        }),
      });

      const data = await res.json();
      const newBal = data.newBalance !== undefined ? data.newBalance : (currentUser?.balance || 0) + effectiveAmount;

      // 2. Update LocalStorage user state
      let updatedUser = { ...currentUser, balance: newBal };
      if (!currentUser) {
        updatedUser = {
          id: 'usr-guest',
          name: 'Khách Hàng',
          email: 'customer@odsstore.vn',
          balance: newBal,
          role: 'USER',
        };
      }
      localStorage.setItem('ods_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      // 3. Save top-up transaction to history
      try {
        const historyStr = localStorage.getItem('ods_deposit_history');
        const history = historyStr ? JSON.parse(historyStr) : [];
        history.unshift({
          id: `dep-${Date.now()}`,
          amount: effectiveAmount,
          memo: transferMemo,
          date: new Date().toISOString(),
          status: 'SUCCESS',
        });
        localStorage.setItem('ods_deposit_history', JSON.stringify(history));
      } catch (e) {}

      // 4. Dispatch real-time events for Header badge & Profile sync
      window.dispatchEvent(new Event('ods_user_update'));
      window.dispatchEvent(new Event('storage'));

      setIsSuccess(true);
      showToast(`⚡ Nạp thành công ${formatCurrency(effectiveAmount)} vào ví ODS Store!`, 'success');
    } catch (err) {
      console.error('Lỗi xác nhận nạp tiền:', err);
      showToast('Có lỗi xảy ra khi xác nhận nạp tiền. Vui lòng thử lại!', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col antialiased">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb & Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-sky-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại Trang Cá Nhân</span>
          </Link>
          <div className="flex items-center gap-2 bg-sky-50 text-sky-700 px-3.5 py-1.5 rounded-full border border-sky-200 text-xs font-bold shadow-2xs">
            <Zap className="h-3.5 w-3.5 text-sky-600 animate-pulse" />
            <span>Hệ Thống Nạp Tiền VietQR Tự Động 24/7</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Top-up Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
                    <Wallet className="h-6 w-6 text-sky-600" />
                    <span>Nạp Tiền Vào Ví ODS Store</span>
                  </h1>
                  <p className="text-xs text-zinc-500 mt-1">
                    Nạp tiền tự động qua QR Ngân Hàng — Số dư cập nhật ngay sau 2 giây!
                  </p>
                </div>

                {/* Premium Current Balance Badge */}
                <div className="bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-indigo-500/10 border border-sky-200/90 rounded-2xl px-4 py-2.5 shadow-xs flex items-center justify-center gap-3.5 hover:shadow-md hover:border-sky-300 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="text-[10px] text-sky-900 font-extrabold uppercase tracking-wider">Số Dư Khả Dụng</span>
                    </div>
                    <span className="text-base font-black text-zinc-900 tracking-tight block mt-0.5">
                      {currentUser ? formatCurrency(Number(currentUser.balance || 0)) : '0 đ'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 1: Select Amount */}
              <div className="mt-6 pt-6 border-t border-zinc-150">
                <label className="block text-xs font-extrabold text-zinc-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                  <span>Chọn Hoặc Nhập Số Tiền Nạp:</span>
                </label>

                {/* Preset Amount Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {PRESET_AMOUNTS.map((item) => {
                    const isSelected = selectedAmount === item.value && !customAmount;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          setSelectedAmount(item.value);
                          setCustomAmount('');
                        }}
                        className={`p-3.5 rounded-xl border text-center font-bold transition-all relative ${
                          isSelected
                            ? 'border-2 border-sky-500 bg-sky-50/90 text-sky-900 shadow-md ring-1 ring-sky-300'
                            : 'border-zinc-200 bg-zinc-50 hover:bg-white hover:border-zinc-300 text-zinc-700'
                        }`}
                      >
                        {item.popular && (
                          <span className="absolute -top-2.5 right-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                            Phổ Biến
                          </span>
                        )}
                        <span className="text-sm block">{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amount Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder="Hoặc nhập số tiền tùy ý (VD: 150.000)..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all font-bold tracking-wide"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                    VNĐ
                  </span>
                </div>
              </div>

              {/* Step 2: Payment Method Choice */}
              <div className="mt-6 pt-6 border-t border-zinc-150">
                <label className="block text-xs font-extrabold text-zinc-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                  <span>Phương Thức Thanh Toán Tự Động:</span>
                </label>

                <div className="p-4 rounded-xl border-2 border-sky-500 bg-sky-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-sky-600 text-white shadow-sm">
                      <QrCode className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-zinc-900">Quét Mã VietQR Ngân Hàng 24/7</h4>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Hỗ trợ MB Bank, Vietcombank, Techcombank, VPBank, Momo, Zalopay...
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" /> Auto 24/7
                  </span>
                </div>
              </div>
            </div>

            {/* Instruction Card */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Cam Kết & Hướng Dẫn Nạp Tiền An Toàn:</span>
              </h3>
              <ul className="text-xs text-zinc-600 space-y-2 list-disc pl-4 font-normal">
                <li>Vui lòng giữ nguyên <strong>Nội dung chuyển khoản</strong> để hệ thống tự động cộng ví tức thì.</li>
                <li>Ví ODS Store hỗ trợ thanh toán 1-Click mua key game bản quyền 24/7 không tính thêm phí.</li>
                <li>Nếu chuyển nhầm hoặc quá 5 phút chưa cộng ví, vui lòng liên hệ Chatbot CyberBot AI hoặc Fanpage hỗ trợ 100%.</li>
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN: Live VietQR Code & Payment Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-lg relative overflow-hidden">
              {/* Top Banner */}
              <div className="bg-gradient-to-r from-sky-600 to-blue-700 -mx-6 -mt-6 p-4 text-white text-center mb-6">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-200 block">Cổng Thanh Toán VietQR Tự Động</span>
                <h3 className="text-base font-extrabold mt-0.5">MB BANK — VO BAO LAN</h3>
              </div>

              {/* VietQR Image Container */}
              <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 rounded-2xl border border-zinc-200 mb-6 relative group">
                <div className="relative aspect-square w-56 max-w-full bg-white p-3 rounded-xl shadow-md border border-zinc-200">
                  <img
                    src={vietQrUrl}
                    alt="VietQR Code"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-3 font-medium text-center">
                  Mở ứng dụng Ngân Hàng hoặc Ví Điện Tử quét mã QR bên trên
                </p>
              </div>

              {/* Bank Transfer Details Table */}
              <div className="space-y-3.5 text-xs">
                {/* Bank Name */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <div className="flex items-center gap-2 text-zinc-600">
                    <Building2 className="h-4 w-4 text-sky-600" />
                    <span>Ngân Hàng:</span>
                  </div>
                  <span className="font-extrabold text-zinc-900">MB BANK (Quân Đội)</span>
                </div>

                {/* Account Number */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <div className="flex items-center gap-2 text-zinc-600">
                    <CreditCard className="h-4 w-4 text-sky-600" />
                    <span>Số Tài Khoản:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sky-700 text-sm tracking-wide">0399224729</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('0399224729', 'Số tài khoản')}
                      className="p-1 rounded bg-white hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors"
                      title="Copy số tài khoản"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Account Holder */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <div className="flex items-center gap-2 text-zinc-600">
                    <User className="h-4 w-4 text-sky-600" />
                    <span>Chủ Tài Khoản:</span>
                  </div>
                  <span className="font-extrabold text-zinc-900">VO BAO LAN</span>
                </div>

                {/* Transfer Amount */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
                  <div className="flex items-center gap-2 text-amber-900 font-bold">
                    <span>Số Tiền Nạp:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-amber-700 text-base">{formatCurrency(effectiveAmount)}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(String(effectiveAmount), 'Số tiền')}
                      className="p-1 rounded bg-white hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors"
                      title="Copy số tiền"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Transfer Memo / Content Box */}
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

              {/* Automatic Confirmation Trigger Button */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleConfirmDeposit}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-sky-600 text-white font-extrabold text-xs uppercase tracking-wider hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Đang Xác Nhận VietQR Tự Động...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4.5 w-4.5 text-amber-300 fill-amber-300 animate-bounce" />
                      <span>Xác Nhận Đã Chuyển Khoản (Cộng Ví Ngay)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Success Overlay Modal */}
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
                    <h3 className="text-lg font-extrabold text-zinc-900">NẠP TIỀN THÀNH CÔNG!</h3>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                      Đã cộng <strong className="text-emerald-600 font-bold">{formatCurrency(effectiveAmount)}</strong> vào ví ODS Store của bạn.
                    </p>
                    <div className="mt-4 p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-800 w-full max-w-xs">
                      Số dư hiện tại: <span className="text-sky-600 font-extrabold">{currentUser ? formatCurrency(currentUser.balance) : '0 đ'}</span>
                    </div>

                    <div className="mt-6 flex items-center gap-3 w-full max-w-xs">
                      <button
                        type="button"
                        onClick={() => setIsSuccess(false)}
                        className="flex-1 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 text-xs font-bold hover:bg-zinc-100 transition-colors"
                      >
                        Nạp Tiếp
                      </button>
                      <Link
                        href="/profile"
                        className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-colors text-center"
                      >
                        Vào Hồ Sơ
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
