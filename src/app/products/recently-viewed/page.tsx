'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { ProductCard, ProductProps } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { Search, SlidersHorizontal, Clock, ArrowLeft, Trash2 } from 'lucide-react';

export default function RecentlyViewedPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('FEATURED');

  const [liveProducts, setLiveProducts] = useState<ProductProps[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load products from database & localStorage
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

    try {
      const stored = localStorage.getItem('ods_recently_viewed');
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch (e) {
      setRecentlyViewed([]);
    }
  }, []);

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

  // Filter products based on controls
  const filteredProducts = useMemo(() => {
    let list = validRecentlyViewed;

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
  }, [validRecentlyViewed, selectedPlatform, searchQuery, sortBy]);

  const handleClearHistory = () => {
    localStorage.removeItem('ods_recently_viewed');
    setRecentlyViewed([]);
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-white text-black flex flex-col antialiased">
        <Header />

        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {/* BREADCRUMB HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-ods-border pb-6 mb-8 gap-4">
            <div>
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-ods-textMuted hover:text-black uppercase tracking-wider mb-2 transition-colors">
                <ArrowLeft className="h-4 w-4 text-ods-primary" /> Trang Chủ Cửa Hàng
              </Link>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-black flex items-center gap-2.5">
                <Clock className="h-7 w-7 text-ods-primary" />
                <span>SẢN PHẨM BẠN VỪA XEM GẦN ĐÂY</span>
              </h1>
              <p className="text-xs text-ods-textMuted font-light mt-1">
                Lịch sử lưu trữ các sản phẩm game & tài khoản dịch vụ bạn đã xem chi tiết trên ODS Store.
              </p>
            </div>

            {validRecentlyViewed.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-ods border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white text-xs font-bold uppercase transition-all shrink-0 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Xóa Lịch Sử Đã Xem</span>
              </button>
            )}
          </div>

          {/* CONTROLS STRIP */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-ods-surface border border-ods-border p-4 rounded-ods">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedPlatform('ALL')}
                className={`px-4 py-2 rounded-ods text-xs font-bold uppercase transition-all ${
                  selectedPlatform === 'ALL'
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-ods-border hover:border-black'
                }`}
              >
                TẤT CẢ NỀN TẢNG
              </button>
              <button
                onClick={() => setSelectedPlatform('STEAM')}
                className={`px-4 py-2 rounded-ods text-xs font-bold uppercase transition-all ${
                  selectedPlatform === 'STEAM'
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-ods-border hover:border-black'
                }`}
              >
                STEAM
              </button>
              <button
                onClick={() => setSelectedPlatform('SERVICE')}
                className={`px-4 py-2 rounded-ods text-xs font-bold uppercase transition-all ${
                  selectedPlatform === 'SERVICE'
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-ods-border hover:border-black'
                }`}
              >
                DỊCH VỤ / TÀI KHOẢN
              </button>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-ods-textMuted" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm đã xem..."
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
                  <option value="FEATURED">Mới Nhất</option>
                  <option value="PRICE_ASC">Giá Thấp ➔ Cao</option>
                  <option value="PRICE_DESC">Giá Cao ➔ Thấp</option>
                </select>
              </div>
            </div>
          </div>

          {/* PRODUCTS GRID */}
          {isLoading ? (
            <div className="py-20 text-center text-xs font-semibold text-ods-textMuted">
              Đang tải lịch sử xem...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center space-y-3 rounded-ods border border-ods-border bg-ods-surface p-8">
              <Clock className="h-10 w-10 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-black">Bạn chưa mở xem chi tiết sản phẩm nào gần đây.</p>
              <p className="text-xs text-ods-textMuted">Truy cập cửa hàng để khám phá các tựa game và dịch vụ mới nhất!</p>
              <Link
                href="/products"
                className="inline-block rounded-ods bg-ods-primary hover:bg-ods-primaryHover text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all mt-2"
              >
                Khám Phá Cửa Hàng Ngay
              </Link>
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
    </CartProvider>
  );
}
