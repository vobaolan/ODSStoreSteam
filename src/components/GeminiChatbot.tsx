'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Sparkles,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RotateCcw,
  Zap,
  CloudSun,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { CyberBotAvatar } from './CyberBotAvatar';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  productCards?: any[];
}

export const GeminiChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: 'Xin chào! Mình là ODS CyberBot AI 🤖⚡ — Trợ lý AI thế hệ mới được thiết kế riêng cho ODS Store. Bạn có thể hỏi mình bất kỳ điều gì: từ thời tiết hôm nay, tư vấn game hay tra cứu kho hàng và Flash Sale nhé!',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Fetch live catalog data from API and local store cache
  const loadProductData = async () => {
    let localProds: any[] = [];
    try {
      const stored = localStorage.getItem('ods_admin_products');
      if (stored) localProds = JSON.parse(stored);
    } catch (e) {}

    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (res.ok && data.products && Array.isArray(data.products)) {
        const combined = [...localProds];
        data.products.forEach((ap: any) => {
          if (!combined.some((p) => p.id === ap.id || p.slug === ap.slug)) {
            combined.push(ap);
          }
        });
        setProducts(combined);
        return;
      }
    } catch (e) {}

    setProducts(localProds);
  };

  useEffect(() => {
    loadProductData();
  }, [isOpen]);

  useEffect(() => {
    // Check session storage on mount to see if user has closed the tooltip in this session
    try {
      const isTooltipClosed = sessionStorage.getItem('ods_chatbot_tooltip_closed');
      if (!isTooltipClosed) {
        // Show tooltip after a tiny delay for smooth entry animation
        setTimeout(() => setShowTooltip(true), 1500);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const formatPrice = (val: number) => {
    return val.toLocaleString('vi-VN') + ' đ';
  };

  // Fallback response generator if API route fails
  const generateFallbackResponse = (query: string) => {
    const q = query.toLowerCase().trim();
    let replyText = `🤖 ODS CyberBot AI: Cảm ơn bạn đã nhắn tin! CyberBot luôn sẵn sàng hỗ trợ bạn tra cứu thông tin sản phẩm game, giá bán, khuyến mãi Flash Sale và bảo hành 100% tại ODS Store ⚡!`;
    let matchedProducts: any[] = [];

    if (
      q.includes('thời tiết') ||
      q.includes('mưa') ||
      q.includes('nắng') ||
      q.includes('nhiệt độ') ||
      q.includes('mấy giờ')
    ) {
      replyText = `🤖 ODS CyberBot AI: CyberBot là trợ lý AI chuyên trách riêng của ODS Store, tập trung 100% hỗ trợ kho game bản quyền và dịch vụ mua bán tại ODS Store 🎮⚡.\n\nCyberBot không hỗ trợ các thông tin ngoài lề như thời tiết hay xem giờ. Bạn cần CyberBot tra cứu giá hoặc kiểm tra sản phẩm nào tại ODS Store không ạ? 😊`;
      matchedProducts = products.slice(0, 2);
    } else {
      const directMatches = products.filter((p) =>
        q.split(' ').some((kw) => kw.length >= 2 && p.name.toLowerCase().includes(kw))
      );

      if (directMatches.length > 0) {
        matchedProducts = directMatches;
        const p = directMatches[0];
        replyText = `🤖 ODS CyberBot AI:\n• Tên sản phẩm: ${p.name}\n• Tình trạng: ${
          p.status !== false ? '📦 ĐANG CÒN HÀNG' : '🚫 HẾT HÀNG'
        }\n• Giá bán: ${
          p.discountPrice ? `${formatPrice(p.discountPrice)} (Gốc ${formatPrice(p.price)})` : formatPrice(p.price)
        }\n• Dịch vụ: Giao key tự động 24/7 tức thì & Bảo hành 100%!`;
      } else {
        matchedProducts = products.slice(0, 2);
      }
    }

    return { text: replyText, productCards: matchedProducts };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-5).map((m) => ({ role: m.sender, text: m.text })),
          localProducts: products,
        }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          productCards: data.productCards || [],
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }
    } catch (err) {
      console.warn('Chat API error, using fallback:', err);
    }

    // Fallback if API route is offline
    const responseData = generateFallbackResponse(query);
    const botMsg: Message = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: responseData.text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      productCards: responseData.productCards,
    };
    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <>
      {/* Floating Widget Row: Speech Bubble Tooltip + Clean Light Mascot Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* White Speech Bubble Tooltip (ROG Style) */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="relative hidden sm:flex items-center gap-2.5 bg-white text-zinc-900 px-4 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-zinc-200/90 text-xs font-semibold max-w-[270px] leading-snug"
            >
              <Zap className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0 animate-bounce" />
              <span>Bạn đang tìm game hay key bản quyền phù hợp? CyberBot sẽ giúp bạn tìm trong vài giây!</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                  try {
                    sessionStorage.setItem('ods_chatbot_tooltip_closed', 'true');
                  } catch (err) {}
                }}
                className="h-5 w-5 rounded-full bg-zinc-900 text-white hover:bg-zinc-700 transition-colors flex items-center justify-center shrink-0 ml-1"
                title="Đóng"
              >
                <X className="h-3 w-3" />
              </button>
              {/* Pointer triangle */}
              <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-6 border-y-transparent border-l-6 border-l-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ROG Mascot Circular Button - Crisp Light Background */}
        <motion.button
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
            try {
              sessionStorage.setItem('ods_chatbot_tooltip_closed', 'true');
            } catch (err) {}
          }}
          className="relative group flex items-center justify-center h-16 w-16 sm:h-18 sm:w-18 rounded-full bg-zinc-200 p-0.5 shadow-[0_8px_25px_rgba(0,0,0,0.18)] border border-zinc-300 transition-all duration-300 overflow-hidden shrink-0"
          title="Trợ lý AI CyberBot"
        >
          {/* Circular CyberBot Mascot Frame */}
          <div className="relative h-full w-full rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden">
            <CyberBotAvatar size="lg" isThinking={isOpen} />
          </div>
        </motion.button>
      </div>

      {/* Chat Modal / Window - SLEEK CLEAN LIGHT THEME (Giao diện trắng tinh tế) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-28 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[400px] h-[570px] max-h-[82vh] rounded-3xl bg-white/95 text-zinc-900 border border-zinc-200/90 shadow-[0_20px_60px_rgba(0,0,0,0.15)] backdrop-blur-2xl flex flex-col overflow-hidden"
          >
            {/* Header - Light Crystal Gradient */}
            <div className="p-4 bg-gradient-to-r from-zinc-50 via-cyan-50/70 to-zinc-50 border-b border-zinc-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CyberBotAvatar size="md" isThinking={isTyping} />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-zinc-900">
                    <span>ODS CyberBot AI</span>
                    <Sparkles className="h-3.5 w-3.5 text-cyan-600 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-emerald-700">ONLINE • CYBER AI 2.0</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setMessages([
                      {
                        id: 'msg-reset',
                        sender: 'bot',
                        text: 'Đã reset hệ thống CyberBot! Bạn cần trợ giúp thông tin gì tiếp theo?',
                        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                      },
                    ])
                  }
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors"
                  title="Làm mới"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors"
                  title="Đóng"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scrollbar-thin scrollbar-thumb-zinc-300">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end gap-2 max-w-[88%]">
                    {msg.sender === 'bot' && (
                      <CyberBotAvatar size="sm" />
                    )}
                    <div
                      className={`p-3.5 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-br-none shadow-sm font-medium'
                          : 'bg-zinc-100/90 text-zinc-800 border border-zinc-200/80 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

                      {/* Render Product Mini Cards in Light Theme */}
                      {msg.productCards && msg.productCards.length > 0 && (
                        <div className="mt-3 space-y-2 pt-2 border-t border-zinc-200/60">
                          {msg.productCards.map((p) => {
                            const isInStock = p.status !== false;
                            return (
                              <Link
                                key={p.id}
                                href={`/products/${p.slug}`}
                                onClick={() => setIsOpen(false)}
                                className="group flex items-center gap-3 p-2 rounded-xl bg-white border border-zinc-200 hover:border-sky-500 shadow-sm hover:shadow transition-all"
                              >
                                <img
                                  src={p.coverImage || p.image || p.thumbnailUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80'}
                                  alt={p.name}
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=80';
                                  }}
                                  className="h-12 w-12 rounded-lg object-cover shrink-0 border border-zinc-100 bg-zinc-100"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-zinc-900 text-[11px] truncate group-hover:text-sky-600">
                                    {p.name}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                                    <span className="font-bold text-sky-600">
                                      {formatPrice(p.discountPrice || p.price)}
                                    </span>
                                    {isInStock ? (
                                      <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                                        <CheckCircle2 className="h-3 w-3" /> Còn hàng
                                      </span>
                                    ) : (
                                      <span className="text-red-500 font-semibold flex items-center gap-0.5">
                                        <XCircle className="h-3 w-3" /> Hết hàng
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <ExternalLink className="h-3.5 w-3.5 text-zinc-400 group-hover:text-sky-600 shrink-0" />
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] text-zinc-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-sky-600 text-[11px]">
                  <CyberBotAvatar size="sm" isThinking={true} />
                  <span className="animate-pulse font-medium">CyberBot AI đang suy nghĩ câu trả lời...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-3 py-2 bg-zinc-50 border-t border-zinc-200/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => handleSendMessage('ODS Store chuyên về gì?')}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white hover:bg-sky-50 text-zinc-700 hover:text-sky-700 text-[10px] font-semibold border border-zinc-200 hover:border-sky-300 transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
              >
                <Sparkles className="h-3 w-3 text-sky-500" />
                <span>ODS Store chuyên về gì?</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Game đang Flash Deals hôm nay?')}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white hover:bg-rose-50 text-zinc-700 hover:text-rose-700 text-[10px] font-semibold border border-zinc-200 hover:border-rose-300 transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
              >
                <Zap className="h-3 w-3 text-rose-500" />
                <span>Game Flash Deals hôm nay</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Chính sách bảo hành như thế nào?')}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-zinc-700 hover:text-emerald-700 text-[10px] font-semibold border border-zinc-200 hover:border-emerald-300 transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
              >
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                <span>Chính sách bảo hành</span>
              </button>
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-zinc-200/80 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Hỏi CyberBot về game, tồn kho, giá bán, bảo hành..."
                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
                className="p-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md transition-all"
                title="Gửi"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
