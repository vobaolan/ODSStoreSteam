'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Trash2, Plus, Minus, Tag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const {
    cartItems,
    isCartOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
    coupon,
    applyCoupon,
    removeCoupon,
    getDiscountAmount,
    getNetAmount,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN') + ' đ';
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess(false);

    if (!couponCode.trim()) return;

    const success = await applyCoupon(couponCode);
    if (success) {
      setCouponSuccess(true);
      setCouponCode('');
    } else {
      setCouponError('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* DRAWER CONTAINER */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 top-0 bottom-0 z-50 flex h-full w-full max-w-md flex-col border-l border-ods-border bg-white p-6 text-black shadow-2xl"
          >
            {/* DRAWER HEADER */}
            <div className="flex items-center justify-between border-b border-ods-border pb-4">
              <div className="flex items-center space-x-2">
                <span className="font-heading text-base font-bold tracking-wider uppercase text-black">Giỏ hàng ODS</span>
                <span className="rounded-full bg-black px-2.5 py-0.5 text-xs font-extrabold text-white">
                  {cartItems.length}
                </span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="rounded-ods border border-ods-border p-1.5 text-ods-textMuted hover:text-black hover:border-black transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* CART ITEMS LIST */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center space-y-4 text-center">
                  <span className="text-ods-textMuted text-xs font-light">Giỏ hàng đang trống. Hãy chọn thêm sản phẩm game.</span>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="rounded-ods border border-ods-primary bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-ods-primary hover:bg-ods-primary hover:text-white transition-all"
                  >
                    Tiếp Tục Mua Sắm
                  </button>
                </div>
              ) : (
                cartItems.map((item) => {
                  const activePrice = item.discountPrice ?? item.price;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-ods border border-ods-border bg-ods-surface p-3 relative group transition-colors hover:bg-gray-100"
                    >
                      {/* Product Thumbnail */}
                      <img
                        src={item.coverImage}
                        alt={item.name}
                        className="h-16 w-24 rounded-ods object-cover bg-black border border-ods-border"
                      />

                      {/* Product details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading text-xs font-bold uppercase tracking-wide text-black truncate">
                          {item.name}
                        </h4>
                        <p className="text-[9px] text-ods-primary font-bold tracking-widest uppercase mt-0.5">{item.platform}</p>

                        <div className="mt-2 flex items-center justify-between">
                          {/* Price */}
                          <span className="text-xs font-extrabold text-black">
                            {formatCurrency(activePrice * item.quantity)}
                          </span>

                          {/* Quantity control */}
                          <div className="flex items-center rounded-ods border border-ods-border bg-white overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-ods-surface text-gray-400 hover:text-black transition-all"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-black">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-ods-surface text-gray-400 hover:text-black transition-all"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="absolute top-2.5 right-2.5 p-1 text-zinc-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                        title="Xóa game khỏi giỏ"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* BILLING SUMMARY */}
            {cartItems.length > 0 && (
              <div className="border-t border-ods-border pt-4 space-y-4">
                {/* Coupon Input Form */}
                {!coupon ? (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-2.5 h-4 w-4 text-ods-textMuted" />
                      <input
                        type="text"
                        placeholder="MÃ GIẢM GIÁ (ODSSTORE, ODS100K)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full rounded-ods border border-ods-border bg-white py-2 pl-9 pr-4 text-xs font-bold text-black placeholder-zinc-400 focus:border-ods-primary focus:ring-1 focus:ring-ods-primary focus:outline-none transition-all uppercase"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-ods border border-ods-primary bg-ods-primary px-4 text-xs font-bold text-white hover:bg-ods-primaryHover transition-all hover:shadow-buttonGlow"
                    >
                      ÁP DỤNG
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between rounded-ods border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-800">
                    <div className="flex items-center space-x-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-700" />
                      <span>Đã áp dụng mã: <strong>{coupon.code}</strong> (-{coupon.discountType === 'PERCENT' ? `${coupon.discountValue}%` : formatCurrency(coupon.discountValue)})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-[10px] uppercase font-extrabold text-red-600 hover:underline"
                    >
                      Hủy bỏ
                    </button>
                  </div>
                )}
                
                {couponError && (
                  <p className="text-[11px] text-red-500 font-bold">{couponError}</p>
                )}

                {couponSuccess && (
                  <p className="text-[11px] text-emerald-600 font-bold">Áp dụng mã giảm giá thành công!</p>
                )}

                {/* Bill Breakdown */}
                <div className="space-y-2 text-xs text-ods-textMuted border-b border-ods-border pb-3.5">
                  <div className="flex justify-between">
                    <span>Tổng phụ sản phẩm</span>
                    <span className="font-semibold text-black">{formatCurrency(cartTotal)}</span>
                  </div>
                  {coupon && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Giảm giá từ mã</span>
                      <span className="font-semibold text-emerald-600">-{formatCurrency(getDiscountAmount())}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-black pt-2 border-t border-gray-150">
                    <span>Tổng thanh toán</span>
                    <span className="text-black font-extrabold tracking-wide text-base">{formatCurrency(getNetAmount())}</span>
                  </div>
                </div>

                {/* Checkout Trigger Button (NZXT sky blue style) */}
                <button
                  onClick={() => {
                    setCartOpen(false);
                    router.push('/checkout');
                  }}
                  className="w-full rounded-ods bg-ods-primary py-3.5 text-center text-xs font-bold uppercase tracking-wider text-white hover:bg-ods-primaryHover transition-all hover:shadow-buttonGlow active:scale-95 cursor-pointer"
                >
                  Tiến Hành Thanh Toán
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
