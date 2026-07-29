'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Monitor, Flame, Sparkles, Percent, Star, Key, User, Gift } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export interface ProductProps {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discountPrice?: number | null;
  coverImage: string;
  category: string[];
  platform: string;
  type: string;
  deliveryMethod?: string;
  status?: boolean;
  isFlashDeal?: boolean;
  flashSaleEnd?: string | null;
  isFeaturedDeal?: boolean;
  tags?: string[];
}

export const ProductCard: React.FC<{ product: ProductProps }> = ({ product }) => {
  const { addToCart } = useCart();
  const router = useRouter();
  const activePrice = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice !== null && product.discountPrice !== undefined && product.discountPrice < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - product.discountPrice!) / product.price) * 100) : 0;

  const getDeliveryMethodText = (method: string) => {
    switch (method) {
      case 'GIFT':
        return 'TẶNG QUÀ TỰ ĐỘNG 🎁';
      case 'SHARED_ACC':
        return 'TÀI KHOẢN DÙNG CHUNG 👥';
      case 'NEW_ACC':
        return 'CẤP TÀI KHOẢN MỚI 🆕';
      case 'UPGRADE_ACC':
        return 'NÂNG CẤP TÀI KHOẢN 🚀';
      case 'AUTO_KEY':
      default:
        if (product.type === 'STEAM_GIFT') return 'TẶNG QUÀ (GIFT) 🎁';
        if (product.type === 'ACCOUNT') return 'GỬI TÀI KHOẢN MỚI 🔑';
        return 'GIAO KEY TỰ ĐỘNG ⚡';
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN') + ' đ';
  };

  const reviews = React.useMemo(() => {
    if ((product as any).reviews && Array.isArray((product as any).reviews) && (product as any).reviews.length > 0) {
      return (product as any).reviews;
    }
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`ods_reviews_${product.id}`);
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return [];
  }, [product]);

  const reviewCount = reviews.length;
  const avgScore = React.useMemo(() => {
    if (reviewCount === 0) return 0;
    const total = reviews.reduce((sum: number, r: any) => sum + (r.rating || 5), 0);
    return Math.round((total / reviewCount) * 10) / 10;
  }, [reviews, reviewCount]);

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let isLoggedIn = false;
    try {
      isLoggedIn = !!localStorage.getItem('ods_user');
    } catch (err) {}

    if (!isLoggedIn) {
      router.push('/profile');
      return;
    }

    addToCart({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      discountPrice: product.discountPrice,
      coverImage: product.coverImage,
      platform: product.platform,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-ods border border-ods-border bg-white text-black transition-all duration-300 hover:-translate-y-1.5 hover:border-ods-primary/60 hover:shadow-skyGlow cursor-pointer"
    >
      <Link href={`/products/${product.slug}`} className="flex flex-col justify-between h-full w-full">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-950 border-b border-ods-border flex items-center justify-center">
          <img
            src={product.coverImage}
            alt="Backdrop"
            className="absolute inset-0 h-full w-full object-cover blur-lg opacity-40 scale-110 pointer-events-none"
          />

          <img
            src={product.coverImage}
            alt={product.name}
            className="relative z-10 h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />

          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 max-w-[85%] z-20 pointer-events-none">
            {product.tags && product.tags.map((tag) => {
              const isHot = tag === 'Hot' || tag === 'Bán chạy';
              const isSale = tag === 'Đang giảm giá' || tag === 'Giảm giá sâu';
              const isNew = tag === 'Mới ra mắt';

              return (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9.5px] uppercase tracking-wider font-extrabold shadow-md backdrop-blur-md transition-all ${
                    isHot
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border border-red-400/30'
                      : isSale
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black border border-amber-300/40'
                      : isNew
                      ? 'bg-slate-900/90 text-sky-400 border border-sky-500/30'
                      : 'bg-black/80 text-white border border-white/20'
                  }`}
                >
                  {isHot && <Flame className="h-2.5 w-2.5 text-yellow-300 fill-yellow-300" />}
                  {isNew && <Sparkles className="h-2.5 w-2.5 text-sky-300" />}
                  {isSale && <Percent className="h-2.5 w-2.5 text-black" />}
                  <span>{tag}</span>
                </span>
              );
            })}
          </div>

          {hasDiscount && (
            <div className="absolute top-2.5 right-2.5 bg-ods-accent px-2 py-0.5 text-xs font-extrabold text-black tracking-tight rounded-full shadow-md z-20 border border-amber-300/40">
              -{discountPercent}%
            </div>
          )}

          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-sky-300 border border-sky-400/30 shadow-lg z-20 group-hover:border-sky-400/60 transition-all">
            <Monitor className="h-3 w-3 text-sky-400" />
            <span>{product.platform}</span>
          </div>

          <div className="absolute bottom-2.5 right-2.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-zinc-200 border border-white/20 shadow-lg z-20 group-hover:border-white/40 transition-all flex items-center gap-1.5">
            {product.deliveryMethod === 'SHARED_ACC' || product.deliveryMethod === 'NEW_ACC' ? (
              <User className="h-3 w-3 text-sky-400" />
            ) : product.deliveryMethod === 'GIFT' || product.type === 'STEAM_GIFT' ? (
              <Gift className="h-3 w-3 text-amber-400" />
            ) : (
              <Key className="h-3 w-3 text-emerald-400" />
            )}
            <span>
              {product.deliveryMethod === 'SHARED_ACC'
                ? 'ACC DÙNG CHUNG'
                : product.deliveryMethod === 'NEW_ACC'
                ? 'TÀI KHOẢN MỚI'
                : product.deliveryMethod === 'GIFT'
                ? 'TẶNG QUÀ (GIFT)'
                : product.type === 'STEAM_GIFT'
                ? 'STEAM GIFT'
                : 'KEY CODE'}
            </span>
          </div>
        </div>

        <div className="flex flex-col flex-1 p-4 pb-3.5 space-y-2 bg-gradient-to-b from-white to-gray-50/50">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-ods-primary uppercase tracking-wider">
            <div className="h-1.5 w-1.5 rounded-full bg-ods-primary animate-pulse" />
            {getDeliveryMethodText(product.deliveryMethod || 'AUTO_KEY')}
          </div>

          <h3 className="text-base font-extrabold leading-tight text-black line-clamp-2 min-h-[40px]">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mt-auto pb-1">
            <div className="flex text-amber-400 gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${star <= Math.round(avgScore) ? 'fill-amber-400' : 'fill-gray-200 text-gray-200'}`}
                />
              ))}
            </div>
            <span className="text-[11px] font-semibold text-gray-500">
              {avgScore > 0 ? avgScore.toFixed(1) : '0.0'} <span className="font-medium">({reviewCount === 0 ? 'Chưa có đánh giá' : `${reviewCount} Đánh giá`})</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-[11px]">
            <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">THỂ LOẠI:</span>
            <div className="flex flex-wrap items-center gap-1">
              {product.category && product.category.length > 0 ? (
                <>
                  {product.category.slice(0, 2).map((cat, idx) => (
                    <span key={idx} className="bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200 text-zinc-600 font-bold text-[10px]">
                      {cat}
                    </span>
                  ))}
                  {product.category.length > 2 && (
                    <span className="text-zinc-400 font-extrabold text-[10px] ml-0.5">
                      +{product.category.length - 2}
                    </span>
                  )}
                </>
              ) : (
                <span className="bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200 text-zinc-600 font-bold text-[10px]">
                  Action
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-[10px] text-ods-textMuted line-through font-semibold">
                  {formatCurrency(product.price)}
                </span>
              )}
              <span className="text-base font-extrabold text-black">
                {formatCurrency(activePrice)}
              </span>
            </div>

            {product.status !== false ? (
              <button
                onClick={handleBuyNow}
                className="flex items-center gap-1.5 rounded-ods bg-black hover:bg-zinc-800 text-white px-4 py-2 text-xs font-bold transition-all active:scale-95 hover:shadow-buttonGlow z-30 relative"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>MUA NGAY</span>
              </button>
            ) : (
              <button
                disabled
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="flex items-center gap-1.5 rounded-ods bg-gray-200 text-gray-400 px-4 py-2 text-xs font-bold cursor-not-allowed z-30 relative"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>HẾT HÀNG</span>
              </button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
