'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { CartProvider, useCart } from '@/context/CartContext';
import { useToast } from '@/components/Toast';
import { 
  ShoppingCart, Heart, ShieldCheck, ChevronLeft, ChevronRight, 
  Star, Maximize2, X, ArrowLeft, CheckCircle2, Play,
  MessageSquare, User, Send, Cpu, HardDrive, Laptop, Award, Gamepad2, Monitor, Tag, Clock, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DETAILS_MOCK_PRODUCTS: any[] = [];

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  embedUrl?: string | null;
  thumbnailUrl: string;
}

// Helper to extract YouTube Embed & Thumbnail URLs
const getYouTubeInfo = (url: string) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    const videoId = match[1];
    return {
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }
  return null;
};

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { showToast } = useToast();
  const [realProduct, setRealProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wishlistAdded, setWishlistAdded] = useState(false);

  // User Account State
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Customer Reviews State
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newHoverRating, setNewHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Load Current Logged In User
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('ods_user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (e) {
      setCurrentUser(null);
    }
  }, []);

  // Fetch real product from database API
  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/products/${params.slug}?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          setRealProduct(data.product);
        }
      })
      .catch((err) => console.error('Lỗi khi lấy chi tiết sản phẩm:', err))
      .finally(() => setIsLoading(false));
  }, [params.slug]);

  // Determine active product (Merge Local Admin store over DB Product to keep Admin edits instant!)
  const product = useMemo(() => {
    const baseSlug = params.slug.split('-')[0].toLowerCase();
    let localMatch: any = null;

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ods_admin_products');
        if (stored) {
          const list = JSON.parse(stored);
          localMatch = list.find((p: any) => 
            p.slug === params.slug || 
            p.id === params.slug || 
            (p.slug && params.slug.startsWith(p.slug)) || 
            (p.slug && p.slug.startsWith(baseSlug)) ||
            (p.name && p.name.toLowerCase().includes(baseSlug))
          );
        }
      } catch (e) {}
    }

    let active: any = null;
    if (realProduct && localMatch) {
      active = { ...realProduct, ...localMatch };
    } else if (localMatch) {
      active = localMatch;
    } else if (realProduct) {
      active = realProduct;
    }

    return active;
  }, [realProduct, params.slug]);

  // Save recently viewed product to localStorage for Header menu
  useEffect(() => {
    if (product && product.id && product.name) {
      try {
        const stored = localStorage.getItem('ods_recently_viewed');
        let list = stored ? JSON.parse(stored) : [];
        list = list.filter((p: any) => p.id !== product.id && p.slug !== product.slug);
        list.unshift({
          id: product.id,
          name: product.name,
          slug: product.slug,
          coverImage: product.coverImage,
          price: product.price,
          discountPrice: product.discountPrice,
          platform: product.platform,
        });
        localStorage.setItem('ods_recently_viewed', JSON.stringify(list.slice(0, 10)));
      } catch (e) {
        console.error('Lỗi lưu sản phẩm vừa xem:', e);
      }
    }
  }, [product]);

  // Load reviews for product
  useEffect(() => {
    if (product && product.id) {
      const defaultRevs = Array.isArray(product.reviews) ? product.reviews : [];

      try {
        const stored = localStorage.getItem(`ods_reviews_${product.id}`);
        if (stored) {
          setUserReviews(JSON.parse(stored));
        } else {
          setUserReviews(defaultRevs);
        }
      } catch (e) {
        setUserReviews(defaultRevs);
      }
    }
  }, [product]);

  // Handle Review Submission (Uses Account Name directly!)
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      showToast('Vui lòng nhập nội dung đánh giá của bạn!', 'error');
      return;
    }
    setIsSubmittingReview(true);

    const authorName = currentUser?.name || 'Khách hàng ODS';

    const revObj = {
      id: `rev-${Date.now()}`,
      author: authorName,
      rating: newRating,
      comment: newComment.trim(),
      date: new Date().toISOString().slice(0, 10),
    };

    const updated = [revObj, ...userReviews];
    setUserReviews(updated);

    try {
      const stored = localStorage.getItem(`ods_reviews_${product.id}`);
      const localList = stored ? JSON.parse(stored) : [];
      localStorage.setItem(`ods_reviews_${product.id}`, JSON.stringify([revObj, ...localList]));
    } catch (e) {}

    showToast('Cảm ơn bạn đã gửi đánh giá cho sản phẩm!', 'success');
    setNewComment('');
    setNewRating(5);
    setIsSubmittingReview(false);
  };

  // Construct Unified Media Items (Images + Videos, Video Trailer placed first if available)
  const mediaItems = useMemo<MediaItem[]>(() => {
    const images: MediaItem[] = [];
    const videos: MediaItem[] = [];

    // Parse images
    const screenshotList = product.screenshots && Array.isArray(product.screenshots) && product.screenshots.length > 0
      ? product.screenshots
      : [product.coverImage];

    screenshotList.forEach((imgUrl: string, idx: number) => {
      images.push({
        id: `img-${idx}`,
        type: 'image',
        url: imgUrl,
        thumbnailUrl: imgUrl,
      });
    });

    // Parse YouTube videos
    let videoUrls: string[] = [];
    if (product.trailerUrls && Array.isArray(product.trailerUrls) && product.trailerUrls.length > 0) {
      videoUrls = product.trailerUrls;
    } else if (product.trailerUrl) {
      videoUrls = product.trailerUrl.split(' | ').filter((u: string) => u.trim().length > 0);
    }

    videoUrls.forEach((vUrl: string, idx: number) => {
      const ytInfo = getYouTubeInfo(vUrl);
      if (ytInfo) {
        videos.push({
          id: `vid-${idx}`,
          type: 'video',
          url: vUrl,
          embedUrl: ytInfo.embedUrl,
          thumbnailUrl: ytInfo.thumbnailUrl,
        });
      }
    });

    // If videos are available, show video first for rich cinematic experience across all browsers
    if (videos.length > 0) {
      return [...videos, ...images];
    }

    return images;
  }, [product]);

  const activeMedia = mediaItems[activeMediaIdx] || mediaItems[0];

  const handleNextMedia = () => {
    setActiveMediaIdx((prev) => (prev + 1) % mediaItems.length);
  };

  const handlePrevMedia = () => {
    setActiveMediaIdx((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN') + ' đ';
  };

  // Variants calculation (Duration packages ONLY for Accounts & Services like Netflix/Spotify, strictly disabled for Games!)
  const availableVariants = useMemo(() => {
    if (!product) return [];

    // Games (Steam, Key, Shared Acc, Offline Acc) DO NOT HAVE DURATION PACKAGES!
    const isServiceOrSubscription =
      product.type === 'SERVICE' ||
      product.deliveryMethod === 'NEW_ACC' ||
      product.deliveryMethod === 'UPGRADE_ACC' ||
      (product.name && /netflix|spotify|nitro|canva|youtube/i.test(product.name));

    if (!isServiceOrSubscription) {
      return [];
    }

    if (Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants;
    }

    const baseP = product.discountPrice ?? product.price ?? 79000;
    const baseOrig = product.price ?? 120000;

    return [
      { id: 'v-1m', name: '1 Tháng', price: baseOrig, discountPrice: baseP },
      { id: 'v-3m', name: '3 Tháng', price: Math.round(baseOrig * 2.75), discountPrice: Math.round(baseP * 2.75) },
      { id: 'v-6m', name: '6 Tháng', price: Math.round(baseOrig * 5.2), discountPrice: Math.round(baseP * 5) },
      { id: 'v-12m', name: '12 Tháng', price: Math.round(baseOrig * 9.5), discountPrice: Math.round(baseP * 9) },
    ];
  }, [product]);

  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0); // Default to 1 Tháng

  const selectedVariant = availableVariants.length > 0 ? (availableVariants[selectedVariantIdx] || availableVariants[0]) : null;
  const activePrice = selectedVariant ? (selectedVariant.discountPrice ?? selectedVariant.price) : (product?.discountPrice ?? product?.price ?? 0);
  const originalPrice = selectedVariant ? selectedVariant.price : (product?.price ?? 0);
  const hasDiscount = originalPrice > activePrice;
  const discountPercent = hasDiscount && originalPrice > 0
    ? Math.round(((originalPrice - activePrice) / originalPrice) * 100)
    : 0;

  const averageRating = useMemo(() => {
    if (userReviews.length === 0) return 0;
    const total = userReviews.reduce((sum: number, r: any) => sum + (r.rating || 5), 0);
    return Math.round((total / userReviews.length) * 10) / 10;
  }, [userReviews]);

  return (
    <CartProvider>
      <div className="min-h-screen bg-white text-black flex flex-col antialiased">
        <Header />

        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {/* BACK NAVIGATION */}
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-ods-textMuted hover:text-black uppercase tracking-wider mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4 text-ods-primary" /> Quay Lại Cửa Hàng
          </Link>

          {isLoading ? (
            <div className="py-20 text-center text-xs font-semibold text-ods-textMuted">
              Đang tải thông tin chi tiết sản phẩm...
            </div>
          ) : (
            <>
              {/* MAIN PRODUCT BLOCK */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
                
                {/* UNIFIED MEDIA GALLERY COMPONENT (7 cols on desktop) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Big Main Media Viewer */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-ods border border-ods-border bg-zinc-950 group select-none shadow-sm flex items-center justify-center">
                    {activeMedia ? (
                      activeMedia.type === 'video' && activeMedia.embedUrl ? (
                        <iframe
                          key={activeMedia.id}
                          src={activeMedia.embedUrl}
                          title={product.name}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0 relative z-20"
                        />
                      ) : (
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activeMedia.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="absolute inset-0 h-full w-full"
                          >
                            {/* Ambient Blurred Background Layer */}
                            <img
                              src={activeMedia.url}
                              alt="Ambient Backdrop"
                              className="absolute inset-0 h-full w-full object-cover blur-xl opacity-35 scale-110 pointer-events-none"
                            />
                            {/* Crisp Sharp Uncropped Foreground Image */}
                            <img
                              src={activeMedia.url}
                              alt={product.name}
                              className="relative z-10 h-full w-full object-contain cursor-pointer hover:scale-[1.02] transition-transform duration-500 drop-shadow-lg"
                              onClick={() => setIsFullscreen(true)}
                            />
                          </motion.div>
                        </AnimatePresence>
                      )
                    ) : null}
                    
                    {/* Discount Badge */}
                    {hasDiscount && (
                      <span className="absolute top-4 right-4 bg-ods-accent text-black text-xs font-extrabold px-3 py-1 rounded-sm shadow-md z-30 pointer-events-none">
                        -{discountPercent}% OFF
                      </span>
                    )}

                    {/* Fullscreen Zoom Button (Only for images) */}
                    {activeMedia && activeMedia.type === 'image' && (
                      <button
                        onClick={() => setIsFullscreen(true)}
                        className="absolute bottom-4 right-4 p-2 rounded-ods bg-black/60 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black z-30"
                        title="Xem ảnh phóng to"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </button>
                    )}

                    {/* Left / Right Carousel Controls */}
                    {mediaItems.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevMedia}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm active:scale-90 z-30"
                          title="Media trước"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={handleNextMedia}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm active:scale-90 z-30"
                          title="Media tiếp theo"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Media Thumbnails Strip (Video + Images) */}
                  {mediaItems.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto py-2.5 px-1">
                      {mediaItems.map((item, idx) => {
                        const isActive = activeMediaIdx === idx;
                        return (
                          <motion.button
                            key={item.id}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveMediaIdx(idx)}
                            className={`relative aspect-[16/9] w-28 overflow-hidden rounded-ods border bg-ods-surface transition-all duration-300 shrink-0 ${
                              isActive
                                ? 'border-ods-primary ring-2 ring-ods-primary ring-offset-2 shadow-skyGlow opacity-100'
                                : 'border-ods-border opacity-65 hover:opacity-100'
                            }`}
                          >
                            <img src={item.thumbnailUrl} alt={`media-thumb-${idx}`} className="w-full h-full object-cover" />
                            
                            {/* Video Badge Overlay */}
                            {item.type === 'video' && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="p-1 rounded-full bg-red-600 text-white shadow-md">
                                  <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                                </div>
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* PRODUCT BUY CONTROLS HERO (5 cols on desktop) */}
                <div className="lg:col-span-5 space-y-6">
                  <div>
                    {/* Sleek Platform & Category Tag Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {/* Platform Badge */}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs">
                        <Monitor className="h-3.5 w-3.5 text-sky-600" />
                        <span>{product.platform || 'STEAM'}</span>
                      </span>

                      {/* Category Badges */}
                      {(Array.isArray(product.category)
                        ? product.category
                        : typeof product.category === 'string'
                        ? product.category.split(',').map((c: string) => c.trim())
                        : []
                      ).map((cat: string) => (
                        <span
                          key={cat}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 transition-all cursor-default shadow-2xs"
                        >
                          <Tag className="h-2.5 w-2.5 text-zinc-400" />
                          <span>{cat}</span>
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h1 className="font-heading text-3xl font-extrabold tracking-wide text-black mt-2 leading-tight">
                      {product.name}
                    </h1>

                    {/* CLICKABLE RATING SUMMARY (Scrolls smoothly to reviews section) */}
                    <button
                      onClick={() => {
                        document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex items-center gap-2 mt-3 group cursor-pointer hover:opacity-85 transition-all text-left"
                    >
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 fill-current ${i < Math.floor(averageRating) ? '' : 'text-zinc-200 fill-none'}`} />
                        ))}
                      </div>
                      <span className="text-xs font-extrabold text-black ml-0.5">{averageRating} / 5.0</span>
                      <span className="text-xs text-ods-primary font-bold underline underline-offset-4 group-hover:text-black transition-colors">
                        ({userReviews.length} đánh giá từ khách hàng)
                      </span>
                    </button>
                  </div>

                  {/* Delivery info */}
                  <div className="flex items-center gap-2 rounded-ods border border-ods-border bg-ods-surface px-4 py-3 text-xs text-black">
                    <ShieldCheck className="h-5 w-5 text-ods-primary shrink-0" />
                    <div>
                      <span className="font-bold">
                        {product.deliveryMethod === 'GIFT_ACC'
                          ? 'GIFT TÀI KHOẢN TRỰC TIẾP 🎁'
                          : product.deliveryMethod === 'NEW_ACC'
                          ? 'GỬI THÔNG TIN TÀI KHOẢN MỚI 🔑'
                          : product.deliveryMethod === 'UPGRADE_ACC'
                          ? 'NÂNG CẤP TÀI KHOẢN CHÍNH CHỦ 🚀'
                          : 'GIAO KEY TỰ ĐỘNG 24/7 ⚡'}
                      </span>
                      <p className="text-[10px] text-ods-textMuted font-light mt-0.5">
                        {product.deliveryMethod === 'UPGRADE_ACC'
                          ? 'Nâng cấp trực tiếp trên tài khoản cá nhân của bạn bảo hành full thời gian.'
                          : product.deliveryMethod === 'GIFT_ACC'
                          ? 'Nhận quà tặng hoặc kích hoạt trực tiếp nhanh chóng sau thanh toán.'
                          : product.deliveryMethod === 'NEW_ACC'
                          ? 'Nhận thông tin tài khoản mới cấp sẵn bảo hành đầy đủ.'
                          : 'Nhận Key bản quyền kích hoạt tức thì sau khi thanh toán thành công.'}
                      </p>
                    </div>
                  </div>

                  {/* PACKAGE DURATION SELECTOR (CHỌN GÓI THỜI HẠN SỬ DỤNG) */}
                  {availableVariants.length > 0 && (
                    <div className="border-t border-gray-100 pt-6 pb-2 space-y-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-black uppercase text-black tracking-wider flex items-center gap-2">
                          <Clock className="h-4 w-4 text-sky-600 shrink-0" />
                          <span>CHỌN GÓI THỜI HẠN SỬ DỤNG:</span>
                        </span>
                        <span className="text-[11px] font-extrabold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 shadow-2xs">
                          Gói đã chọn: {selectedVariant?.name}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
                        {availableVariants.map((v: any, idx: number) => {
                          const isSelected = idx === selectedVariantIdx;
                          const vOriginal = v.price;
                          const vSale = v.discountPrice ?? v.price;
                          const hasVariantDiscount = vOriginal > vSale;
                          const vDiscountPercent = hasVariantDiscount
                            ? Math.round(((vOriginal - vSale) / vOriginal) * 100)
                            : 0;

                          return (
                            <button
                              key={v.id || idx}
                              type="button"
                              onClick={() => setSelectedVariantIdx(idx)}
                              className={`p-3.5 rounded-xl text-center flex flex-col items-center justify-center transition-all duration-200 border cursor-pointer relative ${
                                isSelected
                                  ? 'border-2 border-sky-500 bg-sky-50/80 text-black shadow-md ring-1 ring-sky-400/40 scale-[1.01]'
                                  : 'border-zinc-200 bg-white text-zinc-800 hover:border-black hover:bg-zinc-50/80 hover:shadow-xs'
                              }`}
                            >
                              {/* Selection Checkmark Badge in Top Right Corner */}
                              {isSelected && (
                                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-xs shrink-0">
                                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                                </span>
                              )}

                              {/* Package Duration Name */}
                              <span className={`font-heading text-xs font-black uppercase tracking-wide block text-center ${isSelected ? 'text-sky-950' : 'text-black'}`}>
                                {v.name}
                              </span>

                              {/* Sale Price */}
                              <span className={`font-heading text-sm sm:text-base font-black tracking-tight whitespace-nowrap block mt-1 ${isSelected ? 'text-sky-700 font-black' : 'text-zinc-900'}`}>
                                {formatCurrency(vSale)}
                              </span>

                              {/* Original Price & Discount Tag Centered */}
                              {hasVariantDiscount && (
                                <div className="flex items-center justify-center gap-1.5 mt-1 flex-wrap">
                                  <span className="text-[9px] font-black text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200/80">
                                    -{vDiscountPercent}%
                                  </span>
                                  <span className="text-[11px] font-semibold text-zinc-400 line-through whitespace-nowrap">
                                    {formatCurrency(vOriginal)}
                                  </span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Pricing breakdown */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-extrabold text-black">{formatCurrency(activePrice)}</span>
                      {hasDiscount && (
                        <span className="text-sm text-ods-textMuted line-through font-semibold">
                          {formatCurrency(originalPrice)}
                        </span>
                      )}
                      {hasDiscount && (
                        <span className="text-[11px] font-extrabold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                          GIẢM {discountPercent}%
                        </span>
                      )}
                    </div>
                    {product.status !== false ? (
                      <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Đang còn hàng (In Stock)
                      </p>
                    ) : (
                      <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Hết hàng (Out of Stock)
                      </p>
                    )}
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-4 gap-3 pt-2">
                    <AddToCartButton product={product} selectedVariant={selectedVariant} />

                    {/* Add to Wishlist Button */}
                    <button
                      onClick={() => setWishlistAdded(!wishlistAdded)}
                      className={`col-span-1 flex items-center justify-center rounded-ods border transition-all active:scale-95 py-3.5 ${
                        wishlistAdded
                          ? 'border-red-500 bg-red-50 text-red-500'
                          : 'border-ods-border bg-white text-ods-textMuted hover:border-black hover:text-black hover:shadow-lightShadow'
                      }`}
                      title="Lưu vào danh sách yêu thích"
                    >
                      <Heart className={`h-5 w-5 ${wishlistAdded ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Highlights Bullet List */}
                  <div className="border-t border-gray-100 pt-4 space-y-2 text-xs font-medium text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Cam kết 100% bản quyền kích hoạt chính hãng</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Hỗ trợ kỹ thuật cài đặt miễn phí trọn đời</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEQUENTIAL LAYOUT (TRẢI DÀI KHÔNG DÙNG TAB: CẤU HÌNH YÊU CẦU ➔ MÔ TẢ SẢN PHẨM ➔ ĐÁNH GIÁ SẢN PHẨM) */}
              <div className="space-y-12">

                {/* 1. SECTION: CẤU HÌNH YÊU CẦU (SYSTEM REQUIREMENTS) */}
                {product.platform !== 'SERVICE' && (
                  <div className="rounded-ods border border-ods-border bg-white p-6 sm:p-8 shadow-sm space-y-4">
                    <h2 className="font-heading text-lg font-extrabold uppercase tracking-wider text-black border-b border-ods-border pb-3 flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-ods-primary" />
                      <span>CẤU HÌNH YÊU CẦU</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-2">
                      {/* Minimum Requirements */}
                      <div className="rounded-ods border border-ods-border bg-ods-surface p-5 space-y-3">
                        <span className="font-heading text-xs font-bold uppercase tracking-wider text-black block border-b border-ods-border pb-2">
                          Cấu Hình Tối Thiểu (Minimum)
                        </span>
                        <div className="space-y-2 pt-1 text-gray-700 font-light">
                          <p><strong className="font-bold text-black">HĐH:</strong> {product.minimumReq?.os || 'Windows 10 64-bit'}</p>
                          <p><strong className="font-bold text-black">CPU:</strong> {product.minimumReq?.cpu || 'Intel Core i5'}</p>
                          <p><strong className="font-bold text-black">RAM:</strong> {product.minimumReq?.ram || '8 GB RAM'}</p>
                          <p><strong className="font-bold text-black">Đồ Họa:</strong> {product.minimumReq?.gpu || 'NVIDIA GTX 1050'}</p>
                          <p><strong className="font-bold text-black">Lưu Trữ:</strong> {product.minimumReq?.storage || '50 GB SSD'}</p>
                        </div>
                      </div>

                      {/* Recommended Requirements */}
                      <div className="rounded-ods border border-ods-border bg-ods-surface p-5 space-y-3">
                        <span className="font-heading text-xs font-bold uppercase tracking-wider text-black block border-b border-ods-border pb-2">
                          Cấu Hình Khuyến Nghị (Recommended)
                        </span>
                        <div className="space-y-2 pt-1 text-gray-700 font-light">
                          <p><strong className="font-bold text-black">HĐH:</strong> {product.recommendedReq?.os || 'Windows 10 64-bit'}</p>
                          <p><strong className="font-bold text-black">CPU:</strong> {product.recommendedReq?.cpu || 'Intel Core i7'}</p>
                          <p><strong className="font-bold text-black">RAM:</strong> {product.recommendedReq?.ram || '16 GB RAM'}</p>
                          <p><strong className="font-bold text-black">Đồ Họa:</strong> {product.recommendedReq?.gpu || 'NVIDIA RTX 2060'}</p>
                          <p><strong className="font-bold text-black">Lưu Trữ:</strong> {product.recommendedReq?.storage || '70 GB SSD'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SECTION: MÔ TẢ SẢN PHẨM (PRODUCT DESCRIPTION) */}
                <div className="rounded-ods border border-ods-border bg-white p-6 sm:p-8 shadow-sm space-y-4">
                  <h2 className="font-heading text-lg font-extrabold uppercase tracking-wider text-black border-b border-ods-border pb-3 flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5 text-ods-primary" />
                    <span>MÔ TẢ SẢN PHẨM</span>
                  </h2>

                  <div className="space-y-4 text-xs leading-relaxed text-gray-700 font-light pt-2">
                    <p className="whitespace-pre-line leading-relaxed text-sm">{product.description}</p>
                  </div>
                </div>

                {/* 3. SECTION: ĐÁNH GIÁ SẢN PHẨM (CUSTOMER REVIEWS - TARGET FOR SMOOTH SCROLL) */}
                <div id="reviews-section" className="rounded-ods border border-ods-border bg-white p-6 sm:p-8 shadow-sm space-y-8">
                  <div className="flex items-center justify-between border-b border-ods-border pb-3">
                    <h2 className="font-heading text-lg font-extrabold uppercase tracking-wider text-black flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-ods-primary" />
                      <span>ĐÁNH GIÁ SẢN PHẨM ({userReviews.length})</span>
                    </h2>

                    <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                      ⭐ {userReviews.length > 0 ? `${averageRating} / 5.0` : '0.0 / 5.0'} Điểm Chấm
                    </span>
                  </div>

                  {/* RATING OVERVIEW BLOCK */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-ods-surface border border-ods-border p-6 rounded-ods items-center">
                    <div className="md:col-span-4 text-center md:border-r md:border-ods-border md:pr-6 space-y-1">
                      <span className="text-4xl font-black text-black block">{userReviews.length > 0 ? averageRating : '0'}</span>
                      <div className="flex justify-center text-amber-400 my-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              userReviews.length > 0 && i < Math.floor(averageRating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-zinc-300 fill-none'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-ods-textMuted font-medium block">Đánh giá trung bình ({userReviews.length} nhận xét)</span>
                    </div>

                    {/* STAR BREAKDOWN PROGRESS BARS */}
                    <div className="md:col-span-8 space-y-2 text-xs">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = userReviews.filter((r) => r.rating === star).length;
                        const pct = userReviews.length > 0 ? Math.round((count / userReviews.length) * 100) : 0;
                        return (
                          <div key={star} className="flex items-center gap-3">
                            <span className="w-12 font-extrabold text-black text-right shrink-0">{star} sao</span>
                            <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-10 text-xs text-ods-textMuted font-semibold text-right shrink-0">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* WRITE A REVIEW FORM (AUTO USER ACCOUNT NAME - NO MANUAL NAME INPUT NEEDED!) */}
                  <form onSubmit={handleAddReview} className="rounded-ods border border-ods-border bg-white p-5 space-y-4 shadow-sm">
                    <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
                      <Send className="h-4 w-4 text-ods-primary" />
                      <span>Gửi Nhận Xét Của Bạn</span>
                    </h4>

                    {/* AUTOMATIC ACCOUNT NAME DISPLAY BADGE */}
                    <div className="flex items-center gap-3 bg-ods-surface border border-ods-border p-3 rounded-ods">
                      <div className="h-8 w-8 rounded-full bg-ods-primary text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0">
                        {(currentUser?.name || 'K').slice(0, 1)}
                      </div>
                      <div>
                        <span className="text-[10px] text-ods-textMuted uppercase font-bold tracking-wider block">Đánh giá dưới tên tài khoản:</span>
                        <span className="text-xs font-extrabold text-black flex items-center gap-1.5">
                          {currentUser?.name || 'Khách hàng ODS'}
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            <Award className="h-2.5 w-2.5" /> Thành viên chính thức
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Star Rating Picker */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block">Chọn Số Sao Đánh Giá *</label>
                      <div className="flex items-center gap-1 text-amber-400 py-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            onMouseEnter={() => setNewHoverRating(star)}
                            onMouseLeave={() => setNewHoverRating(0)}
                            className="p-1 transition-transform hover:scale-125 focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 cursor-pointer ${
                                star <= (newHoverRating || newRating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-none text-zinc-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-xs font-bold text-black">{newRating} / 5 Sao</span>
                      </div>
                    </div>

                    {/* Comment Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block">Nội Dung Nhận Xét *</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Chia sẻ trải nghiệm kích hoạt key, chất lượng dịch vụ của bạn về sản phẩm này..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full rounded-ods border border-ods-border bg-white p-3 text-xs font-normal text-black focus:border-ods-primary focus:outline-none leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="inline-flex items-center gap-2 rounded-ods bg-ods-primary hover:bg-ods-primaryHover text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-buttonGlow active:scale-95 disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Gửi Đánh Giá Ngay</span>
                      </button>
                    </div>
                  </form>

                  {/* CUSTOMER REVIEWS LIST */}
                  <div className="space-y-4">
                    <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-black">
                      DANH SÁCH NHẬN XÉT ({userReviews.length})
                    </h4>

                    {userReviews.length === 0 ? (
                      <div className="rounded-ods border border-dashed border-ods-border bg-ods-surface p-6 text-center space-y-1">
                        <MessageSquare className="h-8 w-8 text-gray-300 mx-auto" />
                        <p className="text-xs font-bold text-black uppercase tracking-wider">Chưa có nhận xét nào</p>
                        <p className="text-xs text-ods-textMuted font-light">Sản phẩm này chưa có đánh giá. Hãy là người đầu tiên mua và viết nhận xét!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userReviews.map((rev) => (
                          <div key={rev.id} className="rounded-ods border border-ods-border bg-ods-surface p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-full bg-ods-primary text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                                  {rev.author.slice(0, 1)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-black">{rev.author}</span>
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                      <CheckCircle2 className="h-2.5 w-2.5" /> Đã mua hàng tại ODS
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-ods-textMuted font-light block">{rev.date}</span>
                                </div>
                              </div>

                              <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-3.5 w-3.5 fill-current ${i < rev.rating ? '' : 'text-zinc-200 fill-none'}`} />
                                ))}
                              </div>
                            </div>

                            <p className="text-xs text-gray-700 leading-relaxed font-light pt-1">{rev.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </>
          )}
        </main>

        {/* FULLSCREEN LIGHTBOX MODAL */}
        <AnimatePresence>
          {isFullscreen && activeMedia && activeMedia.type === 'image' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setIsFullscreen(false)}
            >
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-6 right-6 text-white hover:text-ods-primary font-bold text-xl p-2"
              >
                <X className="h-8 w-8" />
              </button>
              <img
                src={activeMedia.url}
                alt="Fullscreen Preview"
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-ods shadow-2xl"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}

// Helper wrapper component for access to Cart Context
function AddToCartButton({ product, selectedVariant }: { product: any; selectedVariant?: any }) {
  const { addToCart } = useCart();
  const isInStock = product.status !== false;

  if (!isInStock) {
    return (
      <button
        disabled
        className="col-span-3 flex items-center justify-center gap-2 rounded-ods bg-gray-200 text-gray-400 py-3.5 text-xs font-bold uppercase tracking-wider cursor-not-allowed"
      >
        <ShoppingCart className="h-4 w-4" />
        <span>HẾT HÀNG</span>
      </button>
    );
  }

  const finalPrice = selectedVariant ? selectedVariant.price : product.price;
  const finalDiscountPrice = selectedVariant ? (selectedVariant.discountPrice ?? selectedVariant.price) : product.discountPrice;
  const finalName = selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name;
  const finalId = selectedVariant ? `${product.id}-${selectedVariant.id || selectedVariant.name}` : product.id;

  return (
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

        addToCart({
          id: finalId,
          productId: product.id,
          variantName: selectedVariant ? selectedVariant.name : undefined,
          name: finalName,
          slug: product.slug,
          price: finalPrice,
          discountPrice: finalDiscountPrice,
          coverImage: product.coverImage,
          platform: product.platform,
        });
      }}
      className="col-span-3 flex items-center justify-center gap-2 rounded-ods bg-ods-primary hover:bg-ods-primaryHover text-white py-3.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 hover:shadow-buttonGlow cursor-pointer"
    >
      <ShoppingCart className="h-4 w-4" />
      <span>Thêm Vào Giỏ</span>
    </button>
  );
}
