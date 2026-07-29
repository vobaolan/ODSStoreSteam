'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { CartProvider } from '@/context/CartContext';
import { 
  HelpCircle, Search, ChevronDown, Gamepad2, CreditCard, Shield, 
  UserCheck, MessageSquare, ArrowRight, Sparkles, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  id: string;
  category: 'activation' | 'payment' | 'account' | 'security';
  question: string;
  answer: string | React.ReactNode;
}

export default function FAQPolicyPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const FAQ_LIST: FAQItem[] = [
    {
      id: 'faq-1',
      category: 'activation',
      question: 'Sau khi mua hàng, tôi sẽ nhận Key Game bằng cách nào và mất bao lâu?',
      answer: 'Hệ thống ODS Store giao Key hoàn toàn tự động 24/7. Ngay sau khi bạn hoàn tất thanh toán thành công, Key Game sẽ xuất hiện trực tiếp trên màn hình và đồng thời lưu trữ vĩnh viễn trong mục "Lịch Sử Đơn Hàng" tại trang Cá Nhân của bạn (Thời gian giao key chưa tới 3 giây).'
    },
    {
      id: 'faq-2',
      category: 'activation',
      question: 'Làm thế nào để kích hoạt Key Game trên ứng dụng Steam?',
      answer: (
        <div className="space-y-2">
          <p>Để kích hoạt Key trên Steam, bạn thực hiện theo các bước đơn giản sau:</p>
          <ol className="list-decimal pl-5 space-y-1 font-medium text-black">
            <li>Mở phần mềm <strong>Steam</strong> trên máy tính và đăng nhập tài khoản của bạn.</li>
            <li>Bấm vào menu <strong>Games</strong> ở góc trên bên trái ➔ Chọn <strong>Activate a Product on Steam...</strong></li>
            <li>Dán mã Key mua tại ODS Store và nhấn <strong>Next</strong> để hoàn tất thêm game vào Library.</li>
          </ol>
        </div>
      )
    },
    {
      id: 'faq-3',
      category: 'payment',
      question: 'ODS Store hỗ trợ những phương thức thanh toán nào?',
      answer: 'Chúng tôi hỗ trợ đa dạng phương thức thanh toán an toàn bao gồm: Chuyển khoản Ngân hàng tự động qua QR Code (VietQR 24/7 miễn phí chuyển tiền), Ví Điện Tử MoMo, VNPay, ZaloPay và Thanh toán trực tiếp bằng Ví số dư ODS Store.'
    },
    {
      id: 'faq-4',
      category: 'payment',
      question: 'Nạp tiền vào Ví ODS Store có mất phí không và số dư dùng để làm gì?',
      answer: 'Nạp tiền vào Ví ODS hoàn toàn 0% phí giao dịch. Số dư trong Ví ODS giúp bạn thanh toán đơn hàng tức thì trong 1 giây mà không cần thao tác quét QR ngân hàng lại nhiều lần, vô cùng tiện lợi khi săn Flash Sale.'
    },
    {
      id: 'faq-5',
      category: 'account',
      question: 'Sản phẩm dạng "Tài Khoản Game / Dịch Vụ Premium" hoạt động như thế nào?',
      answer: 'Đối với sản phẩm dạng Tài khoản hoặc Nâng cấp tài khoản, ODS sẽ bàn giao thông tin đăng nhập riêng biệt (Username/Password) hoặc thực hiện nâng cấp chính chủ trực tiếp trên tài khoản của bạn theo đúng mô tả sản phẩm.'
    },
    {
      id: 'faq-6',
      category: 'security',
      question: 'Key Game mua tại ODS Store có bị khóa tài khoản Steam (VAC Ban) không?',
      answer: 'Tất cả Key Game bán ra tại ODS Store là 100% bản quyền chính hãng lấy từ các nhà phát hành game thế giới. Game kích hoạt vĩnh viễn trên Steam của bạn và tuyệt đối không bao giờ bị khóa tài khoản.'
    },
    {
      id: 'faq-7',
      category: 'security',
      question: 'Nếu Key mua bị lỗi "Already Product Activated" thì phải xử lý thế nào?',
      answer: 'Nếu gặp trường hợp hiếm hoi này, bạn chỉ cần chụp màn hình lỗi và gửi Mã đơn hàng cho CSKH ODS qua Fanpage. Đội ngũ kỹ thuật viên ODS sẽ kiểm tra và đổi ngay Key mới 100% cho bạn trong dưới 15 phút.'
    }
  ];

  const filteredFAQs = FAQ_LIST.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = typeof item.answer === 'string'
      ? item.question.toLowerCase().includes(searchQuery.toLowerCase()) || item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      : item.question.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <CartProvider>
      <div className="min-h-screen bg-white text-black flex flex-col antialiased">
        <Header />

        {/* HERO BANNER */}
        <section className="relative overflow-hidden bg-zinc-950 py-16 text-white border-b border-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-950/30 to-transparent pointer-events-none" />
          <div className="mx-auto max-w-4xl px-4 text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-400 uppercase tracking-widest mx-auto">
              <HelpCircle className="h-4 w-4" />
              <span>TRUNG TÂM HỢ TRỢ KHÁCH HÀNG</span>
            </div>

            <h1
              className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wider uppercase text-white"
              style={{ lineHeight: '1.55' }}
            >
              CÂU HỎI THƯỜNG GẶP (FAQ)
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-xl mx-auto leading-relaxed">
              Giải đáp nhanh chóng tất cả thắc mắc về cách kích hoạt Key Steam, quy trình thanh toán, nạp ví và chính sách bảo mật tại ODS Store.
            </p>

            {/* SEARCH INPUT BAR */}
            <div className="relative max-w-xl mx-auto pt-2">
              <Search className="absolute left-4 top-5 h-5 w-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Nhập từ khóa tìm kiếm (VD: kích hoạt key, thanh toán, ví ODS...)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 py-3.5 pl-12 pr-4 text-xs font-semibold text-white placeholder-zinc-500 focus:border-ods-primary focus:outline-none focus:ring-1 focus:ring-ods-primary shadow-xl transition-all"
              />
            </div>
          </div>
        </section>

        {/* BREADCRUMB */}
        <div className="bg-ods-surface border-b border-ods-border py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-ods-textMuted">
            <Link href="/" className="hover:text-black transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-black font-bold">Câu hỏi thường gặp</span>
          </div>
        </div>

        {/* MAIN FAQ CONTENT */}
        <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          {/* CATEGORY TABS FILTER */}
          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-ods-border pb-4">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all ${
                activeCategory === 'all'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-ods-surface text-gray-600 hover:text-black border border-ods-border'
              }`}
            >
              Tất Cả Câu Hỏi ({FAQ_LIST.length})
            </button>

            <button
              onClick={() => setActiveCategory('activation')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase transition-all ${
                activeCategory === 'activation'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-ods-surface text-gray-600 hover:text-black border border-ods-border'
              }`}
            >
              <Gamepad2 className="h-3.5 w-3.5 text-sky-400" />
              <span>Kích Hoạt Key Game</span>
            </button>

            <button
              onClick={() => setActiveCategory('payment')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase transition-all ${
                activeCategory === 'payment'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-ods-surface text-gray-600 hover:text-black border border-ods-border'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
              <span>Thanh Toán & Nạp Ví</span>
            </button>

            <button
              onClick={() => setActiveCategory('security')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase transition-all ${
                activeCategory === 'security'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-ods-surface text-gray-600 hover:text-black border border-ods-border'
              }`}
            >
              <Shield className="h-3.5 w-3.5 text-amber-400" />
              <span>Bảo Hành & An Toàn</span>
            </button>
          </div>

          {/* ACCORDION ITEMS LIST */}
          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <div className="py-16 text-center text-xs text-ods-textMuted space-y-2">
                <HelpCircle className="h-10 w-10 text-gray-300 mx-auto" />
                <p>Không tìm thấy câu hỏi nào phù hợp với từ khóa "{searchQuery}".</p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="text-xs font-bold text-ods-primary uppercase hover:underline"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              </div>
            ) : (
              filteredFAQs.map((item) => {
                const isOpen = openId === item.id;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-ods-border bg-white overflow-hidden transition-all duration-200 hover:border-black"
                  >
                    <button
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 bg-white hover:bg-ods-surface/50 transition-colors cursor-pointer"
                    >
                      <span className="font-heading text-sm font-extrabold text-black pr-2">
                        {item.question}
                      </span>
                      <div className={`p-1.5 rounded-full border border-ods-border text-gray-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-black text-white border-black' : ''}`}>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-2 text-xs text-ods-textMuted leading-relaxed border-t border-ods-border/50 bg-ods-surface/30">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>

          {/* NEED STILL HELP CALLOUT BOX */}
          <div className="rounded-2xl bg-zinc-950 text-white p-8 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="font-heading text-base font-extrabold uppercase text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <span>VẪN CẦN GIẢI ĐÁP THẮC MẮC?</span>
              </h3>
              <p className="text-xs text-zinc-400 font-light">
                Đội ngũ chăm sóc khách hàng ODS Store luôn có mặt 24/7 để tư vấn và hỗ trợ bạn tức thì.
              </p>
            </div>

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-ods bg-ods-primary hover:bg-ods-primaryHover text-white px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all shadow-buttonGlow shrink-0"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Liên Hệ CSKH 24/7</span>
            </a>
          </div>
        </main>

        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
