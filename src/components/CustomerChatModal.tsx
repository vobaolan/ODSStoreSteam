'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  orderId?: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead?: boolean;
}

interface CustomerChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export const CustomerChatModal: React.FC<CustomerChatModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages for this specific customer
  const loadMessages = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/support`);
      if (res.ok) {
        let allMessages: ChatMessage[] = await res.json();
        
        const relevant = allMessages.filter(
          (m: any) => (m.senderId === currentUser.id && m.receiverId === 'ADMIN') ||
               (m.senderId === 'ADMIN' && m.receiverId === currentUser.id)
        );
        setMessages(relevant);

        const hasUnread = relevant.some((m: ChatMessage) => m.receiverId === currentUser.id && !m.isRead);
        if (hasUnread) {
          // Find orderId of unread msg (assume we can just use the latest one)
          const unreadMsg = relevant.find(m => m.receiverId === currentUser.id && !m.isRead);
          if (unreadMsg && unreadMsg.orderId) {
            await fetch(`/api/support?orderId=${unreadMsg.orderId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ receiverId: currentUser.id })
            });
          }
        }
      }
    } catch (e) {
      console.error('Lỗi tải tin nhắn', e);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      loadMessages();
      // Setup simple polling for demo real-time chat
      const interval = setInterval(loadMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !currentUser) return;

    try {
      // Create a dummy orderId if not bound to a specific order, or just use user id
      await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: `support-${currentUser.id}`, // Placeholder
          senderId: currentUser.id,
          receiverId: 'ADMIN',
          content: inputValue.trim(),
        })
      });
      setInputValue('');
      loadMessages();
    } catch (e) {
      console.error('Lỗi gửi tin nhắn', e);
    }
  };

  if (!isOpen || !currentUser) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col h-[500px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-zinc-900 text-white">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">Hỗ Trợ Trực Tuyến</h3>
                <p className="text-[11px] text-white/70">
                  Phản hồi thường trong vài phút
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-2">
                <User className="h-10 w-10 opacity-20" />
                <p className="text-xs">Chưa có tin nhắn nào. Hãy bắt đầu chat!</p>
              </div>
            ) : (
              messages.map(msg => {
                const isUser = msg.senderId === currentUser.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className="text-[10px] text-zinc-400 mb-1">
                      {isUser ? 'Bạn' : 'Admin'} • {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                        isUser 
                          ? 'bg-sky-500 text-white rounded-tr-sm' 
                          : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-sm shadow-sm'
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
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-zinc-200 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 border border-zinc-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="h-10 w-10 bg-sky-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-sky-600 transition-colors"
            >
              <Send className="h-4 w-4 ml-1" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
