'use client';

import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  confirmAction: (options: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let globalShowToast: (message: string, type?: ToastType) => void = () => {};

export const showToast = (message: string, type: ToastType = 'info') => {
  if (globalShowToast) {
    globalShowToast(message, type);
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  } | null>(null);

  const triggerToast = (message: string, type: ToastType = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  globalShowToast = triggerToast;

  const confirmAction = ({
    title = 'Xác Nhận Thao Tác',
    message,
    confirmText = 'Xác Nhận',
    cancelText = 'Hủy Bỏ',
    onConfirm,
  }: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  }) => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm,
    });
  };

  return (
    <ToastContext.Provider value={{ showToast: triggerToast, confirmAction }}>
      {children}

      {/* TOAST NOTIFICATION STACK */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className={`flex items-center space-x-3 rounded-ods p-3.5 shadow-2xl border text-xs font-semibold pointer-events-auto ${
                t.type === 'success'
                  ? 'bg-zinc-900 text-white border-emerald-500/40 shadow-emerald-950/20'
                  : t.type === 'error'
                  ? 'bg-zinc-900 text-white border-red-500/40 shadow-red-950/20'
                  : 'bg-zinc-900 text-white border-sky-500/40 shadow-sky-950/20'
              }`}
            >
              {t.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
              {t.type === 'error' && <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />}
              {t.type === 'info' && <Info className="h-4 w-4 text-sky-400 shrink-0" />}
              <span className="flex-1 leading-snug">{t.message}</span>
              <button
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* IN-WEBSITE CONFIRMATION MODAL */}
      <AnimatePresence>
        {confirmConfig?.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-sm rounded-ods border border-ods-border bg-white p-6 shadow-2xl space-y-4"
            >
              <div className="space-y-1">
                <span className="text-[10px] text-ods-primary font-bold uppercase tracking-widest block">ODS STORE THÔNG BÁO</span>
                <h3 className="font-heading text-sm font-extrabold uppercase text-black">{confirmConfig.title}</h3>
              </div>

              <p className="text-xs text-ods-textMuted font-light leading-relaxed">
                {confirmConfig.message}
              </p>

              <div className="pt-2 flex justify-end gap-2 text-xs font-bold">
                <button
                  onClick={() => setConfirmConfig(null)}
                  className="rounded-ods border border-ods-border bg-white px-4 py-2 text-gray-600 hover:bg-gray-100 uppercase tracking-wider transition-all"
                >
                  {confirmConfig.cancelText}
                </button>
                <button
                  onClick={() => {
                    const action = confirmConfig.onConfirm;
                    setConfirmConfig(null);
                    action();
                  }}
                  className="rounded-ods bg-ods-primary hover:bg-ods-primaryHover text-white px-5 py-2 uppercase tracking-wider transition-all hover:shadow-buttonGlow active:scale-95"
                >
                  {confirmConfig.confirmText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
