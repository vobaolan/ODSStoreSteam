'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { CartProvider } from '@/context/CartContext';
import { 
  FileText, ShieldCheck, CheckCircle2, AlertCircle, Scale, 
  HelpCircle, MessageSquare, ArrowRight, Lock, UserCheck
} from 'lucide-react';

export default function TermsPolicyPage() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-white text-black flex flex-col antialiased">
        <Header />

        {/* HERO BANNER */}
        <section className="relative overflow-hidden bg-zinc-950 py-16 text-white border-b border-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 to-transparent pointer-events-none" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 text-xs font-bold text-blue-400 uppercase tracking-widest mx-auto">
              <Scale className="h-4 w-4" />
              <span>QUY ĐỊNH & THỎA THUẬN NGƯỜI DÙNG</span>
            </div>

            <h1
              className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wider uppercase text-white"
              style={{ lineHeight: '1.55' }}
            >
              ĐIỀU KHOẢN DỊCH VỤ ODS STORE
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
              Vui lòng đọc kỹ các quy định và điều khoản sử dụng dưới đây trước khi thực hiện giao dịch mua bán bản quyền game và tài khoản dịch vụ tại ODS Store.
            </p>
          </div>
        </section>

        {/* BREADCRUMB */}
        <div className="bg-ods-surface border-b border-ods-border py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-ods-textMuted">
            <Link href="/" className="hover:text-black transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-black font-bold">Điều khoản dịch vụ</span>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <div className="lg:col-span-2 space-y-10">
              {/* SECTION 1 */}
              <section className="space-y-3">
                <div className="flex items-center gap-3 border-b border-ods-border pb-3">
                  <span className="font-heading text-xl font-extrabold text-ods-primary">01.</span>
                  <h2 className="font-heading text-lg font-extrabold uppercase text-black">
                    QUY ĐỊNH VỀ TÀI KHOẢN NGƯỜI DÙNG
                  </h2>
                </div>
                <div className="space-y-3 text-xs text-ods-textMuted leading-relaxed">
                  <p>Khi đăng ký tài khoản tại ODS Store, người dùng cần tuân thủ các nghĩa vụ sau:</p>
                  <ul className="space-y-2 pl-4 list-disc text-black font-medium">
                    <li>Cung cấp thông tin địa chỉ Email chính xác để nhận mã Key Game và thông báo giao dịch.</li>
                    <li>Có trách nhiệm tự bảo mật mật khẩu tài khoản cá nhân. ODS không chịu trách nhiệm với các trường hợp lộ mật khẩu từ phía người dùng.</li>
                    <li>Mỗi cá nhân chỉ nên đăng ký và sử dụng một tài khoản chính chủ trên hệ thống.</li>
                  </ul>
                </div>
              </section>

              {/* SECTION 2 */}
              <section className="space-y-3">
                <div className="flex items-center gap-3 border-b border-ods-border pb-3">
                  <span className="font-heading text-xl font-extrabold text-ods-primary">02.</span>
                  <h2 className="font-heading text-lg font-extrabold uppercase text-black">
                    GIAO DỊCH VÀ GIAO NHẬN SẢN PHẨM TỰ ĐỘNG
                  </h2>
                </div>
                <div className="space-y-3 text-xs text-ods-textMuted leading-relaxed">
                  <p>Hệ thống ODS Store vận hành quy trình xuất Key hoàn toàn tự động 24/7:</p>
                  <ul className="space-y-2 pl-4 list-disc text-black font-medium">
                    <li>Sau khi hệ thống ngân hàng xác nhận giao dịch thành công, Key Game sẽ hiển thị tức thì tại giao diện và lưu trữ trong mục <strong>Lịch Sử Đơn Hàng</strong>.</li>
                    <li>Mức giá hiển thị trên website là giá thanh toán cuối cùng đã bao gồm các chương trình khuyến mãi.</li>
                    <li>Trường hợp chuyển khoản sai cú pháp hoặc sai số tiền, hệ thống sẽ treo đơn chờ bộ phận kỹ thuật viên xác minh hỗ trợ cộng số dư thủ công trong tối đa 15 phút.</li>
                  </ul>
                </div>
              </section>

              {/* SECTION 3 */}
              <section className="space-y-3">
                <div className="flex items-center gap-3 border-b border-ods-border pb-3">
                  <span className="font-heading text-xl font-extrabold text-ods-primary">03.</span>
                  <h2 className="font-heading text-lg font-extrabold uppercase text-black">
                    CÁC HÀNH VI BỊ CẤM TRÊN HỆ THỐNG
                  </h2>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-ods p-4 space-y-2 text-xs text-red-950">
                  <div className="flex items-center gap-2 font-bold text-red-700 uppercase">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span>Nghiêm Cấm Tuyệt Đối</span>
                  </div>
                  <ul className="space-y-1.5 pl-4 list-disc leading-relaxed text-red-900">
                    <li>Sử dụng các thẻ ngân hàng giả mạo, thẻ chui (CC chùa) hoặc can thiệp bất hợp pháp vào cổng thanh toán.</li>
                    <li>Lợi dụng lỗi hệ thống (Exploit Bug) để trục lợi mã giảm giá hoặc rút tiền không hợp lệ.</li>
                    <li>Spam giao dịch rác hoặc có hành vi gian lận làm gián đoạn hạ tầng máy chủ ODS Store.</li>
                  </ul>
                </div>
              </section>
            </div>

            {/* SIDEBAR */}
            <div className="space-y-6">
              <div className="rounded-ods border border-ods-border bg-ods-surface p-6 space-y-4">
                <div className="flex items-center gap-3 text-black">
                  <FileText className="h-6 w-6 text-ods-primary" />
                  <h3 className="font-heading text-sm font-extrabold uppercase">TỔNG QUAN CAM KẾT</h3>
                </div>
                <p className="text-xs text-ods-textMuted leading-relaxed">
                  ODS Store cam kết mang lại môi trường mua sắm game bản quyền minh bạch, an toàn và bảo vệ tối đa quyền lợi cho game thủ Việt Nam.
                </p>

                <div className="pt-2">
                  <Link
                    href="/policies/privacy"
                    className="w-full flex items-center justify-center gap-2 rounded-ods bg-black text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Xem Chính Sách Bảo Mật</span>
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
