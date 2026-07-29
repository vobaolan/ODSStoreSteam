'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Flame, Monitor, Gift, Key, ShieldCheck, Clock, ChevronLeft, ChevronRight, Star, Gamepad2, Zap, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSteamDBStats, fetchLiveSteamDBStats, SteamDBStats } from '@/lib/steamdb';

export interface ProductDeal {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string | string[];
  price: number;
  discountPrice?: number | null;
  coverImage: string;
  platform?: string;
  type?: string;
  deliveryMethod?: string;
  flashSaleEnd?: string | null;
  steamAppId?: string | number;
  steamRating?: string;
  playerCount?: number | string;
}

export interface FeaturedDealCardProps {
  product?: ProductDeal;
  products?: ProductDeal[];
  currentIndex?: number;
  onSelectIndex?: (index: number) => void;
  onAddToCart?: (product: any) => void;
}

export const FeaturedDealCard: React.FC<FeaturedDealCardProps> = ({
  product: singleProduct,
  products = [],
  currentIndex: externalIndex = 0,
  onSelectIndex,
  onAddToCart,
}) => {
  // Internal index state if no external controls are provided
  const [internalIndex, setInternalIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const dealList = products.length > 0 ? products : singleProduct ? [singleProduct] : [];
  const activeIndex = products.length > 0 ? externalIndex : internalIndex;
  const activeProduct = dealList[activeIndex] || dealList[0];

  // Auto-Slide timer (5 seconds per slide), pauses on hover
  useEffect(() => {
    if (dealList.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      const nextIdx = (activeIndex + 1) % dealList.length;
      if (onSelectIndex) {
        onSelectIndex(nextIdx);
      } else {
        setInternalIndex(nextIdx);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [dealList.length, activeIndex, isPaused, onSelectIndex]);

  const handlePrev = () => {
    if (dealList.length <= 1) return;
    const prevIdx = (activeIndex - 1 + dealList.length) % dealList.length;
    if (onSelectIndex) onSelectIndex(prevIdx);
    else setInternalIndex(prevIdx);
  };

  const handleNext = () => {
    if (dealList.length <= 1) return;
    const nextIdx = (activeIndex + 1) % dealList.length;
    if (onSelectIndex) onSelectIndex(nextIdx);
    else setInternalIndex(nextIdx);
  };

  // Real-time Countdown Timer State
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 3,
    hours: 14,
    minutes: 25,
    seconds: 40,
  });
  const [timeProgress, setTimeProgress] = useState(72);

  useEffect(() => {
    if (!activeProduct) return;

    const targetDate = activeProduct.flashSaleEnd
      ? new Date(activeProduct.flashSaleEnd).getTime()
      : Date.now() + 3 * 24 * 60 * 60 * 1000 + 14 * 3600 * 1000;

    const totalDuration = 7 * 24 * 60 * 60 * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setTimeProgress(0);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
      const pct = Math.min(100, Math.max(5, (diff / totalDuration) * 100));
      setTimeProgress(Math.round(pct));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeProduct]);

  const [liveSteamStats, setLiveSteamStats] = useState<SteamDBStats | null>(null);

  useEffect(() => {
    if (activeProduct) {
      const instantStats = getSteamDBStats(
        activeProduct.name,
        activeProduct.steamAppId,
        activeProduct.steamRating,
        activeProduct.playerCount
      );
      setLiveSteamStats(instantStats);

      fetchLiveSteamDBStats(activeProduct.name, activeProduct.steamAppId).then((realStats) => {
        if (realStats) setLiveSteamStats(realStats);
      });
    }
  }, [activeProduct]);

  if (!activeProduct) return null;

  const price = activeProduct.price;
  const discountPrice = activeProduct.discountPrice ?? price;
  const hasDiscount = activeProduct.discountPrice !== undefined && activeProduct.discountPrice !== null && activeProduct.discountPrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - discountPrice) / price) * 100)
    : 30;

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + ' đ';

  const steamStats = liveSteamStats || getSteamDBStats(
    activeProduct.name,
    activeProduct.steamAppId,
    activeProduct.steamRating,
    activeProduct.playerCount
  );

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="group relative w-full overflow-hidden rounded-2xl border border-sky-500/30 bg-[#090b10] text-white shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_35px_rgba(0,178,255,0.15)] transition-all duration-500 hover:border-[#00d2ff]/70 hover:shadow-[0_0_55px_rgba(0,210,255,0.35)]"
    >
      {/* 1. ANIMATED HIGH-RES CINEMATIC GAME ARTWORK BACKGROUND */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeProduct.id + '-bg'}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1.03 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
        >
          <img
            src={activeProduct.coverImage}
            alt={activeProduct.name}
            className="h-full w-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-1000 ease-out brightness-105 contrast-105"
          />
        </motion.div>
      </AnimatePresence>

      {/* Layered Cyber Ambient Gradients for Crystal Clear Text & Deep Contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#090b10] via-[#090b10]/75 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-[#090b10]/50 to-[#090b10]/80 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-l from-sky-500/10 via-transparent to-transparent z-10 pointer-events-none" />

      {/* Dynamic Cyber Aurora Lights */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#00d2ff]/20 rounded-full blur-3xl z-10 pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-600/15 rounded-full blur-3xl z-10 pointer-events-none" />

      {/* 2. CARD CONTENT CONTAINER */}
      <div className="relative z-20 flex flex-col justify-between p-6 sm:p-8 min-h-[440px] md:min-h-[480px]">
        {/* TOP HEADER BAR: BADGE, SLIDE CONTROLS & DISCOUNT TAG */}
        <header className="flex items-center justify-between gap-4 mb-6">
          {/* Featured Title Tag */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00b2ff]/30 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 shadow-md">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00b2ff] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00b2ff]"></span>
            </span>
            <span className="text-[11px] font-black tracking-widest text-[#00d2ff] uppercase flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              DEAL NỔI BẬT TRONG TUẦN
            </span>
          </div>

          {/* RIGHT SIDE TOP CONTROLS: CAROUSEL SLIDE DOTS, ARROWS & DISCOUNT BADGE */}
          <div className="flex items-center gap-3">
            {/* Carousel Navigation Buttons & Dots Indicator (If multiple products exist) */}
            {dealList.length > 1 && (
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 shadow-md">
                {/* Prev Arrow */}
                <button
                  onClick={handlePrev}
                  aria-label="Sản phẩm trước"
                  className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                {/* Dots indicator */}
                <div className="flex items-center gap-1.5">
                  {dealList.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => (onSelectIndex ? onSelectIndex(idx) : setInternalIndex(idx))}
                      aria-label={`Chuyển sang deal ${idx + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === activeIndex
                          ? 'w-6 bg-[#00b2ff] shadow-[0_0_10px_#00b2ff]'
                          : 'w-2 bg-white/30 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>

                {/* Next Arrow */}
                <button
                  onClick={handleNext}
                  aria-label="Sản phẩm tiếp theo"
                  className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Glowing Red Discount Badge */}
            {hasDiscount && (
              <div className="relative group/badge">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-red-600 to-rose-500 blur-sm opacity-80 group-hover/badge:opacity-100 transition-opacity" />
                <div className="relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-rose-600 px-3.5 py-1 text-xs font-black text-white shadow-lg border border-red-400/40 uppercase tracking-wider">
                  -{discountPercent}% OFF
                </div>
              </div>
            )}
          </div>
        </header>

        {/* MIDDLE SECTION: ANIMATED PRODUCT TITLE, TAGS & DESCRIPTION */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeProduct.id + '-content'}
            initial={{ opacity: 0, x: 25, filter: 'blur(6px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -25, filter: 'blur(6px)' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="my-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
          >
            {/* Left Column: Title & Silver Tag Badges */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <Link href={`/products/${activeProduct.slug}`} className="inline-block group/title">
                  <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-md group-hover/title:text-[#00d2ff] transition-colors leading-[1.15]">
                    {activeProduct.name}
                  </h2>
                </Link>

                {/* PREMIUM STEAMDB STATS MATRIX (Redesigned for 2 items) */}
                <div className="pt-5 pb-3 flex flex-wrap sm:flex-nowrap gap-3 sm:gap-4 w-full max-w-2xl">
                  {/* Premium Card 1: Steam Reviews */}
                  <div className="group/stat relative flex items-center gap-3 p-2 pr-6 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-900/40 border border-white/5 hover:border-sky-500/40 backdrop-blur-xl shadow-[0_8px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(14,165,233,0.25)] transition-all duration-500 cursor-default overflow-hidden flex-1 sm:flex-none">
                    {/* Inner glowing highlight */}
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-500/0 via-sky-500/5 to-sky-500/0 translate-x-[-100%] group-hover/stat:translate-x-[100%] transition-transform duration-1000"></div>
                    
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400/20 via-blue-600/20 to-indigo-500/20 border border-sky-400/30 flex items-center justify-center shrink-0 shadow-inner group-hover/stat:border-sky-300/50 transition-colors">
                      <Star className="h-5 w-5 text-sky-400 fill-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="text-[16px] font-black text-white font-mono tracking-tight leading-none drop-shadow-md">
                        {steamStats.ratingPercent}
                      </div>
                      <span className="text-[10px] font-extrabold text-sky-300/80 uppercase mt-1 block tracking-wider">
                        {steamStats.reviewsCount}
                      </span>
                    </div>
                  </div>

                  {/* Premium Card 2: Live Players */}
                  <div className="group/stat relative flex items-center gap-3 p-2 pr-6 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-900/40 border border-white/5 hover:border-emerald-500/40 backdrop-blur-xl shadow-[0_8px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] transition-all duration-500 cursor-default overflow-hidden flex-1 sm:flex-none">
                    {/* Inner glowing highlight */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover/stat:translate-x-[100%] transition-transform duration-1000"></div>
                    
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 via-teal-600/20 to-cyan-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-inner group-hover/stat:border-emerald-300/50 transition-colors">
                      <Users className="h-5 w-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-sm" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="text-[16px] font-black text-white font-mono tracking-tight leading-none drop-shadow-md">
                        {steamStats.inGamePlayers}
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-300/80 uppercase mt-1 block tracking-wider">
                        In-Game Live
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Silver-bordered Tag Badges: STEAM, THÌNH THỨC GIAO HÀNG & BẢO HÀNH 100% */}
              <div className="flex flex-wrap items-center gap-2 pt-1 max-w-lg">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider bg-slate-900/90 text-[#FFFFFF] border border-[#C0C0C0]/30 shadow-xs backdrop-blur-md whitespace-nowrap">
                  <Monitor className="h-3 w-3 text-[#00d2ff]" />
                  <span>{activeProduct.platform || 'STEAM'}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider bg-slate-900/90 text-[#FFFFFF] border border-[#C0C0C0]/30 shadow-xs backdrop-blur-md whitespace-nowrap">
                  {activeProduct.deliveryMethod === 'SHARED_ACC' || activeProduct.type === 'ACCOUNT' ? (
                    <>
                      <Users className="h-3 w-3 text-amber-400" />
                      <span>TÀI KHOẢN DÙNG CHUNG</span>
                    </>
                  ) : activeProduct.deliveryMethod === 'OFFLINE_ACC' ? (
                    <>
                      <Gamepad2 className="h-3 w-3 text-purple-400" />
                      <span>TÀI KHOẢN OFFLINE</span>
                    </>
                  ) : activeProduct.deliveryMethod === 'NEW_ACC' ? (
                    <>
                      <Key className="h-3 w-3 text-sky-400" />
                      <span>GỬI TÀI KHOẢN MỚI</span>
                    </>
                  ) : activeProduct.deliveryMethod === 'GIFT_ACC' ? (
                    <>
                      <Gift className="h-3 w-3 text-amber-400" />
                      <span>GIFT TÀI KHOẢN</span>
                    </>
                  ) : (
                    <>
                      <Key className="h-3 w-3 text-[#00d2ff]" />
                      <span>GIAO KEY TỰ ĐỘNG</span>
                    </>
                  )}
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold text-[#C0C0C0] bg-white/5 border border-white/10 whitespace-nowrap">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  <span>BẢO HÀNH 100%</span>
                </span>
              </div>
            </div>

            {/* Right Column: Ultra Sleek 16:9 Full Bleed Cyber Poster Showcase */}
            <div className="md:col-span-4 hidden md:flex justify-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative aspect-[16/9] w-full max-w-[260px] rounded-2xl overflow-hidden border-2 border-sky-400/40 bg-zinc-950 shadow-[0_10px_30px_rgba(0,178,255,0.35)] group-hover:shadow-[0_0_40px_rgba(0,178,255,0.7)] group-hover:border-sky-300 transition-all duration-500 group-hover:scale-105"
              >
                {/* Full-bleed crisp sharp Cover Image */}
                <img
                  src={activeProduct.coverImage}
                  alt={activeProduct.name}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                
                {/* Cinematic Vignette Overlay & Glossy Reflection */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* BOTTOM SECTION: STEAM OFFER COUNTDOWN TIMER & CTA PRICING BLOCK */}
        <footer className="pt-5 border-t border-white/10 mt-auto space-y-4">
          {/* REAL-TIME OFFER COUNTDOWN TIMER & TIME PROGRESS BAR */}
          <div className="space-y-2 max-w-md">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
              {/* Left Label with Live Clock Icon */}
              <span className="text-[#00d2ff] flex items-center gap-1.5 tracking-wide">
                <Clock className="h-3.5 w-3.5 text-[#00d2ff] animate-pulse" />
                <span>Ưu đãi kết thúc sau:</span>
              </span>

              {/* Digital Countdown Timer Badges */}
              <div className="flex items-center gap-1 font-mono text-[11px] font-extrabold text-white">
                <span className="bg-slate-900 border border-white/15 px-1.5 py-0.5 rounded text-amber-400">
                  {String(timeLeft.days).padStart(2, '0')}d
                </span>
                <span>:</span>
                <span className="bg-slate-900 border border-white/15 px-1.5 py-0.5 rounded text-[#00d2ff]">
                  {String(timeLeft.hours).padStart(2, '0')}h
                </span>
                <span>:</span>
                <span className="bg-slate-900 border border-white/15 px-1.5 py-0.5 rounded text-[#00d2ff]">
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </span>
                <span>:</span>
                <span className="bg-slate-900 border border-white/15 px-1.5 py-0.5 rounded text-[#00d2ff]">
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>

            {/* Flat Time Progress Bar with Cyber Blue / Amber Gradient */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/90 border border-white/10 p-0.5 shadow-inner">
              <motion.div
                key={activeProduct.id + '-progress'}
                initial={{ width: 0 }}
                animate={{ width: `${timeProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-400 to-[#00b2ff] shadow-[0_0_12px_#00b2ff]"
              />
            </div>
          </div>

          {/* PRICING & CALL TO ACTION BUTTON */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            {/* Price Column */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProduct.id + '-price'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col"
              >
                {hasDiscount && (
                  <span className="text-xs sm:text-sm text-[#C0C0C0] line-through font-medium tracking-wide">
                    {formatCurrency(price)}
                  </span>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                    {formatCurrency(discountPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      Tiết kiệm {formatCurrency(price - discountPrice)}
                    </span>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* CTA Button: Nút MUA NGAY với hiệu ứng Gradient & Glow Cyber Blue */}
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  let isLoggedIn = false;
                  try {
                    isLoggedIn = !!localStorage.getItem('ods_user');
                  } catch (err) {}

                  if (!isLoggedIn) {
                    window.location.href = '/profile';
                    return;
                  }

                  if (onAddToCart) onAddToCart(activeProduct);
                }}
                className="relative group/btn inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#00b2ff] via-[#00c8ff] to-blue-600 px-6 py-3.5 text-sm sm:text-base font-extrabold text-white shadow-[0_0_20px_rgba(0,178,255,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(0,178,255,0.8)] active:scale-95 cursor-pointer border border-sky-300/40"
              >
                <ShoppingCart className="h-5 w-5 text-white transition-transform group-hover/btn:-translate-y-0.5" />
                <span>MUA NGAY</span>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
