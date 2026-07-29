'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { CartProvider } from '@/context/CartContext';
import { 
  ShieldCheck, RefreshCw, Clock, CheckCircle2, AlertTriangle, 
  HelpCircle, MessageSquare, ArrowRight, Shield, Zap, FileText, PhoneCall
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function WarrantyPolicyPage() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-white text-black flex flex-col antialiased">
        <Header />

        {/* HERO BANNER SECTION */}
        <section className="relative overflow-hidden bg-zinc-950 py-16 text-white border-b border-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-950/40 to-transparent pointer-events-none" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 border border-sky-500/20 px-3.5 py-1 text-xs font-bold text-sky-400 uppercase tracking-widest">
                  <ShieldCheck className="h-4 w-4" />
                  <span>CAM KẾT AN TÂM 100%</span>
                </div>
                <h1
                  className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wider uppercase text-white"
                  style={{ lineHeight: '1.55' }}
                >
                  CHÍNH SÁCH BẢO HÀNH & HOÀN TIỀN
                </h1>
                <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed">
                  Tại ODS Store, tất cả bản quyền Key Game và Tài Khoản Dịch Vụ đều được đảm bảo chính hãng 100%. Chúng tôi cam kết bảo vệ quyền lợi tối đa cho game thủ với chính sách đổi trả nhanh chóng trong 15 phút.
                </p>
              </div>

              {/* QUICK STAT BADGE */}
              <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl backdrop-blur-md shadow-2xl space-y-4 shrink-0 w-full md:w-80">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20 text-sky-400">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Thời Gian Xử Lý Bảo Hành</span>
                    <span className="text-xl font-extrabold text-white">Dưới 15 Phút</span>
                  </div>
                </div>
                <div className="border-t border-zinc-800 pt-3 flex justify-between items-center text-xs text-zinc-400">
                  <span>Hỗ trợ kỹ thuật:</span>
                  <span className="font-extrabold text-emerald-400">24/7 Tất cả các ngày</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BREADCRUMB */}
        <div className="bg-ods-surface border-b border-ods-border py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-ods-textMuted">
            <Link href="/" className="hover:text-black transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-black font-bold">Chính sách bảo hành</span>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">
          {/* 4 CORE COMMITMENT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-ods border border-ods-border bg-white p-6 space-y-3 hover:border-black hover:shadow-lightShadow transition-all">
              <div className="w-12 h-12 rounded-ods bg-sky-50 border border-sky-200 flex items-center justify-center text-ods-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-sm font-extrabold uppercase text-black">KEY BẢN QUYỀN 100%</h3>
              <p className="text-xs text-ods-textMuted leading-relaxed">
                Nhập trực tiếp từ các nhà phát hành Steam, Epic Games, EA, Ubisoft. Không bán Key giả hay rác code.
              </p>
            </div>

            <div className="rounded-ods border border-ods-border bg-white p-6 space-y-3 hover:border-black hover:shadow-lightShadow transition-all">
              <div className="w-12 h-12 rounded-ods bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <RefreshCw className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-sm font-extrabold uppercase text-black">1 ĐỔI 1 TỨC THÌ</h3>
              <p className="text-xs text-ods-textMuted leading-relaxed">
                Đổi ngay Key mới hoặc tài khoản tương đương nếu sản phẩm bị lỗi do hệ thống kích hoạt.
              </p>
            </div>

            <div className="rounded-ods border border-ods-border bg-white p-6 space-y-3 hover:border-black hover:shadow-lightShadow transition-all">
              <div className="w-12 h-12 rounded-ods bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-sm font-extrabold uppercase text-black">HOÀN TIỀN 100%</h3>
              <p className="text-xs text-ods-textMuted leading-relaxed">
                Hoàn tiền 100% vào Ví ODS hoặc Ngân hàng nếu hết hàng thay thế hoặc sản phẩm không đúng mô tả.
              </p>
            </div>

            <div className="rounded-ods border border-ods-border bg-white p-6 space-y-3 hover:border-black hover:shadow-lightShadow transition-all">
              <div className="w-12 h-12 rounded-ods bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-sm font-extrabold uppercase text-black">BẢO HÀNH TOÀN THỜI GIAN</h3>
              <p className="text-xs text-ods-textMuted leading-relaxed">
                Bảo hành trọn đời sản phẩm đối với Key Game vĩnh viễn và bảo hành thời hạn đối với Tài khoản gói dịch vụ.
              </p>
            </div>
          </div>

          {/* DETAILED POLICY SECTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2 space-y-10">
              {/* SECTION 1 */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 border-b border-ods-border pb-3">
                  <span className="font-heading text-xl font-extrabold text-ods-primary">01.</span>
                  <h2 className="font-heading text-lg font-extrabold uppercase tracking-wider text-black">
                    NỘI DUNG VÀ ĐIỀU KIỆN BẢO HÀNH
                  </h2>
                </div>
                <div className="space-y-3 text-xs text-ods-textMuted leading-relaxed">
                  <p>ODS Store thực hiện bảo hành tất cả sản phẩm kỹ thuật số được mua trực tiếp tại website <strong>http://localhost:3000</strong>. Các trường hợp được bảo hành bao gồm:</p>
                  <ul className="space-y-2 pl-4 list-disc text-black font-medium">
                    <li>Key game nhận được bị báo lỗi <strong>Duplicate / Already Used</strong> (Đã được kích hoạt trước đó).</li>
                    <li>Key game bị sai vùng quốc gia (Invalid Region) so với vùng ghi trên thông tin sản phẩm.</li>
                    <li>Mã kích hoạt bị mờ hoặc thiếu ký tự do lỗi phát sinh từ nhà cung cấp.</li>
                    <li>Tài khoản game/dịch vụ mua tại ODS bị mất quyền truy cập trong thời hạn bảo hành.</li>
                  </ul>
                </div>
              </section>

              {/* SECTION 2 */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 border-b border-ods-border pb-3">
                  <span className="font-heading text-xl font-extrabold text-ods-primary">02.</span>
                  <h2 className="font-heading text-lg font-extrabold uppercase tracking-wider text-black">
                    CÁC TRƯỜNG HỢP KHÔNG ĐƯỢC BẢO HÀNH
                  </h2>
                </div>
                <div className="bg-red-50/50 border border-red-200 rounded-ods p-4 space-y-3 text-xs text-red-950">
                  <div className="flex items-center gap-2 font-bold text-red-700 uppercase">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                    <span>Lưu Ý Quan Trọng Nâng Cao Bảo Mật</span>
                  </div>
                  <ul className="space-y-2 pl-4 list-disc leading-relaxed text-red-900">
                    <li>Tài khoản cá nhân của khách hàng bị cấm (VAC Ban, Account Ban) do sử dụng phần mềm thứ ba / Hack / Cheat.</li>
                    <li>Khách hàng tự ý tiết lộ Key game hoặc thông tin tài khoản cho người khác dẫn đến mất mát.</li>
                    <li>Khách hàng yêu cầu trả hàng với lý do "không thích game" hoặc "máy tính không đủ cấu hình chơi game".</li>
                    <li>Vượt quá thời hạn bảo hành quy định đối với từng loại tài khoản dịch vụ.</li>
                  </ul>
                </div>
              </section>

              {/* SECTION 3: WORKFLOW STEPS */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 border-b border-ods-border pb-3">
                  <span className="font-heading text-xl font-extrabold text-ods-primary">03.</span>
                  <h2 className="font-heading text-lg font-extrabold uppercase tracking-wider text-black">
                    QUY TRÌNH YÊU CẦU BẢO HÀNH (3 BƯỚC NHAH NÓNG)
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="bg-ods-surface p-4 rounded-ods border border-ods-border space-y-2">
                    <span className="w-7 h-7 rounded-full bg-black text-white font-extrabold text-xs flex items-center justify-center">1</span>
                    <h4 className="font-heading text-xs font-bold text-black uppercase">Chụp Ảnh Lỗi</h4>
                    <p className="text-[11px] text-ods-textMuted">Chụp lại ảnh màn hình báo lỗi khi kích hoạt Key trên Steam / Epic Games.</p>
                  </div>

                  <div className="bg-ods-surface p-4 rounded-ods border border-ods-border space-y-2">
                    <span className="w-7 h-7 rounded-full bg-black text-white font-extrabold text-xs flex items-center justify-center">2</span>
                    <h4 className="font-heading text-xs font-bold text-black uppercase">Gửi Mã Đơn Hàng</h4>
                    <p className="text-[11px] text-ods-textMuted">Gửi Mã đơn hàng (VD: ODS-8X912) và ảnh lỗi cho bộ phận CSKH ODS.</p>
                  </div>

                  <div className="bg-ods-surface p-4 rounded-ods border border-ods-border space-y-2">
                    <span className="w-7 h-7 rounded-full bg-black text-white font-extrabold text-xs flex items-center justify-center">3</span>
                    <h4 className="font-heading text-xs font-bold text-black uppercase">Nhận Key Mới</h4>
                    <p className="text-[11px] text-ods-textMuted">Kỹ thuật viên xác minh và cấp Key mới hoặc hoàn tiền ngay trong 15 phút.</p>
                  </div>
                </div>
              </section>
            </div>

            {/* SIDEBAR SUPPORT BOX */}
            <div className="space-y-6">
              <div className="rounded-ods border border-ods-border bg-ods-surface p-6 space-y-4">
                <div className="flex items-center gap-3 text-black">
                  <MessageSquare className="h-6 w-6 text-ods-primary" />
                  <h3 className="font-heading text-sm font-extrabold uppercase">CẦN HỖ TRỢ BẢO HÀNH GẤP?</h3>
                </div>
                <p className="text-xs text-ods-textMuted leading-relaxed">
                  Đội ngũ kỹ thuật ODS Store luôn túc trực 24/7 để giải quyết mọi sự cố kích hoạt cho bạn.
                </p>

                <div className="space-y-2.5 pt-2">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-ods bg-ods-primary hover:bg-ods-primaryHover text-white py-3 text-xs font-bold uppercase tracking-wider transition-all shadow-buttonGlow"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Chat Fanpage CSKH 24/7</span>
                  </a>

                  <Link
                    href="/policies/faq"
                    className="w-full flex items-center justify-center gap-2 rounded-ods border border-ods-border bg-white text-black py-3 text-xs font-bold uppercase tracking-wider hover:border-black transition-all"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Xem Câu Hỏi Thường Gặp</span>
                  </Link>
                </div>
              </div>

              <div className="rounded-ods border border-emerald-200 bg-emerald-50/60 p-5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Xác Minh Đơn Hàng Tự Động</span>
                </div>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  Mọi Key Game mua tại ODS đều lưu trữ mã checksum an toàn trong lịch sử đơn hàng tài khoản của bạn.
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
