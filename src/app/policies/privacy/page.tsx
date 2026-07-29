'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { CartProvider } from '@/context/CartContext';
import { 
  ShieldCheck, Lock, CheckCircle2, Eye, Server, 
  HelpCircle, MessageSquare, ArrowRight, ShieldAlert, Key
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-white text-black flex flex-col antialiased">
        <Header />

        {/* HERO BANNER */}
        <section className="relative overflow-hidden bg-zinc-950 py-16 text-white border-b border-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/40 to-transparent pointer-events-none" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-400 uppercase tracking-widest mx-auto">
              <Lock className="h-4 w-4" />
              <span>BẢO MẬT DỮ LIỆU TỐI ĐA</span>
            </div>

            <h1
              className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wider uppercase text-white"
              style={{ lineHeight: '1.55' }}
            >
              CHÍNH SÁCH BẢO MẬT THÔNG TIN
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
              ODS Store cam kết bảo vệ tuyệt đối thông tin cá nhân và dữ liệu thanh toán của khách hàng theo các tiêu chuẩn mã hóa quốc tế cao nhất.
            </p>
          </div>
        </section>

        {/* BREADCRUMB */}
        <div className="bg-ods-surface border-b border-ods-border py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-ods-textMuted">
            <Link href="/" className="hover:text-black transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-black font-bold">Chính sách bảo mật</span>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2 space-y-10">
              {/* SECTION 1 */}
              <section className="space-y-3">
                <div className="flex items-center gap-3 border-b border-ods-border pb-3">
                  <span className="font-heading text-xl font-extrabold text-emerald-600">01.</span>
                  <h2 className="font-heading text-lg font-extrabold uppercase text-black">
                    MỤC ĐÍCH THU THẬP THÔNG TIN CÁ NHÂN
                  </h2>
                </div>
                <div className="space-y-3 text-xs text-ods-textMuted leading-relaxed">
                  <p>Chúng tôi chỉ thu thập các thông tin tối thiểu cần thiết để phục vụ quá trình xử lý đơn hàng của bạn bao gồm:</p>
                  <ul className="space-y-2 pl-4 list-disc text-black font-medium">
                    <li><strong>Địa chỉ Email:</strong> Để gửi thông tin Key Game, hóa đơn và khôi phục mật khẩu tài khoản.</li>
                    <li><strong>Họ và tên hiển thị:</strong> Để hỗ trợ CSKH xưng hô lịch sự và xác minh tài khoản khi bảo hành.</li>
                    <li><strong>Lịch sử giao dịch:</strong> Lưu giữ mã Key Game trong mục Vault cá nhân để bạn có thể xem lại bất kỳ lúc nào.</li>
                  </ul>
                </div>
              </section>

              {/* SECTION 2 */}
              <section className="space-y-3">
                <div className="flex items-center gap-3 border-b border-ods-border pb-3">
                  <span className="font-heading text-xl font-extrabold text-emerald-600">02.</span>
                  <h2 className="font-heading text-lg font-extrabold uppercase text-black">
                    CAM KẾT KHÔNG TIẾT LỘ CHO BÊN THỨ BA
                  </h2>
                </div>
                <div className="space-y-3 text-xs text-ods-textMuted leading-relaxed">
                  <p>ODS Store <strong>tuyệt đối không trao đổi, bán hoặc chia sẻ</strong> thông tin cá nhân của khách hàng cho bất kỳ bên thứ ba nào vì mục đích thương mại hay quảng cáo rác.</p>
                  <p>Thông tin thanh toán ngân hàng qua mã VietQR được xử lý trực tiếp thông qua cổng thanh toán bảo mật của ngân hàng, ODS Store hoàn toàn không lưu trữ mã PIN hay mật khẩu ngân hàng của bạn.</p>
                </div>
              </section>

              {/* SECTION 3 */}
              <section className="space-y-3">
                <div className="flex items-center gap-3 border-b border-ods-border pb-3">
                  <span className="font-heading text-xl font-extrabold text-emerald-600">03.</span>
                  <h2 className="font-heading text-lg font-extrabold uppercase text-black">
                    CÔNG NGHỆ MÃ HÓA BẢO VỆ DỮ LIỆU
                  </h2>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-ods p-4 space-y-2 text-xs text-emerald-950">
                  <div className="flex items-center gap-2 font-bold text-emerald-800 uppercase">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Mã Hóa Chuẩn SSL 256-Bit</span>
                  </div>
                  <p className="leading-relaxed text-emerald-900">
                    Toàn bộ kết nối giữa trình duyệt của bạn và hệ thống máy chủ ODS Store đều được mã hóa bằng chứng chỉ SSL (HTTPS) tiêu chuẩn cao cấp, ngăn chặn tuyệt đối các hành vi đánh cắp dữ liệu trên đường truyền.
                  </p>
                </div>
              </section>
            </div>

            {/* SIDEBAR */}
            <div className="space-y-6">
              <div className="rounded-ods border border-ods-border bg-ods-surface p-6 space-y-4">
                <div className="flex items-center gap-3 text-black">
                  <Lock className="h-6 w-6 text-emerald-600" />
                  <h3 className="font-heading text-sm font-extrabold uppercase">AN TÂM TUYỆT ĐỐI</h3>
                </div>
                <p className="text-xs text-ods-textMuted leading-relaxed">
                  Bạn có quyền yêu cầu xóa vĩnh viễn dữ liệu tài khoản cá nhân bất kỳ lúc nào bằng cách gửi yêu cầu tới bộ phận hỗ trợ.
                </p>

                <div className="pt-2">
                  <Link
                    href="/policies/terms"
                    className="w-full flex items-center justify-center gap-2 rounded-ods bg-black text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Xem Điều Khoản Dịch Vụ</span>
                  </Link>
                </div>
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
