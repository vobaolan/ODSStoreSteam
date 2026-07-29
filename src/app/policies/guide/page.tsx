'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { CartProvider } from '@/context/CartContext';
import { 
  Gamepad2, Monitor, ArrowRight, CheckCircle2, Download, 
  Key, ShieldCheck, ShoppingCart, Lock, Sparkles, HelpCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function GuidePolicyPage() {
  const [platform, setPlatform] = useState<'steam' | 'epic' | 'ea'>('steam');

  return (
    <CartProvider>
      <div className="min-h-screen bg-white text-black flex flex-col antialiased">
        <Header />

        {/* HERO BANNER */}
        <section className="relative overflow-hidden bg-zinc-950 py-16 text-white border-b border-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-950/40 to-transparent pointer-events-none" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 border border-sky-500/20 px-3.5 py-1 text-xs font-bold text-sky-400 uppercase tracking-widest mx-auto">
              <Gamepad2 className="h-4 w-4" />
              <span>HƯỚNG DẪN CHI TIẾT TỪ A - Z</span>
            </div>

            <h1
              className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wider uppercase text-white"
              style={{ lineHeight: '1.55' }}
            >
              HƯỚNG DẪN MUA HÀNG & KÍCH HOẠT KEY GAME
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
              Các bước đơn giản để mua sắm và kích hoạt bản quyền game chính hãng trên Steam, Epic Games, EA App chỉ trong vài phút.
            </p>
          </div>
        </section>

        {/* BREADCRUMB */}
        <div className="bg-ods-surface border-b border-ods-border py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-ods-textMuted">
            <Link href="/" className="hover:text-black transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-black font-bold">Hướng dẫn kích hoạt</span>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">
          {/* SECTION 1: PURCHASING WORKFLOW (4 STEPS) */}
          <section className="space-y-8">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold uppercase text-black">
                1. QUY TRÌNH MUA HÀNG TẠI ODS STORE (4 BƯỚC)
              </h2>
              <p className="text-xs text-ods-textMuted">Hệ thống xử lý tự động 24/7 giao key trong dưới 3 giây sau thanh toán</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* STEP 1 */}
              <div className="rounded-2xl border border-ods-border bg-white p-6 space-y-4 hover:border-black transition-all relative group">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-black text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                    01
                  </span>
                  <ShoppingCart className="h-5 w-5 text-ods-primary" />
                </div>
                <h3 className="font-heading text-sm font-extrabold uppercase text-black">Chọn Game Yêu Thích</h3>
                <p className="text-xs text-ods-textMuted leading-relaxed">
                  Tìm kiếm tựa game bạn mong muốn tại ODS Store, kiểm tra cấu hình tối thiểu và bấm <strong>MUA NGAY</strong>.
                </p>
              </div>

              {/* STEP 2 */}
              <div className="rounded-2xl border border-ods-border bg-white p-6 space-y-4 hover:border-black transition-all relative group">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-black text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                    02
                  </span>
                  <Monitor className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="font-heading text-sm font-extrabold uppercase text-black">Quét Mã QR VietQR</h3>
                <p className="text-xs text-ods-textMuted leading-relaxed">
                  Kiểm tra giỏ hàng, nhập Mã giảm giá (nếu có) và thực hiện Chuyển khoản QR Code ngân hàng 24/7 hoàn toàn 0% phí.
                </p>
              </div>

              {/* STEP 3 */}
              <div className="rounded-2xl border border-ods-border bg-white p-6 space-y-4 hover:border-black transition-all relative group">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-black text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                    03
                  </span>
                  <Key className="h-5 w-5 text-amber-500" />
                </div>
                <h3 className="font-heading text-sm font-extrabold uppercase text-black">Nhận Key Bản Quyền</h3>
                <p className="text-xs text-ods-textMuted leading-relaxed">
                  Key Game hiển thị ngay lập tức trên màn hình. Đồng thời được lưu trữ an toàn trong mục <strong>Lịch Sử Đơn Hàng</strong>.
                </p>
              </div>

              {/* STEP 4 */}
              <div className="rounded-2xl border border-ods-border bg-white p-6 space-y-4 hover:border-black transition-all relative group">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-black text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                    04
                  </span>
                  <Download className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="font-heading text-sm font-extrabold uppercase text-black">Kích Hoạt & Tải Game</h3>
                <p className="text-xs text-ods-textMuted leading-relaxed">
                  Nhập mã Key vào nền tảng tương ứng (Steam / Epic) để tải game bản quyền về máy và trải nghiệm ngay!
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 2: PLATFORM ACTIVATION GUIDES */}
          <section className="space-y-8 border-t border-ods-border pt-12">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="font-heading text-xl sm:text-2xl font-extrabold uppercase text-black">
                2. HƯỚNG DẪN KÍCH HOẠT KEY THEO NỀN TẢNG
              </h2>
              <p className="text-xs text-ods-textMuted">Chọn nền tảng bạn đang sử dụng để xem các bước thao tác chi tiết</p>
            </div>

            {/* PLATFORM TOGGLE BUTTONS */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPlatform('steam')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold uppercase transition-all ${
                  platform === 'steam'
                    ? 'bg-black text-white shadow-md'
                    : 'bg-ods-surface text-gray-700 hover:text-black border border-ods-border'
                }`}
              >
                <Monitor className="h-4 w-4 text-sky-400" />
                <span>Nền tảng Steam</span>
              </button>

              <button
                onClick={() => setPlatform('epic')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold uppercase transition-all ${
                  platform === 'epic'
                    ? 'bg-black text-white shadow-md'
                    : 'bg-ods-surface text-gray-700 hover:text-black border border-ods-border'
                }`}
              >
                <Gamepad2 className="h-4 w-4 text-emerald-400" />
                <span>Epic Games Store</span>
              </button>

              <button
                onClick={() => setPlatform('ea')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold uppercase transition-all ${
                  platform === 'ea'
                    ? 'bg-black text-white shadow-md'
                    : 'bg-ods-surface text-gray-700 hover:text-black border border-ods-border'
                }`}
              >
                <Key className="h-4 w-4 text-amber-400" />
                <span>EA App / Origin</span>
              </button>
            </div>

            {/* PLATFORM CONTENT DETAIL BOX */}
            <div className="rounded-2xl border border-ods-border bg-ods-surface/40 p-8 space-y-6 max-w-4xl mx-auto">
              {platform === 'steam' && (
                <div className="space-y-4 text-xs text-black leading-relaxed">
                  <h3 className="font-heading text-base font-extrabold uppercase text-ods-primary flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-sky-500" />
                    <span>CÁC BƯỚC KÍCH HOẠT KEY TRÊN STEAM</span>
                  </h3>
                  <div className="space-y-3 pl-2">
                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-ods-border">
                      <span className="font-extrabold text-sky-600 bg-sky-50 px-2 py-0.5 rounded text-[11px] shrink-0">Bước 1</span>
                      <p>Khởi động phần mềm <strong>Steam Client</strong> trên máy tính và đăng nhập tài khoản Steam của bạn.</p>
                    </div>

                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-ods-border">
                      <span className="font-extrabold text-sky-600 bg-sky-50 px-2 py-0.5 rounded text-[11px] shrink-0">Bước 2</span>
                      <p>Nhìn lên góc trên bên trái cửa sổ Steam, chọn menu <strong>Games</strong> ➔ Click chọn <strong>Activate a Product on Steam...</strong></p>
                    </div>

                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-ods-border">
                      <span className="font-extrabold text-sky-600 bg-sky-50 px-2 py-0.5 rounded text-[11px] shrink-0">Bước 3</span>
                      <p>Nhấn <strong>Next</strong> và <strong>I Agree</strong> với điều khoản dịch vụ của Valve Steam.</p>
                    </div>

                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-ods-border">
                      <span className="font-extrabold text-sky-600 bg-sky-50 px-2 py-0.5 rounded text-[11px] shrink-0">Bước 4</span>
                      <p>Copy mã Key Game tại ODS Store (VD: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">XXXXX-XXXXX-XXXXX</code>) dán vào ô Product Code ➔ Bấm <strong>Confirm</strong> để tải game!</p>
                    </div>
                  </div>
                </div>
              )}

              {platform === 'epic' && (
                <div className="space-y-4 text-xs text-black leading-relaxed">
                  <h3 className="font-heading text-base font-extrabold uppercase text-emerald-600 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span>CÁC BƯỚC KÍCH HOẠT KEY TRÊN EPIC GAMES STORE</span>
                  </h3>
                  <div className="space-y-3 pl-2">
                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-ods-border">
                      <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px] shrink-0">Bước 1</span>
                      <p>Mở phần mềm <strong>Epic Games Launcher</strong> hoặc truy cập trang web official của Epic Games.</p>
                    </div>

                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-ods-border">
                      <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px] shrink-0">Bước 2</span>
                      <p>Bấm vào biểu tượng Avatar tài khoản ở góc trên bên phải ➔ Chọn mục <strong>Redeem Code</strong>.</p>
                    </div>

                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-ods-border">
                      <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px] shrink-0">Bước 3</span>
                      <p>Dán mã Redeem Code mua tại ODS Store ➔ Bấm nút <strong>Redeem</strong>. Game sẽ xuất hiện ngay trong Thư viện (Library).</p>
                    </div>
                  </div>
                </div>
              )}

              {platform === 'ea' && (
                <div className="space-y-4 text-xs text-black leading-relaxed">
                  <h3 className="font-heading text-base font-extrabold uppercase text-amber-600 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber-500" />
                    <span>CÁC BƯỚC KÍCH HOẠT KEY TRÊN EA APP (ORIGIN)</span>
                  </h3>
                  <div className="space-y-3 pl-2">
                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-ods-border">
                      <span className="font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px] shrink-0">Bước 1</span>
                      <p>Đăng nhập vào ứng dụng <strong>EA App</strong> trên máy tính của bạn.</p>
                    </div>

                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-ods-border">
                      <span className="font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px] shrink-0">Bước 2</span>
                      <p>Vào mục <strong>My Collection</strong> ➔ Nhấp vào nút <strong>Redeem Code</strong> ở góc phía trên.</p>
                    </div>

                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-ods-border">
                      <span className="font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px] shrink-0">Bước 3</span>
                      <p>Dán mã Product Code mua tại ODS Store và xác nhận để tải game về thiết bị.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* CTA EXPLORE GAMES */}
          <div className="rounded-2xl bg-zinc-950 text-white p-8 border border-zinc-800 text-center space-y-4">
            <h3 className="font-heading text-lg font-extrabold uppercase text-white tracking-wider">
              BẠN ĐÃ SẴN SÀNG KHÁM PHÁ THẾ GIỚI GAME BẢN QUYỀN?
            </h3>
            <p className="text-xs text-zinc-400 font-light max-w-lg mx-auto">
              Hàng trăm tựa game hot nhất thế giới đang được giảm giá cực sâu tại ODS Store. Giao key tự động trong 3 giây.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-ods bg-ods-primary hover:bg-ods-primaryHover text-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider transition-all shadow-buttonGlow active:scale-95"
              >
                <span>Khám Phá Cửa Hàng Ngay</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </main>

        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
