'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { ProductCard, ProductProps } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { Search, SlidersHorizontal, Flame, Clock, Tag, ArrowLeft, Grid, Filter } from 'lucide-react';

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'ALL';
  const initialCategory = searchParams.get('category') || 'ALL';
  const initialPlatform = searchParams.get('platform') || 'ALL';

  const [activeFilter, setActiveFilter] = useState<string>(initialFilter);
  const [selectedPlatform, setSelectedPlatform] = useState<string>(initialPlatform);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('FEATURED');

  const [liveProducts, setLiveProducts] = useState<ProductProps[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync state with query parameters
  useEffect(() => {
    if (searchParams.get('filter')) {
      setActiveFilter(searchParams.get('filter') || 'ALL');
    }
    if (searchParams.get('platform')) {
      setSelectedPlatform(searchParams.get('platform') || 'ALL');
    }
  }, [searchParams]);

  // Load products from database
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products)) {
          setLiveProducts(data.products);
        }
      })
      .catch((err) => console.error('Lỗi khi tải sản phẩm:', err))
      .finally(() => setIsLoading(false));

    // Load recently viewed
    try {
      const stored = localStorage.getItem('ods_recently_viewed');
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch (e) {
      setRecentlyViewed([]);
    }
  }, []);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN') + ' đ';
  };

  // Match valid recently viewed products against live database products
  const validRecentlyViewed = useMemo(() => {
    const matched: ProductProps[] = [];
    recentlyViewed.forEach((rv) => {
      const found = liveProducts.find((p) => p.id === rv.id || p.slug === rv.slug);
      if (found && !matched.some((m) => m.id === found.id)) {
        matched.push(found);
      }
    });
    return matched;
  }, [recentlyViewed, liveProducts]);

  // Filter products based on active filters
  const filteredProducts = useMemo(() => {
    let list = liveProducts;

    // Filter by Header Quick Nav Filter
    if (activeFilter === 'recently_viewed') {
      return validRecentlyViewed;
    }

    if (activeFilter === 'best_sellers') {
      list = list.filter((p) => p.isFeaturedDeal || (p.tags && p.tags.some((t: string) => t.toLowerCase().includes('hot') || t.toLowerCase().includes('bán chạy'))));
    }

    if (activeFilter === 'discounts') {
      list = list.filter((p) => (p.discountPrice && p.discountPrice < p.price) || (p.tags && p.tags.some((t: string) => t.toLowerCase().includes('giảm giá'))));
    }

    // Filter by Platform
    if (selectedPlatform !== 'ALL') {
      list = list.filter((p) => p.platform === selectedPlatform);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      list = list.filter((p) => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }

    // Sorting
    return [...list].sort((a, b) => {
      const aPrice = a.discountPrice ?? a.price;
      const bPrice = b.discountPrice ?? b.price;

      if (sortBy === 'PRICE_ASC') return aPrice - bPrice;
      if (sortBy === 'PRICE_DESC') return bPrice - aPrice;
      return 0;
    });
  }, [liveProducts, activeFilter, selectedPlatform, searchQuery, sortBy, validRecentlyViewed]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col antialiased">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* BREADCRUMB */}
        <div className="flex items-center justify-between border-b border-ods-border pb-6 mb-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-ods-textMuted hover:text-black uppercase tracking-wider mb-2 transition-colors">
              <ArrowLeft className="h-4 w-4 text-ods-primary" /> Trang Chủ Cửa Hàng
            </Link>
            <h1 className="font-heading text-3xl font-extrabold uppercase tracking-wider text-black flex items-center gap-2">
              {activeFilter === 'recently_viewed' && (
                <>
                  <Clock className="h-7 w-7 text-ods-primary" />
                  <span>SẢN PHẨM BẠN VỪA XEM GẦN ĐÂY</span>
                </>
              )}
              {activeFilter === 'best_sellers' && (
                <>
                  <Flame className="h-7 w-7 text-amber-500 fill-amber-500" />
                  <span>DANH SÁCH SẢN PHẨM MUA NHIỀU (HOT BEST SELLERS)</span>
                </>
              )}
              {activeFilter === 'discounts' && (
                <>
                  <Tag className="h-7 w-7 text-red-500" />
                  <span>SẢN PHẨM ĐANG KHUYẾN MÃI SÂU</span>
                </>
              )}
              {activeFilter === 'ALL' && (
                <>
                  <Grid className="h-7 w-7 text-black" />
                  <span>TOÀN BỘ KHO SẢN PHẨM BẢN QUYỀN</span>
                </>
              )}
            </h1>
            <p className="text-xs text-ods-textMuted font-light mt-1">
              Hiển thị danh sách sản phẩm theo bộ lọc lựa chọn chính xác nhất.
            </p>
          </div>

          <span className="text-xs font-extrabold text-ods-primary bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full">
            {filteredProducts.length} Sản phẩm
          </span>
        </div>

        {/* SEARCH & CONTROLS STRIP */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-ods-surface border border-ods-border p-4 rounded-ods">
          {/* FILTER TABS */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-4 py-2 rounded-ods text-xs font-bold uppercase transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-ods-border hover:border-black'
              }`}
            >
              TẤT CẢ SẢN PHẨM
            </button>

            <button
              onClick={() => setActiveFilter('recently_viewed')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-ods text-xs font-bold uppercase transition-all ${
                activeFilter === 'recently_viewed'
                  ? 'bg-ods-primary text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-ods-border hover:border-ods-primary'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>VỪA XEM ({validRecentlyViewed.length})</span>
            </button>

            <button
              onClick={() => setActiveFilter('best_sellers')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-ods text-xs font-bold uppercase transition-all ${
                activeFilter === 'best_sellers'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'bg-white text-gray-700 border border-ods-border hover:border-amber-500'
              }`}
            >
              <Flame className="h-3.5 w-3.5 fill-black" />
              <span>MUA NHIỀU</span>
            </button>

            <button
              onClick={() => setActiveFilter('discounts')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-ods text-xs font-bold uppercase transition-all ${
                activeFilter === 'discounts'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-ods-border hover:border-red-600'
              }`}
            >
              <Tag className="h-3.5 w-3.5" />
              <span>KHUYẾN MÃI</span>
            </button>
          </div>

          {/* SEARCH INPUT & SORT */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-ods-textMuted" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-ods border border-ods-border bg-white py-2 pl-9 pr-3 text-xs font-semibold text-black placeholder-zinc-400 focus:border-ods-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <SlidersHorizontal className="h-4 w-4 text-ods-textMuted" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-ods border border-ods-border bg-white py-2 px-3 text-xs font-semibold text-black focus:border-ods-primary focus:outline-none"
              >
                <option value="FEATURED">Nổi Bật Nhất</option>
                <option value="PRICE_ASC">Giá Thấp ➔ Cao</option>
                <option value="PRICE_DESC">Giá Cao ➔ Thấp</option>
              </select>
            </div>
          </div>
        </div>

        {/* PRODUCTS GRID */}
        {isLoading ? (
          <div className="py-24 text-center text-xs font-semibold text-ods-textMuted">
            Đang tải kho sản phẩm...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-24 text-center space-y-3 rounded-ods border border-ods-border bg-ods-surface p-8">
            <p className="text-sm font-bold text-black">Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.</p>
            <p className="text-xs text-ods-textMuted">Hãy thử chọn danh mục khác hoặc đặt lại tìm kiếm.</p>
            <button
              onClick={() => { setActiveFilter('ALL'); setSelectedPlatform('ALL'); setSearchQuery(''); }}
              className="text-xs font-bold text-ods-primary uppercase hover:underline pt-2 block mx-auto"
            >
              + Đặt lại tất cả bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <CartProvider>
      <Suspense fallback={<div className="py-20 text-center text-xs">Loading products catalog...</div>}>
        <ProductsCatalogContent />
      </Suspense>
    </CartProvider>
  );
}
