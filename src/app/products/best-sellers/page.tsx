'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { ProductCard, ProductProps } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { Search, SlidersHorizontal, Flame, ArrowLeft } from 'lucide-react';

export default function BestSellersPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('FEATURED');

  const [liveProducts, setLiveProducts] = useState<ProductProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
  }, []);

  // Filter best sellers products
  const bestSellersProducts = useMemo(() => {
    let list = liveProducts.filter((p) => 
      p.isFeaturedDeal || (p.tags && p.tags.some((t: string) => t.toLowerCase().includes('hot') || t.toLowerCase().includes('bán chạy')))
    );

    // If no specific tagged products, fallback to top products
    if (list.length === 0) {
      list = liveProducts.slice(0, 12);
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
  }, [liveProducts, selectedPlatform, searchQuery, sortBy]);

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
                <Flame className="h-7 w-7 text-amber-500 fill-amber-500" />
                <span>SẢN PHẨM MUA NHIỀU (HOT BEST SELLERS)</span>
              </h1>
              <p className="text-xs text-ods-textMuted font-light mt-1">
                Top các tựa game và gói tài khoản bán chạy nhất được đông đảo khách hàng tin tưởng lựa chọn tại ODS Store.
              </p>
            </div>

            <span className="text-xs font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full shrink-0">
              {bestSellersProducts.length} Sản Phẩm Hot
            </span>
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
                  placeholder="Tìm kiếm sản phẩm bán chạy..."
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
            <div className="py-20 text-center text-xs font-semibold text-ods-textMuted">
              Đang tải danh sách sản phẩm bán chạy...
            </div>
          ) : bestSellersProducts.length === 0 ? (
            <div className="py-20 text-center space-y-3 rounded-ods border border-ods-border bg-ods-surface p-8">
              <p className="text-sm font-bold text-black">Chưa có sản phẩm nào thuộc danh mục Mua Nhiều.</p>
              <Link
                href="/products"
                className="inline-block rounded-ods bg-ods-primary hover:bg-ods-primaryHover text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all mt-2"
              >
                Khám Phá Tất Cả Sản Phẩm
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {bestSellersProducts.map((product) => (
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
