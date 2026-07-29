'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MessageSquare, X, Send, ChevronRight, HelpCircle, ShieldCheck, Heart, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export const Footer: React.FC = () => {
  // Chatbot states
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Xin chào! ODS Support Assistant có thể giúp gì cho bạn hôm nay? ⚡',
      timestamp: 'Ngay bây giờ',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate Bot response after 1s
    setTimeout(() => {
      setIsTyping(false);
      let replyText = 'Cảm ơn bạn đã liên hệ ODS. Yêu cầu của bạn đang được chuyển đến nhân viên trực ban. Bạn cũng có thể liên hệ trực tiếp Fanpage để được hỗ trợ tức thì! ⚡';

      const cleanText = textToSend.toLowerCase();
      if (cleanText.includes('key') || cleanText.includes('kích hoạt') || cleanText.includes('active')) {
        replyText = 'Để kích hoạt key game Steam: Bạn mở Steam Client trên PC -> Chọn menu "Games" ở góc trên trái -> Chọn "Activate a Product on Steam..." -> Paste mã key đã mua ở ODS Vault vào nhé!';
      } else if (cleanText.includes('bảo hành') || cleanText.includes('lỗi')) {
        replyText = 'ODS cam kết bảo hành lỗi 1-đổi-1 cho mọi key game bản quyền trong suốt thời hạn bảo hành. Bạn vui lòng gửi mã đơn hàng cho nhân viên trực để được check nhé!';
      } else if (cleanText.includes('nạp tiền') || cleanText.includes('momo') || cleanText.includes('vietqr')) {
        replyText = 'Hệ thống ODS hỗ trợ quét VietQR chuyển khoản tự động 24/7. Bạn chỉ cần quét mã QR được sinh ra lúc thanh toán, tiền sẽ tự động nhận diện và xuất key sau 15s!';
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 1000);
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <>
      {/* FOOTER */}
      <footer className="border-t border-ods-border bg-[#F9FAFB] py-14 text-xs text-ods-textMuted mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Main 5-Column Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* COLUMN 1: INTRO & SUPPORT */}
            <div className="space-y-4 lg:col-span-1">
              <Link href="/" className="inline-block">
                <img
                  src="/images/logo.png"
                  alt="ODS Logo"
                  className="h-6 w-auto object-contain"
                />
              </Link>
              <p className="font-light leading-relaxed text-gray-500">
                Hệ thống phân phối mã kích hoạt (Key code) và tài khoản game tự động 24/7 hàng đầu Việt Nam. Tốc độ nhận sản phẩm tức thì, uy tín và bảo mật tuyệt đối.
              </p>
              
              {/* Kênh Support Facebook Fanpage */}
              <div className="pt-1">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-ods border border-ods-border bg-white px-4 py-2.5 font-bold uppercase tracking-wider text-black hover:border-ods-primary hover:text-ods-primary hover:shadow-skyGlow transition-all"
                >
                  <FacebookIcon className="h-4 w-4 text-[#1877F2] fill-current" />
                  <span>Kênh Support Fanpage</span>
                </a>
              </div>
            </div>

            {/* COLUMN 2: TÀI KHOẢN */}
            <div className="space-y-4">
              <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-black border-b border-ods-border pb-2">
                Quản lý tài khoản
              </h3>
              <ul className="space-y-2.5 font-medium">
                <li>
                  <Link href="/profile" className="hover:text-black transition-colors flex items-center gap-1 group">
                    <ChevronRight className="h-3 w-3 text-ods-primary transition-transform group-hover:translate-x-0.5" />
                    Đăng Nhập / Đăng Ký
                  </Link>
                </li>
                <li>
                  <Link href="/profile?tab=orders" className="hover:text-black transition-colors flex items-center gap-1 group">
                    <ChevronRight className="h-3 w-3 text-ods-primary transition-transform group-hover:translate-x-0.5" />
                    Lịch Sử Đơn Hàng
                  </Link>
                </li>
                <li>
                  <Link href="/profile?tab=vault" className="hover:text-black transition-colors flex items-center gap-1 group">
                    <ChevronRight className="h-3 w-3 text-ods-primary transition-transform group-hover:translate-x-0.5" />
                    Kho Game Đã Mua (Vault)
                  </Link>
                </li>
                <li>
                  <Link href="/profile?tab=wishlist" className="hover:text-black transition-colors flex items-center gap-1 group">
                    <ChevronRight className="h-3 w-3 text-ods-primary transition-transform group-hover:translate-x-0.5" />
                    Danh Sách Ưu Thích
                  </Link>
                </li>
              </ul>
            </div>

            {/* COLUMN 3: THÔNG TIN & CHÍNH SÁCH */}
            <div className="space-y-4">
              <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-black border-b border-ods-border pb-2">
                Thông tin và chính sách
              </h3>
              <ul className="space-y-2.5 font-medium">
                <li>
                  <Link href="/policies/warranty" className="hover:text-black transition-colors flex items-center gap-1 group">
                    <ChevronRight className="h-3 w-3 text-ods-primary transition-transform group-hover:translate-x-0.5" />
                    Chính Sách Bảo Hành
                  </Link>
                </li>
                <li>
                  <Link href="/policies/faq" className="hover:text-black transition-colors flex items-center gap-1 group">
                    <ChevronRight className="h-3 w-3 text-ods-primary transition-transform group-hover:translate-x-0.5" />
                    Câu Hỏi Thường Gặp
                  </Link>
                </li>
                <li>
                  <Link href="/policies/guide" className="hover:text-black transition-colors flex items-center gap-1 group">
                    <ChevronRight className="h-3 w-3 text-ods-primary transition-transform group-hover:translate-x-0.5" />
                    Hướng Dẫn Mua Hàng
                  </Link>
                </li>
                <li>
                  <Link href="/policies/terms" className="hover:text-black transition-colors flex items-center gap-1 group">
                    <ChevronRight className="h-3 w-3 text-ods-primary transition-transform group-hover:translate-x-0.5" />
                    Điều khoản và điều kiện
                  </Link>
                </li>
                <li>
                  <Link href="/policies/privacy" className="hover:text-black transition-colors flex items-center gap-1 group">
                    <ChevronRight className="h-3 w-3 text-ods-primary transition-transform group-hover:translate-x-0.5" />
                    Chính Sách Bảo Mật
                  </Link>
                </li>
              </ul>
            </div>

            {/* COLUMN 4: TIÊU CHUẨN DỊCH VỤ */}
            <div className="space-y-4">
              <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-black border-b border-ods-border pb-2">
                Cam kết chất lượng
              </h3>
              <div className="space-y-3 font-light">
                <div className="flex items-start gap-2 bg-white p-2.5 rounded-ods border border-ods-border shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-[#0099FF] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-black block">Key Chuẩn 100%</span>
                    <span className="text-[10px] text-gray-500">Mã kích hoạt lấy trực tiếp từ nhà phát hành game chính thống.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white p-2.5 rounded-ods border border-ods-border shadow-sm">
                  <Headphones className="h-4 w-4 text-[#0099FF] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-black block">Hỗ Trợ Tức Thời</span>
                    <span className="text-[10px] text-gray-500">Kênh bot và nhân viên trực hỗ trợ giải đáp sự cố sau vài phút.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 5: CỔNG THANH TOÁN BẢO MẬT (Positioned vertically next to Column 4) */}
            <div className="space-y-4">
              <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-black border-b border-ods-border pb-2">
                Cổng thanh toán bảo mật
              </h3>
              
              {/* SVG payment badges in a beautiful, structured 2-column grid to fit neatly */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'VietQR', url: 'https://kamikey.com/wp-content/uploads/2026/02/VietQR.svg' },
                  { name: 'ZaloPay', url: 'https://kamikey.com/wp-content/uploads/2026/02/ZaloPay.svg' },
                  { name: 'MoMo', url: 'https://kamikey.com/wp-content/uploads/2026/02/MoMo.svg' },
                  { name: 'PayPal', url: 'https://kamikey.com/wp-content/uploads/2026/02/PayPal.svg' },
                  { name: 'Mastercard', url: 'https://kamikey.com/wp-content/uploads/2026/02/Mastercard.svg' },
                  { name: 'ShopeePay', url: '/images/shopeepay.png' },
                ].map((gateway) => {
                  const isShopeePay = gateway.name === 'ShopeePay';
                  return (
                    <div
                      key={gateway.name}
                      className="h-11 w-20 bg-white border border-ods-border rounded-ods flex items-center justify-center shadow-sm hover:border-ods-primary hover:shadow-skyGlow transition-all duration-300 active:scale-95 cursor-pointer overflow-hidden"
                      title={gateway.name}
                    >
                      {isShopeePay ? (
                        <div className="bg-white border border-gray-200/80 rounded px-1 py-0.5 h-6.5 w-11 flex items-center justify-center overflow-hidden">
                          <img
                            src={gateway.url}
                            alt={gateway.name}
                            className="h-full w-auto object-contain max-h-full"
                          />
                        </div>
                      ) : (
                        <img
                          src={gateway.url}
                          alt={gateway.name}
                          className="h-7 w-auto object-contain max-h-full max-w-[85%]"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FOOTER BOTTOM */}
          <div className="border-t border-ods-border mt-12 pt-6 text-center flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-[10px] text-gray-400">
              © {new Date().getFullYear()} ODS Inc. Developed for Gaming Enthusiasts. All rights reserved.
            </span>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <span>Made with</span>
              <Heart className="h-3.5 w-3.5 text-red-500 fill-current" />
              <span>for Premium Gamers.</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
