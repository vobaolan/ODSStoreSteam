'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { showToast } from './Toast';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead?: boolean;
}

interface AdminChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  orderId?: string;
  onSupportSuccess?: () => void; // Called when admin clicks Hỗ trợ thành công
}

export const AdminChatModal: React.FC<AdminChatModalProps> = ({
  isOpen,
  onClose,
  customerId,
  customerName,
  orderId,
  onSupportSuccess,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages for this specific customer
  const loadMessages = async () => {
    try {
      if (!orderId) return;
      const res = await fetch(`/api/support?orderId=${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        
        // Mark as read
        const hasUnread = data.some((m: ChatMessage) => m.receiverId === 'ADMIN' && !m.isRead);
        if (hasUnread) {
          await fetch(`/api/support?orderId=${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiverId: 'ADMIN' })
          });
        }
      }
    } catch (e) {
      console.error('Lỗi tải tin nhắn', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMessages();
      // Setup simple polling for demo real-time chat
      const interval = setInterval(loadMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen, customerId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !orderId) return;

    try {
      await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          senderId: 'ADMIN',
          receiverId: customerId,
          content: inputValue.trim(),
        })
      });
      setInputValue('');
      loadMessages();
    } catch (e) {
      console.error('Lỗi gửi tin nhắn', e);
    }
  };

  const handleSupportSuccess = () => {
    if (onSupportSuccess) {
      onSupportSuccess();
    }
    showToast('Đã đánh dấu hỗ trợ thành công!', 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col h-[550px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-ods-primary text-white">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">Hỗ Trợ: {customerName}</h3>
                <p className="text-[11px] text-white/70">
                  {orderId ? `Đang hỗ trợ đơn hàng #${orderId.slice(0, 8)}` : 'Chat trực tiếp'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Action Bar (Hỗ trợ thành công) */}
          {orderId && (
            <div className="bg-sky-50 px-4 py-2.5 flex justify-between items-center border-b border-sky-100">
              <span className="text-[10px] font-bold text-sky-800 uppercase">Trạng Thái: Đang xử lý</span>
              <button
                onClick={handleSupportSuccess}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Hỗ Trợ Thành Công</span>
              </button>
            </div>
          )}

          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                <User className="h-10 w-10 opacity-20" />
                <p className="text-xs">Chưa có tin nhắn nào. Hãy bắt đầu chat!</p>
              </div>
            ) : (
              messages.map(msg => {
                const isAdmin = msg.senderId === 'ADMIN';
                return (
                  <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                    <div className="text-[10px] text-gray-400 mb-1">
                      {isAdmin ? 'Admin' : customerName} • {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                        isAdmin 
                          ? 'bg-ods-primary text-white rounded-tr-sm' 
                          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Nhập tin nhắn hỗ trợ..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-ods-primary focus:ring-1 focus:ring-ods-primary"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="h-10 w-10 bg-ods-primary text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-ods-primaryHover transition-colors"
            >
              <Send className="h-4 w-4 ml-1" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
