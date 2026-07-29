'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Gamepad2, ShieldCheck, Zap } from 'lucide-react';

export const InitialLoader: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('ĐANG KHỞI ĐỘNG HỆ THỐNG ODS...');

  useEffect(() => {
    // Fast, responsive progress counter animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 300);
          return 100;
        }

        const next = prev + Math.floor(Math.random() * 12) + 5;
        const current = next > 100 ? 100 : next;

        if (current < 30) {
          setStatusText('⚡ ĐANG KHỞI ĐỘNG HỆ THỐNG ODS STORE...');
        } else if (current < 65) {
          setStatusText('🎮 KẾT NỐI MÁY CHỦ BẢO MẬT SUPABASE...');
        } else if (current < 95) {
          setStatusText('🔑 ĐỒNG BỘ KHO KEY & TÀI KHOẢN GAME...');
        } else {
          setStatusText('✨ SẴN SÀNG TRẢI NGHIỆM!');
        }

        return current;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.06, 
            filter: 'blur(12px)', 
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950 text-white select-none overflow-hidden"
        >
          {/* 1. Xbox & NZXT Ambient Glowing Mesh Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-sky-500/20 via-emerald-500/15 to-purple-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(9,9,11,0.95)_70%)]" />
          </div>

          {/* 2. Central Xbox / ODS Sphere & Animated Cyber Emblem */}
          <div className="relative z-10 flex flex-col items-center space-y-8">
            <div className="relative flex items-center justify-center">
              {/* Expanding Ripple Rings (Xbox Startup Orb Effect) */}
              <motion.div
                animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0.8, 0.3] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="absolute w-36 h-36 rounded-full border border-sky-400/40 shadow-[0_0_40px_rgba(56,189,248,0.4)]"
              />
              <motion.div
                animate={{ scale: [1.2, 1.6, 1.2], opacity: [0.15, 0.5, 0.15] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 0.3 }}
                className="absolute w-44 h-44 rounded-full border border-emerald-400/30 shadow-[0_0_60px_rgba(52,211,153,0.3)]"
              />

              {/* Central Metallic Glowing Orb Badge */}
              <div className="relative h-24 w-24 rounded-2xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-0.5 shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_35px_rgba(14,165,233,0.4)] border border-sky-400/50 flex items-center justify-center group">
                <div className="h-full w-full rounded-[14px] bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-2 space-y-1">
                  <img
                    src="/images/logo.png"
                    alt="ODS Logo"
                    className="h-7 w-auto object-contain drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]"
                  />
                  <div className="flex items-center gap-1 text-[8px] font-black text-sky-400 uppercase tracking-widest">
                    <Zap className="h-2.5 w-2.5 text-amber-400 fill-amber-400 animate-bounce" />
                    <span>X-LOADER</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Progress Ring & Number Display */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center font-heading text-4xl font-black tracking-tight bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent drop-shadow-lg">
                {progress}%
              </div>

              {/* Futuristic Progress Bar Container */}
              <div className="w-64 sm:w-80 h-2 bg-zinc-900 rounded-full p-0.5 border border-white/10 shadow-inner overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-sky-500 via-emerald-400 to-sky-400 rounded-full shadow-[0_0_15px_#38bdf8]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>

              {/* Dynamic Status Text */}
              <p className="text-[11px] font-bold text-sky-300/80 uppercase tracking-widest h-4 flex items-center justify-center gap-2">
                <Sparkles className="h-3 w-3 text-amber-400 animate-spin" />
                <span>{statusText}</span>
              </p>
            </div>
          </div>

          {/* 4. Bottom Powered Badge */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-500" />
            <span>ODS STORE XBOX POWERED STARTUP ENGINE</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
