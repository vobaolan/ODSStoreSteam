"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { CyberBotAvatar } from '../CyberBotAvatar';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  source?: string;
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Xin chào! Mình là ODS CyberBot AI 🤖⚡ — Trợ lý AI thế hệ mới được thiết kế riêng cho ODS Store. Bạn có thể hỏi mình bất kỳ điều gì nhé!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem('ods_cyberbot_tooltip_closed')) {
        setTimeout(() => setShowTooltip(true), 2000);
      }
    } catch (e) {}
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Prepare history (excluding the very first welcome message if preferred, or keeping it)
      const history = messages.map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history })
      });

      if (!res.ok) throw new Error('API Error');

      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer,
        source: data.source 
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error while processing your request.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <motion.div 
        drag 
        dragMomentum={false} 
        className="fixed bottom-6 right-6 z-[9999] flex items-end gap-3"
      >
        {/* Tooltip Notification */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="relative hidden sm:flex items-center gap-3 bg-white px-3 py-2.5 mb-2 rounded-xl shadow-[0_10px_30px_rgba(14,165,233,0.15)] border border-sky-100 text-[11px] font-medium text-gray-700 max-w-[250px] leading-relaxed"
            >
              <span>Chào bạn, bạn cần tư vấn game hay kiểm tra kho hàng không? CyberBot sẽ hỗ trợ ngay!</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                  try { sessionStorage.setItem('ods_cyberbot_tooltip_closed', 'true'); } catch (err) {}
                }}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
              >
                <X size={12} />
              </button>
              {/* Pointer triangle */}
              <div className="absolute -right-[6px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-l-[6px] border-l-white drop-shadow-sm" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 w-[340px] max-h-[520px] h-[calc(100vh-140px)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-3 flex justify-between items-center text-white border-b border-sky-400/30">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-sky-300 rounded-full blur-sm opacity-50 animate-pulse"></div>
                    <CyberBotAvatar size="sm" isThinking={isLoading} state="active" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[14px] bg-clip-text text-transparent bg-gradient-to-r from-white to-sky-100">ODS CyberBot AI</h3>
                    <div className="text-[9px] text-sky-100 uppercase tracking-widest font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                      Online
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 p-1.5 rounded-lg transition-colors text-sky-100 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13.5px] ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-br-none shadow-[0_0_15px_rgba(14,165,233,0.3)]' 
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-700 shadow-sm'
                      }`}
                    >
                      <div className="prose dark:prose-invert prose-sm max-w-none leading-relaxed text-[13.5px]">
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 text-sky-600 text-[11px] mb-2 ml-1">
                      <CyberBotAvatar size="sm" isThinking={true} state="thinking" />
                      <span className="animate-pulse font-medium">CyberBot đang soạn câu trả lời...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-end gap-2 bg-white dark:bg-gray-950 rounded-xl p-1 border border-gray-200 dark:border-gray-700 focus-within:border-sky-400 focus-within:shadow-[0_0_10px_rgba(14,165,233,0.2)] transition-all">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Hỏi CyberBot về thông tin game..."
                    className="flex-1 max-h-32 min-h-[36px] bg-transparent resize-none p-2 focus:outline-none text-[13px] text-gray-900 dark:text-gray-100"
                    rows={1}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="p-1.5 mb-0.5 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white disabled:opacity-50 disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(14,165,233,0.4)]"
                  >
                    <Send size={16} />
                  </button>
                </div>
                <div className="text-center mt-1.5 text-[9px] text-gray-400 font-medium tracking-wide">
                  POWERED BY CYBER AI 2.0
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          animate={isOpen ? {} : { y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
            try { sessionStorage.setItem('ods_cyberbot_tooltip_closed', 'true'); } catch (err) {}
          }}
          className="relative group flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full p-0.5 shadow-[0_0_30px_rgba(14,165,233,0.4)] transition-all duration-300 shrink-0"
        >
          {/* Glowing Aura (Skyblue Style) */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-500 opacity-70 blur-md group-hover:opacity-100 animate-pulse transition-opacity"></div>
          
          {/* Inner Content */}
          <div className="relative h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-sky-200 group-hover:border-sky-300 transition-colors z-10">
            <CyberBotAvatar size="lg" isThinking={isLoading && isOpen} state={isOpen ? 'active' : 'idle'} />
          </div>
        </motion.button>
      </motion.div>
    </>
  );
}
