'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { ProductCard, ProductProps } from '@/components/ProductCard';
import { FeaturedDealCard } from '@/components/FeaturedDealCard';
import { CartDrawer } from '@/components/CartDrawer';
import { Footer } from '@/components/Footer';
import { CartProvider, useCart } from '@/context/CartContext';
import { Search, SlidersHorizontal, Flame, Award, Clock, ShoppingCart, Percent, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('FEATURED');
  const [liveProducts, setLiveProducts] = useState<ProductProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  const DEFAULT_HOME_PRODUCTS: ProductProps[] = useMemo(() => [], []);

  // Fetch live products from database API & local admin cache
  useEffect(() => {
    setIsLoading(true);
    let localProds: ProductProps[] = [];
    let deletedKeys: string[] = [];

    try {
      const storedDeleted = localStorage.getItem('ods_deleted_product_ids');
      if (storedDeleted) deletedKeys = JSON.parse(storedDeleted);
    } catch (e) {}

    const isDeletedOrObsolete = (p: any) => {
      if (!p) return true;
      const pid = String(p.id || '').toLowerCase();
      const pslug = String(p.slug || '').toLowerCase();
      const pname = String(p.name || p.title || '').toLowerCase();

      // Purge old stale mock leftovers (Netflix, Rust, Stardew, Wukong) so Cốc Cốc, Chrome, and all browsers are 100% synced
      if (
        pname.includes('netflix') ||
        pslug.includes('netflix') ||
        pname.includes('rust') ||
        pslug.includes('rust') ||
        pname.includes('stardew') ||
        pslug.includes('stardew') ||
        pname.includes('wukong') ||
        pslug.includes('wukong')
      ) {
        return true;
      }

      return deletedKeys.some((dk) => {
        const k = String(dk).toLowerCase();
        return (
          pid === k ||
          pslug === k ||
          pname === k ||
          (pslug.length > 3 && k.includes(pslug)) ||
          (k.length > 3 && pslug.includes(k))
        );
      });
    };

    try {
      const stored = localStorage.getItem('ods_admin_products');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          localProds = parsed.filter((p) => !isDeletedOrObsolete(p));
        }
      }
    } catch (e) {}

    fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        const apiProds = data.products && Array.isArray(data.products) ? data.products.filter((p: any) => !isDeletedOrObsolete(p)) : [];
        const combined = [...DEFAULT_HOME_PRODUCTS];

        localProds.forEach((lp: any) => {
          const idx = combined.findIndex((p) => p.id === lp.id || p.slug === lp.slug || p.name === lp.name);
          if (idx >= 0) {
            combined[idx] = { ...combined[idx], ...lp };
          } else {
            combined.push(lp);
          }
        });

        apiProds.forEach((ap: any) => {
          const idx = combined.findIndex((p) => p.id === ap.id || p.slug === ap.slug || p.name === ap.name);
          if (idx >= 0) {
            combined[idx] = { ...combined[idx], ...ap };
          } else {
            combined.push(ap);
          }
        });

        const finalLive = combined.filter((p) => !isDeletedOrObsolete(p));
        setLiveProducts(finalLive);
        try {
          localStorage.setItem('ods_admin_products', JSON.stringify(finalLive));
        } catch (e) {}
      })
      .catch((err) => {
        console.error('Lỗi khi tải sản phẩm thực tế:', err);
        const combined = [...DEFAULT_HOME_PRODUCTS];
        localProds.forEach((lp: any) => {
          const idx = combined.findIndex((p) => p.id === lp.id || p.slug === lp.slug || p.name === lp.name);
          if (idx >= 0) {
            combined[idx] = { ...combined[idx], ...lp };
          } else {
            combined.push(lp);
          }
        });
        const finalLive = combined.filter((p) => !isDeletedOrObsolete(p));
        setLiveProducts(finalLive);
        try {
          localStorage.setItem('ods_admin_products', JSON.stringify(finalLive));
        } catch (e) {}
      })
      .finally(() => setIsLoading(false));
  }, [DEFAULT_HOME_PRODUCTS]);

  const allProducts = liveProducts;

  // Filter Featured Weekly Deals (Products flagged with isFeaturedDeal, prioritized Resident Evil Requiem #1)
  const featuredDeals = useMemo(() => {
    const sorted = [...allProducts].sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      if (aName.includes('resident evil')) return -1;
      if (bName.includes('resident evil')) return 1;
      if (aName.includes('dying light')) return -1;
      if (bName.includes('dying light')) return 1;
      return 0;
    });

    const flagged = sorted.filter((p) => p.isFeaturedDeal);
    if (flagged.length > 0) return flagged;
    return sorted.slice(0, 3);
  }, [allProducts]);

  // Active Featured Item for Hero Slider
  const activeFeatured = featuredDeals[currentFeaturedIndex] || featuredDeals[0];

  // Auto-play hero slider every 3 seconds (3000ms) without manual navigation buttons per user request
  useEffect(() => {
    if (featuredDeals.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentFeaturedIndex((prev) => (prev + 1) % featuredDeals.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [featuredDeals.length]);

  // Fixed Synchronized Best Sellers List (#1 Resident Evil Requiem, #2 Dying Light: The Beast, #3 Palworld, #4 Wukong)
  const bestSellersProducts = useMemo(() => {
    const sorted = [...allProducts].sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();

      const getPriority = (name: string) => {
        if (name.includes('resident evil')) return 1;
        if (name.includes('dying light')) return 2;
        if (name.includes('palworld')) return 3;
        if (name.includes('wukong') || name.includes('black myth')) return 4;
        if (name.includes('cyberpunk')) return 5;
        return 99;
      };

      return getPriority(aName) - getPriority(bName);
    });

    return sorted.slice(0, 4);
  }, [allProducts]);

  // Filter Flash Deals Products
  const flashDealsProducts = useMemo(() => {
    const flagged = allProducts.filter((p) => p.isFlashDeal);
    if (flagged.length > 0) return flagged.slice(0, 3);
    return allProducts.filter((p) => p.discountPrice !== null && p.discountPrice! < p.price).slice(0, 3);
  }, [allProducts]);

  // Dynamic Countdown Timer calculation based on nearest flashSaleEnd date
  const [countdown, setCountdown] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const targetProductWithEnd = flashDealsProducts.find((p) => p.flashSaleEnd);
    
    const updateTimer = () => {
      let targetTime: number;
      if (targetProductWithEnd && targetProductWithEnd.flashSaleEnd) {
        targetTime = new Date(targetProductWithEnd.flashSaleEnd).getTime();
      } else {
        const tonight = new Date();
        tonight.setHours(23, 59, 59, 999);
        targetTime = tonight.getTime();
      }

      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown({ hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [flashDealsProducts]);

  // Filter products based on controls
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.category && product.category.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesPlatform = selectedPlatform === 'ALL' || product.platform === selectedPlatform;
      const matchesType = selectedType === 'ALL' || product.type === selectedType;

      return matchesSearch && matchesPlatform && matchesType;
    }).sort((a, b) => {
      const aPrice = a.discountPrice ?? a.price;
      const bPrice = b.discountPrice ?? b.price;

      if (sortBy === 'PRICE_ASC') return aPrice - bPrice;
      if (sortBy === 'PRICE_DESC') return bPrice - aPrice;
      return 0;
    });
  }, [allProducts, searchQuery, selectedPlatform, selectedType, sortBy]);

  // Live search autocomplete list
  const autocompleteList = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return allProducts.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [allProducts, searchQuery]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col antialiased">
        {/* HEADER */}
        <Header />

        {/* MODULAR HERO SECTION (CINEMATIC PREMIUM REDESIGNED HERO) */}
        <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left 60% Block - Primary Highlight (SENIOR DESIGNED FEATURED DEAL CARD) */}
            <div className="lg:col-span-3 flex">
              {activeFeatured ? (
                <FeaturedDealCard
                  products={featuredDeals}
                  currentIndex={currentFeaturedIndex}
                  onSelectIndex={(idx) => setCurrentFeaturedIndex(idx)}
                />
              ) : (
                <div className="py-20 text-center text-gray-400 text-xs">Đang tải deal nổi bật...</div>
              )}
            </div>

            {/* Right 40% Block - TOP BEST SELLERS RANKING (TOP GAME BÁN CHẠY TUẦN NÀY) */}
            <div className="lg:col-span-2 flex flex-col justify-between rounded-2xl border border-ods-border bg-white p-6 min-h-[480px] shadow-sm">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-ods-border pb-3">
                  <span className="font-heading text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-amber-500 fill-amber-400" /> TOP SẢN PHẨM BÁN CHẠY
                  </span>
                  
                  {/* Top Ranking Tag */}
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                    <span>🔥 BẢNG XẾP HẠNG TUẦN</span>
                  </div>
                </div>

                {/* Dynamic Best Sellers List with Rank Badges (#1, #2, #3, #4) */}
                <div className="space-y-3">
                  {bestSellersProducts.length > 0 ? (
                    bestSellersProducts.map((deal, idx) => {
                      const activePrice = deal.discountPrice ?? deal.price;
                      const rank = idx + 1;
                      return (
                        <Link key={deal.id} href={`/products/${deal.slug}`} className="flex items-center gap-3 bg-ods-surface border border-ods-border p-2.5 rounded-xl relative group hover:border-black hover:shadow-md transition-all">
                          {/* Rank Badge Indicator */}
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 shadow-xs border ${
                            rank === 1
                              ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black border-amber-300'
                              : rank === 2
                              ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-black border-slate-300'
                              : rank === 3
                              ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100 border-amber-600'
                              : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                          }`}>
                            #{rank}
                          </div>

                          {/* Sleek Widescreen 16:9 Game Banner Box (No Black Letterboxing) */}
                          <div className="relative w-20 sm:w-24 aspect-[16/9] rounded-lg overflow-hidden bg-zinc-900 border border-ods-border shadow-xs shrink-0 group-hover:border-ods-primary transition-all">
                            <img 
                              src={deal.coverImage} 
                              alt={deal.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                          </div>

                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[8.5px] text-ods-primary font-bold uppercase tracking-wider">{deal.platform}</span>
                              {deal.discountPrice && (
                                <span className="text-[8.5px] text-red-600 font-extrabold bg-red-50 px-1 rounded border border-red-200">HOT SALE</span>
                              )}
                            </div>
                            <h4 className="font-heading text-xs font-bold text-black group-hover:underline truncate">{deal.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-extrabold text-black">{formatCurrency(activePrice)}</span>
                              {deal.discountPrice && (
                                <span className="text-[9px] text-ods-textMuted line-through">{formatCurrency(deal.price)}</span>
                              )}
                            </div>
                          </div>
                          <div className="relative z-10 shrink-0">
                            <QuickBuyButton product={deal} />
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-xs text-ods-textMuted">Đang cập nhật bảng xếp hạng top game...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CORE FEATURES STRIP */}
        <section className="border-y border-ods-border bg-ods-surface py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="rounded-ods border border-ods-border bg-white p-3 text-black">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-black">BẢO HÀNH CHÍNH HÃNG 100%</h4>
                  <p className="text-[11px] text-ods-textMuted font-light">Hoàn tiền 100% nếu sản phẩm lỗi kích hoạt</p>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="rounded-ods border border-ods-border bg-white p-3 text-black">
                  <Clock className="h-5 w-5 text-ods-primary" />
                </div>
                <div>
                  <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-black">GIAO KEY TỰ ĐỘNG 24/7</h4>
                  <p className="text-[11px] text-ods-textMuted font-light">Nhận mã kích hoạt tức thì sau khi chuyển khoản</p>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="rounded-ods border border-ods-border bg-white p-3 text-black">
                  <Flame className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-black">HỖ TRỢ KỸ THUẬT SIÊU TỐC</h4>
                  <p className="text-[11px] text-ods-textMuted font-light">Đội ngũ CSKH sẵn sàng phục vụ từ 8h - 24h</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN PRODUCT CATALOG SECTION */}
        <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 flex-1">
          {/* SEARCH & FILTERS BAR */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-ods-primary font-bold uppercase tracking-widest block mb-1">
                  DISCOVER STORE
                </span>
                <h2 className="font-heading text-2xl font-extrabold uppercase tracking-wider text-black">
                  DANH SÁCH SẢN PHẨM KHUYÊN DÙNG
                </h2>
              </div>

              {/* SEARCH INPUT */}
              <div className="relative w-full md:w-96">
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-ods-textMuted" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm tên game, dịch vụ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    className="w-full rounded-ods border border-ods-border bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-black placeholder-zinc-400 focus:border-ods-primary focus:outline-none focus:ring-1 focus:ring-ods-primary transition-all shadow-sm"
                  />
                </div>

                {/* Autocomplete Dropdown */}
                {isSearchFocused && autocompleteList.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 rounded-ods border border-ods-border bg-white p-2 shadow-2xl z-40 space-y-1">
                    {autocompleteList.map((item) => (
                      <Link
                        key={item.id}
                        href={`/products/${item.slug}`}
                        className="flex items-center gap-3 p-2 rounded hover:bg-ods-surface transition-colors"
                      >
                        <img src={item.coverImage} alt={item.name} className="h-8 w-12 object-cover rounded bg-black" />
                        <div className="flex-1 truncate">
                          <span className="font-bold text-xs text-black block truncate">{item.name}</span>
                          <span className="text-[10px] font-bold text-ods-primary">{formatCurrency(item.discountPrice ?? item.price)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* FILTER CATEGORY BUTTONS */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ods-border pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedPlatform('ALL')}
                  className={`rounded-ods px-4 py-2 text-xs font-bold uppercase transition-all ${
                    selectedPlatform === 'ALL'
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-ods-surface text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  TẤT CẢ NỀN TẢNG
                </button>
                <button
                  onClick={() => setSelectedPlatform('STEAM')}
                  className={`rounded-ods px-4 py-2 text-xs font-bold uppercase transition-all ${
                    selectedPlatform === 'STEAM'
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-ods-surface text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  STEAM
                </button>
                <button
                  onClick={() => setSelectedPlatform('EPIC')}
                  className={`rounded-ods px-4 py-2 text-xs font-bold uppercase transition-all ${
                    selectedPlatform === 'EPIC'
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-ods-surface text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  EPIC GAMES
                </button>
                <button
                  onClick={() => setSelectedPlatform('SERVICE')}
                  className={`rounded-ods px-4 py-2 text-xs font-bold uppercase transition-all ${
                    selectedPlatform === 'SERVICE'
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-ods-surface text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  DỊCH VỤ & TÀI KHOẢN
                </button>
              </div>

              {/* SORT DROPDOWN */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-ods-textMuted" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-ods border border-ods-border bg-white py-1.5 px-3 text-xs font-semibold text-black focus:border-ods-primary focus:outline-none"
                >
                  <option value="FEATURED">Nổi Bật Nhất</option>
                  <option value="PRICE_ASC">Giá: Thấp Đến Cao</option>
                  <option value="PRICE_DESC">Giá: Cao Đến Thấp</option>
                </select>
              </div>
            </div>
          </div>

          {/* PRODUCTS GRID */}
          {isLoading ? (
            <div className="py-20 text-center text-xs text-ods-textMuted">Đang tải kho sản phẩm...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <p className="text-sm font-bold text-black">Không tìm thấy sản phẩm nào phù hợp.</p>
              <p className="text-xs text-ods-textMuted">Hãy thử tìm kiếm từ khóa khác hoặc xóa bộ lọc.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <Footer />
      </div>
  );
}

// Quick Buy Button for Flash Deals
function QuickBuyButton({ product }: { product: ProductProps }) {
  const { addToCart } = useCart();
  const isInStock = product.status !== false;

  if (!isInStock) {
    return (
      <button
        disabled
        className="rounded-full bg-gray-200 text-gray-400 p-2 text-xs font-bold cursor-not-allowed shrink-0"
        title="Hết hàng"
      >
        <ShoppingCart className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
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
      }}
      className="rounded-full bg-ods-primary hover:bg-ods-primaryHover text-white p-2 text-xs font-bold transition-all active:scale-95 hover:shadow-buttonGlow shrink-0"
      title="Thêm vào giỏ"
    >
      <ShoppingCart className="h-4 w-4" />
    </button>
  );
}
