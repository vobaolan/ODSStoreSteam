'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { CartProvider } from '@/context/CartContext';
import { useToast } from '@/components/Toast';
import { 
  Package, Plus, Gamepad2, UserCheck, Trash2, Edit, Eye, 
  DollarSign, Percent, Video, Image as ImageIcon, CheckCircle2, XCircle,
  Search, ShieldAlert, Sparkles, Layers, Film, Monitor, Tag, Zap, Flame, Clock, Award,
  Copy, Check, Shuffle, Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  discountPrice: number | string | null;
  coverImage: string;
  screenshots?: string[];
  category: string[];
  platform: string;
  type: string;
  deliveryMethod?: string;
  mediaOrder?: string;
  tags: string[];
  status: boolean;
  isFlashDeal?: boolean;
  flashSaleEnd?: string | null;
  isFeaturedDeal?: boolean;
  trailerUrl?: string;
  minimumReq?: any;
  recommendedReq?: any;
  variants?: Array<{ id: string; name: string; price: number; discountPrice?: number | null }>;
  _count?: { keys: number };
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { showToast, confirmAction } = useToast();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Strict Admin Auth Guard Check
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ods_user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user && (user.role === 'ADMIN' || user.email === 'admin@odsstore.vn')) {
          setIsAuthorized(true);
          setIsCheckingAuth(false);
          return;
        }
      }
    } catch (e) {}

    setIsAuthorized(false);
    setIsCheckingAuth(false);
    showToast('⚠️ Vui lòng đăng nhập bằng tài khoản Admin để truy cập!', 'error');
    router.push('/profile');
  }, [router, showToast]);

  const [activeTab, setActiveTab] = useState<'game' | 'account' | 'coupon'>('game');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states for creating/editing products
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<string[]>(['Action']);
  const [formPrice, setFormPrice] = useState('');
  const [formDiscountPercent, setFormDiscountPercent] = useState('0');
  const [formPlatform, setFormPlatform] = useState('STEAM');
  const [formDeliveryMethod, setFormDeliveryMethod] = useState('AUTO_KEY');
  const [formMediaOrder, setFormMediaOrder] = useState('image_first');
  const [formStatus, setFormStatus] = useState(true);
  const [formInStock, setFormInStock] = useState(true);
  const [formIsFlashDeal, setFormIsFlashDeal] = useState(false);
  const [formFlashSaleEnd, setFormFlashSaleEnd] = useState('');
  const [formIsFeaturedDeal, setFormIsFeaturedDeal] = useState(false);
  const [formTags, setFormTags] = useState<string[]>(['Mới ra mắt']);
  
  // Multiline Image URLs & Video URLs
  const [formImageUrlsText, setFormImageUrlsText] = useState('');
  const [formVideoUrlsText, setFormVideoUrlsText] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // System Requirements States (Only for Game Products)
  const [minOs, setMinOs] = useState('Windows 10 64-bit');
  const [minCpu, setMinCpu] = useState('Intel Core i7-6700 or AMD Ryzen 5 1600');
  const [minRam, setMinRam] = useState('12 GB RAM');
  const [minGpu, setMinGpu] = useState('GeForce GTX 1060 6GB or Radeon RX 580 8GB');
  const [minStorage, setMinStorage] = useState('70 GB SSD available space');

  const [recOs, setRecOs] = useState('Windows 10 64-bit');
  const [recCpu, setRecCpu] = useState('Intel Core i7-12700 or AMD Ryzen 7 7800X3D');
  const [recRam, setRecRam] = useState('16 GB RAM');
  const [recGpu, setRecGpu] = useState('GeForce RTX 2060 SUPER or Radeon RX 5700 XT');
  const [recStorage, setRecStorage] = useState('70 GB SSD available space');

  // Product Variants / Duration Options State
  const [formVariants, setFormVariants] = useState<Array<{ id: string; name: string; price: string; discountPrice: string }>>([
    { id: 'v-1', name: '1 Tháng', price: '120,000', discountPrice: '41,000' },
    { id: 'v-2', name: '3 Tháng', price: '330,000', discountPrice: '111,000' },
    { id: 'v-3', name: '6 Tháng', price: '600,000', discountPrice: '210,000' },
    { id: 'v-4', name: '12 Tháng', price: '1,190,000', discountPrice: '500,000' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // COUPONS MANAGEMENT SYSTEM STATES
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponCreationMode, setCouponCreationMode] = useState<'fixed' | 'random'>('fixed');
  
  // Form states for Fixed Coupon
  const [formCouponCode, setFormCouponCode] = useState('');
  const [formCouponType, setFormCouponType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [formCouponValue, setFormCouponValue] = useState('20');
  const [formCouponLimit, setFormCouponLimit] = useState('100');

  // Form states for Random Coupon Batch
  const [randomPrefix, setRandomPrefix] = useState('ODS-');
  const [randomMinVal, setRandomMinVal] = useState('10000');
  const [randomMaxVal, setRandomMaxVal] = useState('50000');
  const [randomCount, setRandomCount] = useState('5');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Edit Coupon Modal States
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [showEditCouponModal, setShowEditCouponModal] = useState(false);

  const [editCouponCode, setEditCouponCode] = useState('');
  const [editCouponType, setEditCouponType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [editCouponValue, setEditCouponValue] = useState('20');
  const [editCouponLimit, setEditCouponLimit] = useState('100');
  const [editCouponStatus, setEditCouponStatus] = useState('ACTIVE');

  // Load coupons from localStorage on mount
  useEffect(() => {
    const defaultCoupons = [
      { id: 'cp-1', code: 'ODSSTORE', discountType: 'PERCENT', discountValue: 20, usageLimit: 999, usedCount: 12, status: 'ACTIVE' },
      { id: 'cp-2', code: 'ODS100K', discountType: 'FIXED', discountValue: 100000, usageLimit: 500, usedCount: 8, status: 'ACTIVE' },
    ];

    try {
      const stored = localStorage.getItem('ods_admin_coupons');
      if (stored) {
        setCoupons(JSON.parse(stored));
      } else {
        setCoupons(defaultCoupons);
        localStorage.setItem('ods_admin_coupons', JSON.stringify(defaultCoupons));
      }
    } catch (e) {
      setCoupons(defaultCoupons);
    }
  }, []);

  const saveCoupons = (newList: any[]) => {
    setCoupons(newList);
    localStorage.setItem('ods_admin_coupons', JSON.stringify(newList));
  };

  // Available Tag Options
  const TAG_OPTIONS = [
    { id: 'Mới ra mắt', label: '✨ Mới ra mắt' },
    { id: 'Đang giảm giá', label: '🏷️ Đang giảm giá' },
    { id: 'Hot', label: '🔥 Hot / Bán chạy' },
    { id: 'Giảm giá sâu', label: '⚡ Giảm giá sâu' },
  ];

  const parseUrls = (text: string) => {
    return text
      .split(/[\n,]+/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);
  };

  const formatNumberWithCommas = (val: string | number) => {
    if (val === undefined || val === null || val === '') return '';
    const numStr = val.toString().replace(/,/g, '').replace(/\D/g, '');
    if (!numStr) return '';
    return parseInt(numStr, 10).toLocaleString('en-US');
  };

  const parseRawNumber = (val: string) => {
    return val.replace(/,/g, '').replace(/\D/g, '');
  };

  const parsedImageUrls = parseUrls(formImageUrlsText);
  const parsedVideoUrls = parseUrls(formVideoUrlsText);

  const INITIAL_SEED_PRODUCTS: any[] = [];

  const fetchProducts = async () => {
    setIsLoading(true);
    let localProds: any[] = [];

    try {
      const stored = localStorage.getItem('ods_admin_products');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localProds = parsed;
        }
      }
    } catch (e) {}

    if (localProds.length === 0) {
      localProds = INITIAL_SEED_PRODUCTS;
    }

    try {
      const res = await fetch(`/api/admin/products?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.products) {
        const dbProds = (data.products || []);
        let combined: any[] = [...localProds];
        dbProds.forEach((dbp: any) => {
          if (!combined.some((lp: any) => lp.id === dbp.id || lp.slug === dbp.slug)) {
            combined.push(dbp);
          }
        });

        const finalProducts = combined;
        setProducts(finalProducts);
        localStorage.setItem('ods_admin_products', JSON.stringify(finalProducts));
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.error('Error loading admin products:', err);
    }

    const finalLocal = localProds;
    setProducts(finalLocal);
    localStorage.setItem('ods_admin_products', JSON.stringify(finalLocal));
    setIsLoading(false);
  };

  useEffect(() => {
    localStorage.removeItem('ods_deleted_product_ids');
    fetchProducts();
  }, []);

  const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0 đ';
    return num.toLocaleString('vi-VN') + ' đ';
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory(['Action']);
    setFormPrice('');
    setFormDiscountPercent('0');
    setFormPlatform('STEAM');
    setFormDeliveryMethod('AUTO_KEY');
    setFormMediaOrder('image_first');
    setFormStatus(true);
    setFormInStock(true);
    setFormIsFlashDeal(false);
    setFormFlashSaleEnd('');
    setFormIsFeaturedDeal(false);
    setFormTags(['Mới ra mắt']);
    setFormImageUrlsText('');
    setFormVideoUrlsText('');
    setFormDescription('');
    setFormVariants([
      { id: 'v-1', name: '1 Tháng', price: '120,000', discountPrice: '41,000' },
      { id: 'v-2', name: '3 Tháng', price: '330,000', discountPrice: '111,000' },
      { id: 'v-3', name: '6 Tháng', price: '600,000', discountPrice: '210,000' },
      { id: 'v-4', name: '12 Tháng', price: '1,190,000', discountPrice: '500,000' },
    ]);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    if (activeTab === 'account') {
      setFormPlatform('SERVICE');
      setFormDeliveryMethod('UPGRADE_ACC');
      setFormCategory(['Premium']);
    }
    setShowAddModal(true);
  };

  const handleEditProduct = (product: ProductItem) => {
    setEditingItem(product);
    setFormName(product.name);
    setFormCategory(Array.isArray(product.category) ? product.category : (product.category ? [product.category as string] : ['Action']));
    setFormPrice(product.price.toString());

    if (product.discountPrice && parseFloat(product.price.toString()) > 0) {
      const p = parseFloat(product.price.toString());
      const dp = parseFloat(product.discountPrice.toString());
      const pct = Math.round(((p - dp) / p) * 100);
      setFormDiscountPercent(pct.toString());
    } else {
      setFormDiscountPercent('0');
    }

    setFormPlatform(product.platform || 'STEAM');
    setFormDeliveryMethod(product.deliveryMethod || 'AUTO_KEY');
    setFormMediaOrder(product.mediaOrder || 'image_first');
    setFormStatus(product.status !== false);
    setFormInStock(product.status !== false);
    setFormIsFlashDeal(product.isFlashDeal || false);
    setFormFlashSaleEnd(product.flashSaleEnd ? product.flashSaleEnd.slice(0, 16) : '');
    setFormIsFeaturedDeal(product.isFeaturedDeal || false);
    setFormTags(product.tags || ['Mới ra mắt']);

    const imgs = Array.isArray(product.screenshots) ? product.screenshots : (product.coverImage ? [product.coverImage] : []);
    setFormImageUrlsText(imgs.join('\n'));
    setFormVideoUrlsText(product.trailerUrl || '');
    setFormDescription((product as any).description || '');

    const minReq = (product as any).minimumReq || {};
    const recReq = (product as any).recommendedReq || {};
    setMinOs(minReq.os || 'Windows 10 64-bit');
    setMinCpu(minReq.cpu || 'Intel Core i7-6700 or AMD Ryzen 5 1600');
    setMinRam(minReq.ram || '12 GB RAM');
    setMinGpu(minReq.gpu || 'GeForce GTX 1060 6GB or Radeon RX 580 8GB');
    setMinStorage(minReq.storage || '70 GB SSD available space');

    setRecOs(recReq.os || 'Windows 10 64-bit');
    setRecCpu(recReq.cpu || 'Intel Core i7-12700 or AMD Ryzen 7 7800X3D');
    setRecRam(recReq.ram || '16 GB RAM');
    setRecGpu(recReq.gpu || 'GeForce RTX 2060 SUPER or Radeon RX 5700 XT');
    setRecStorage(recReq.storage || '70 GB SSD available space');

    if (Array.isArray((product as any).variants)) {
      setFormVariants(
        (product as any).variants.map((v: any, idx: number) => ({
          id: v.id || `v-${idx + 1}`,
          name: v.name,
          price: formatNumberWithCommas(v.price),
          discountPrice: v.discountPrice !== undefined && v.discountPrice !== null ? formatNumberWithCommas((parseFloat(v.price) - parseFloat(v.discountPrice)).toString()) : '',
        }))
      );
    } else {
      setFormVariants([
        { id: 'v-1', name: '1 Tháng', price: '120,000', discountPrice: '41,000' },
        { id: 'v-2', name: '3 Tháng', price: '330,000', discountPrice: '111,000' },
        { id: 'v-3', name: '6 Tháng', price: '600,000', discountPrice: '210,000' },
        { id: 'v-4', name: '12 Tháng', price: '1,190,000', discountPrice: '500,000' },
      ]);
    }

    setShowAddModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUsingVariants = activeTab === 'account' && formVariants.length > 0;

    if (!formName.trim()) {
      showToast('Vui lòng điền Tên sản phẩm!', 'error');
      return;
    }

    if (!isUsingVariants && !formPrice) {
      showToast('Vui lòng điền Giá niêm yết (Gốc)!', 'error');
      return;
    }

    setIsSubmitting(true);

    let priceNum = parseFloat(formPrice) || 0;
    const discountPct = parseFloat(formDiscountPercent) || 0;
    let discountPriceNum = discountPct > 0 ? Math.round(priceNum * (1 - discountPct / 100)) : null;

    if (isUsingVariants) {
      const firstV = formVariants[0];
      const pOrig = parseFloat(parseRawNumber(firstV.price)) || 0;
      const pReduce = firstV.discountPrice && parseRawNumber(firstV.discountPrice).length > 0
        ? parseFloat(parseRawNumber(firstV.discountPrice))
        : 0;

      priceNum = pOrig;
      discountPriceNum = pReduce > 0 && pReduce < pOrig ? pOrig - pReduce : null;
    }

    const parsedImgs = parseUrls(formImageUrlsText);
    const parsedVids = parseUrls(formVideoUrlsText);

    const coverImg = parsedImgs.length > 0 ? parsedImgs[0] : 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop';

    const payload = {
      id: editingItem ? editingItem.id : undefined,
      name: formName,
      price: priceNum,
      discountPrice: discountPriceNum,
      category: formCategory,
      platform: formPlatform,
      type: activeTab === 'account' ? 'ACCOUNT' : (formDeliveryMethod === 'GIFT_ACC' || formDeliveryMethod === 'GIFT' || formDeliveryMethod === 'STEAM_GIFT' ? 'STEAM_GIFT' : 'KEY_CODE'),
      deliveryMethod: formDeliveryMethod,
      mediaOrder: formMediaOrder,
      coverImage: coverImg,
      screenshots: parsedImgs,
      trailerUrl: parsedVids.join(' | '),
      trailerUrls: parsedVids,
      description: formDescription,
      status: formStatus && formInStock,
      isFlashDeal: formIsFlashDeal,
      flashSaleEnd: (formIsFeaturedDeal || formIsFlashDeal) && formFlashSaleEnd ? new Date(formFlashSaleEnd).toISOString() : null,
      isFeaturedDeal: formIsFeaturedDeal,
      tags: formTags,
      minimumReq: activeTab === 'game' ? { os: minOs, cpu: minCpu, ram: minRam, gpu: minGpu, storage: minStorage } : null,
      recommendedReq: activeTab === 'game' ? { os: recOs, cpu: recCpu, ram: recRam, gpu: recGpu, storage: recStorage } : null,
      variants: activeTab === 'account' 
        ? formVariants
            .filter((v) => v.name.trim().length > 0)
            .map((v) => ({
              id: v.id,
              name: v.name.trim(),
              price: parseFloat(parseRawNumber(v.price)) || 0,
              discountPrice: (v.discountPrice && parseFloat(parseRawNumber(v.discountPrice)) > 0) ? (parseFloat(parseRawNumber(v.price)) || 0) - parseFloat(parseRawNumber(v.discountPrice)) : null,
            }))
        : null,
    };

    // Save to local storage cache immediately so added images & details are never lost
    try {
      const stored = localStorage.getItem('ods_admin_products');
      let currentList: any[] = stored ? JSON.parse(stored) : [];
      const prodSlug = formName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const localObj = {
        ...payload,
        id: editingItem ? editingItem.id : `prod-custom-${Date.now()}`,
        slug: editingItem ? editingItem.slug : prodSlug,
      };

      if (editingItem) {
        currentList = currentList.map((p) => (p.id === editingItem.id ? localObj : p));
      } else {
        currentList = [localObj, ...currentList];
      }
      localStorage.setItem('ods_admin_products', JSON.stringify(currentList));
      setProducts(currentList);
    } catch (e) {}

    try {
      const url = '/api/admin/products';
      const method = editingItem ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('API sync warning:', err);
    }

    showToast(editingItem ? 'Cập nhật sản phẩm thành công!' : 'Tạo sản phẩm mới thành công!', 'success');
    setShowAddModal(false);
    resetForm();
    setIsSubmitting(false);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    confirmAction({
      title: 'XÓA SẢN PHẨM',
      message: `Bạn có chắc chắn muốn xóa sản phẩm "${name}" khỏi cửa hàng?`,
      confirmText: 'Đồng Ý',
      cancelText: 'Hủy',
      onConfirm: async () => {
        // 1. Immediately update products state
        const updatedProducts = products.filter(
          (p) => p.id !== id
        );
        setProducts(updatedProducts);

        // 2. Save updated products list to localStorage
        localStorage.setItem('ods_admin_products', JSON.stringify(updatedProducts));

        showToast('Đã xóa sản phẩm thành công!', 'success');

        // 4. Send background API DELETE request
        try {
          await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
        } catch (err) {
          console.warn('Background delete API sync warning:', err);
        }
      },
    });
  };

  // COUPON CREATION & EDITING HANDLERS
  const handleCreateFixedCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCouponCode.trim()) {
      showToast('Vui lòng nhập mã giảm giá!', 'error');
      return;
    }
    const cleanCode = formCouponCode.trim().toUpperCase();
    if (coupons.some((c) => c.code.toUpperCase() === cleanCode)) {
      showToast('Mã giảm giá này đã tồn tại trong hệ thống!', 'error');
      return;
    }

    const newCp = {
      id: `cp-${Date.now()}`,
      code: cleanCode,
      discountType: formCouponType,
      discountValue: parseFloat(formCouponValue) || 0,
      usageLimit: parseInt(formCouponLimit) || 100,
      usedCount: 0,
      status: 'ACTIVE',
    };

    const updated = [newCp, ...coupons];
    saveCoupons(updated);
    showToast(`Đã tạo mã giảm giá ${cleanCode} thành công!`, 'success');
    setFormCouponCode('');
  };

  const handleGenerateRandomCoupons = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(randomCount) || 5;
    const minV = parseFloat(randomMinVal) || 10000;
    const maxV = parseFloat(randomMaxVal) || 50000;
    const prefix = randomPrefix.trim().toUpperCase() || 'ODS-';

    const newBatch: any[] = [];
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    for (let i = 0; i < count; i++) {
      let randStr = '';
      for (let j = 0; j < 4; j++) {
        randStr += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const fullCode = `${prefix}${randStr}`;

      const randVal = formCouponType === 'PERCENT'
        ? Math.floor(Math.random() * (maxV - minV + 1)) + minV
        : Math.floor(Math.random() * ((maxV - minV) / 1000 + 1)) * 1000 + minV;

      newBatch.push({
        id: `cp-rand-${Date.now()}-${i}`,
        code: fullCode,
        discountType: formCouponType,
        discountValue: randVal,
        usageLimit: 50,
        usedCount: 0,
        status: 'ACTIVE',
        isRandom: true,
      });
    }

    const updated = [...newBatch, ...coupons];
    saveCoupons(updated);
    showToast(`Đã tạo ngẫu nhiên ${count} mã giảm giá mới!`, 'success');
  };

  const handleOpenEditCouponModal = (cp: any) => {
    setEditingCoupon(cp);
    setEditCouponCode(cp.code);
    setEditCouponType(cp.discountType);
    setEditCouponValue(cp.discountValue.toString());
    setEditCouponLimit((cp.usageLimit || 100).toString());
    setEditCouponStatus(cp.status || 'ACTIVE');
    setShowEditCouponModal(true);
  };

  const handleSaveEditCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;
    if (!editCouponCode.trim()) {
      showToast('Vui lòng nhập mã giảm giá!', 'error');
      return;
    }

    const cleanCode = editCouponCode.trim().toUpperCase();
    if (coupons.some((c) => c.id !== editingCoupon.id && c.code.toUpperCase() === cleanCode)) {
      showToast('Mã giảm giá này đã tồn tại!', 'error');
      return;
    }

    const updated = coupons.map((c) => {
      if (c.id === editingCoupon.id) {
        return {
          ...c,
          code: cleanCode,
          discountType: editCouponType,
          discountValue: parseFloat(editCouponValue) || 0,
          usageLimit: parseInt(editCouponLimit) || 100,
          status: editCouponStatus,
        };
      }
      return c;
    });

    saveCoupons(updated);
    showToast(`Đã cập nhật mã giảm giá ${cleanCode} thành công!`, 'success');
    setShowEditCouponModal(false);
    setEditingCoupon(null);
  };

  const handleDeleteCoupon = (id: string, code: string) => {
    confirmAction({
      title: 'XÓA MÃ GIẢM GIÁ',
      message: `Bạn có chắc chắn muốn xóa mã giảm giá "${code}"?`,
      confirmText: 'Xóa Mã',
      cancelText: 'Hủy Bỏ',
      onConfirm: () => {
        const updated = coupons.filter((c) => c.id !== id);
        saveCoupons(updated);
        showToast('Đã xóa mã giảm giá thành công!', 'success');
      },
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Đã sao chép mã ${code}!`, 'success');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredProducts = products.filter((p) => {
    const isGameTab = activeTab === 'game';
    const matchesTab = isGameTab ? p.type === 'KEY_CODE' || p.type === 'STEAM_GIFT' : p.type === 'ACCOUNT' || p.type === 'WALLET_CARD';
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-4 border-ods-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Đang xác thực quyền truy cập Admin...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto font-black text-xl">
            🚫
          </div>
          <h2 className="font-heading text-lg font-extrabold text-black uppercase">TRUY CẬP BỊ TỪ CHỐI</h2>
          <p className="text-xs text-gray-600 font-light leading-relaxed">
            Bạn chưa đăng nhập hoặc không có quyền Quản Trị Viên (Admin) để truy cập trang quản lý sản phẩm.
          </p>
          <button
            onClick={() => router.push('/profile')}
            className="w-full rounded-ods bg-black hover:bg-zinc-800 text-white py-3 text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            Đăng Nhập Tài Khoản Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-white text-black flex flex-col antialiased">
        <Header />

        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          {/* TOP ADMIN HEADER BAR */}
          <div className="border-b border-ods-border pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] text-ods-primary font-bold tracking-widest uppercase">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>ODS ADMIN PORTAL</span>
              </div>
              <h1 className="font-heading text-2xl font-extrabold tracking-wider uppercase mt-1">HỆ THỐNG QUẢN LÝ ODS STORE</h1>
              <p className="text-xs text-ods-textMuted mt-0.5">Tạo, cập nhật kho sản phẩm Game, Tài khoản dịch vụ và Quản lý Mã giảm giá.</p>
            </div>

            {activeTab !== 'coupon' && (
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 rounded-ods bg-ods-primary hover:bg-ods-primaryHover text-white px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:shadow-buttonGlow active:scale-95 shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Thêm Sản Phẩm Mới</span>
              </button>
            )}
          </div>

          {/* TAB CATEGORY SELECTOR */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex border-b border-ods-border space-x-6 overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => { setActiveTab('game'); setFormDeliveryMethod('AUTO_KEY'); }}
                className={`flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider pb-3 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'game'
                    ? 'border-ods-primary text-ods-primary'
                    : 'border-transparent text-ods-textMuted hover:text-black'
                }`}
              >
                <Gamepad2 className="h-4 w-4" />
                <span>1. Sản Phẩm Game (Key / Steam Gift)</span>
              </button>

              <button
                onClick={() => { setActiveTab('account'); setFormDeliveryMethod('UPGRADE_ACC'); }}
                className={`flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider pb-3 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'account'
                    ? 'border-ods-primary text-ods-primary'
                    : 'border-transparent text-ods-textMuted hover:text-black'
                }`}
              >
                <UserCheck className="h-4 w-4" />
                <span>2. Tài Khoản & Dịch Vụ</span>
              </button>

              <button
                onClick={() => setActiveTab('coupon')}
                className={`flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider pb-3 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'coupon'
                    ? 'border-ods-primary text-ods-primary'
                    : 'border-transparent text-ods-textMuted hover:text-black'
                }`}
              >
                <Ticket className="h-4 w-4 text-amber-500" />
                <span>3. Quản Lý Mã Giảm Giá ({coupons.length})</span>
              </button>
            </div>

            {/* Search Input for Product Tabs */}
            {activeTab !== 'coupon' && (
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-ods-textMuted" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-ods border border-ods-border bg-ods-surface py-2 pl-9 pr-4 text-xs font-semibold text-black placeholder-zinc-400 focus:border-ods-primary focus:outline-none focus:ring-1 focus:ring-ods-primary transition-all"
                />
              </div>
            )}
          </div>

          {/* TAB 3: COUPON MANAGEMENT SECTION */}
          {activeTab === 'coupon' ? (
            <div className="space-y-8">
              {/* COUPON CREATION FORMS BLOCK */}
              <div className="rounded-ods border border-ods-border bg-white p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-ods-border pb-4 gap-4">
                  <div>
                    <h2 className="font-heading text-base font-extrabold uppercase tracking-wider text-black flex items-center gap-2">
                      <Ticket className="h-5 w-5 text-ods-primary" />
                      <span>TẠO MÃ GIẢM GIÁ MỚI</span>
                    </h2>
                    <p className="text-xs text-ods-textMuted mt-0.5">Tạo mã giảm giá cố định (ODSSTORE, ODS100K) hoặc tạo hàng loạt mã ngẫu nhiên (Random).</p>
                  </div>

                  {/* MODE SELECTOR TOGGLE BUTTONS */}
                  <div className="flex items-center gap-2 bg-ods-surface p-1 rounded-ods border border-ods-border shrink-0">
                    <button
                      onClick={() => setCouponCreationMode('fixed')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-ods text-xs font-bold uppercase transition-all ${
                        couponCreationMode === 'fixed'
                          ? 'bg-black text-white shadow-sm'
                          : 'bg-transparent text-gray-600 hover:text-black'
                      }`}
                    >
                      <Tag className="h-3.5 w-3.5 text-sky-400" />
                      <span>Mã Cố Định</span>
                    </button>
                    <button
                      onClick={() => setCouponCreationMode('random')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-ods text-xs font-bold uppercase transition-all ${
                        couponCreationMode === 'random'
                          ? 'bg-black text-white shadow-sm'
                          : 'bg-transparent text-gray-600 hover:text-black'
                      }`}
                    >
                      <Shuffle className="h-3.5 w-3.5 text-amber-400" />
                      <span>Mã Random Ngẫu Nhiên</span>
                    </button>
                  </div>
                </div>

                {/* FORM 1: FIXED COUPON CREATION */}
                {couponCreationMode === 'fixed' ? (
                  <form onSubmit={handleCreateFixedCoupon} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-ods-surface p-4 rounded-ods border border-ods-border">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block">Nhập Mã Giảm Giá *</label>
                      <input
                        type="text"
                        required
                        placeholder="VD: ODSSTORE, ODS100K"
                        value={formCouponCode}
                        onChange={(e) => setFormCouponCode(e.target.value.toUpperCase())}
                        className="w-full rounded-ods border border-ods-border bg-white py-2 px-3 text-xs font-extrabold text-black focus:border-ods-primary focus:outline-none uppercase tracking-wider"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block">Loại Giảm Giá *</label>
                      <select
                        value={formCouponType}
                        onChange={(e) => setFormCouponType(e.target.value as any)}
                        className="w-full rounded-ods border border-ods-border bg-white py-2 px-3 text-xs font-bold text-black focus:border-ods-primary focus:outline-none"
                      >
                        <option value="PERCENT">Giảm Giá Phần Trăm (%)</option>
                        <option value="FIXED">Giảm Giá Tiền Trực Tiếp (VNĐ)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block">Giá Trị Giảm *</label>
                      <input
                        type="text"
                        required
                        placeholder={formCouponType === 'PERCENT' ? 'VD: 20 (%)' : 'VD: 100,000 (đ)'}
                        value={formCouponType === 'FIXED' ? formatNumberWithCommas(formCouponValue) : formCouponValue}
                        onChange={(e) => setFormCouponValue(formCouponType === 'FIXED' ? parseRawNumber(e.target.value) : e.target.value)}
                        className="w-full rounded-ods border border-ods-border bg-white py-2 px-3 text-xs font-bold text-black focus:border-ods-primary focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-ods bg-ods-primary hover:bg-ods-primaryHover text-white py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-buttonGlow active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Tạo Mã Cố Định</span>
                    </button>
                  </form>
                ) : (
                  /* FORM 2: RANDOM COUPON BATCH GENERATION */
                  <form onSubmit={handleGenerateRandomCoupons} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-ods-surface p-4 rounded-ods border border-ods-border">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block">Tiền Tố Mã (Prefix)</label>
                      <input
                        type="text"
                        placeholder="VD: ODS-"
                        value={randomPrefix}
                        onChange={(e) => setRandomPrefix(e.target.value.toUpperCase())}
                        className="w-full rounded-ods border border-ods-border bg-white py-2 px-3 text-xs font-extrabold text-black focus:border-ods-primary focus:outline-none uppercase"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block">Loại Giảm</label>
                      <select
                        value={formCouponType}
                        onChange={(e) => setFormCouponType(e.target.value as any)}
                        className="w-full rounded-ods border border-ods-border bg-white py-2 px-3 text-xs font-bold text-black focus:border-ods-primary focus:outline-none"
                      >
                        <option value="PERCENT">Phần Trăm (%)</option>
                        <option value="FIXED">Số Tiền (VNĐ)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block">Khoảng Giảm (Min ➔ Max)</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          placeholder="Min"
                          value={formCouponType === 'FIXED' ? formatNumberWithCommas(randomMinVal) : randomMinVal}
                          onChange={(e) => setRandomMinVal(formCouponType === 'FIXED' ? parseRawNumber(e.target.value) : e.target.value)}
                          className="w-1/2 rounded-ods border border-ods-border bg-white py-2 px-2 text-xs font-bold text-black focus:border-ods-primary focus:outline-none"
                        />
                        <span className="text-xs text-gray-400 font-bold">-</span>
                        <input
                          type="text"
                          placeholder="Max"
                          value={formCouponType === 'FIXED' ? formatNumberWithCommas(randomMaxVal) : randomMaxVal}
                          onChange={(e) => setRandomMaxVal(formCouponType === 'FIXED' ? parseRawNumber(e.target.value) : e.target.value)}
                          className="w-1/2 rounded-ods border border-ods-border bg-white py-2 px-2 text-xs font-bold text-black focus:border-ods-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block">Số Lượng Tạo (Batch)</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={randomCount}
                        onChange={(e) => setRandomCount(e.target.value)}
                        className="w-full rounded-ods border border-ods-border bg-white py-2 px-3 text-xs font-bold text-black focus:border-ods-primary focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-ods bg-amber-500 hover:bg-amber-600 text-white py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Shuffle className="h-4 w-4" />
                      <span>Sinh {randomCount} Mã Random</span>
                    </button>
                  </form>
                )}
              </div>

              {/* COUPONS LIST TABLE WITH EDIT BUTTON */}
              <div className="rounded-ods border border-ods-border bg-white shadow-sm overflow-hidden">
                <div className="bg-ods-surface border-b border-ods-border px-6 py-4 flex items-center justify-between">
                  <h3 className="font-heading text-xs font-extrabold uppercase tracking-wider text-black">
                    DANH SÁCH MÃ GIẢM GIÁ ĐANG HOẠT ĐỘNG ({coupons.length})
                  </h3>
                  <span className="text-[10px] font-bold text-ods-primary uppercase bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
                    Sẵn sàng áp dụng tại Giỏ hàng
                  </span>
                </div>

                {coupons.length === 0 ? (
                  <div className="py-16 text-center text-xs text-ods-textMuted">Chưa có mã giảm giá nào được tạo.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 border-b border-ods-border text-[10px] font-bold uppercase tracking-wider text-ods-textMuted">
                        <tr>
                          <th className="py-3.5 px-4">Mã Giảm Giá</th>
                          <th className="py-3.5 px-4">Loại Giảm Giá</th>
                          <th className="py-3.5 px-4">Mức Giảm</th>
                          <th className="py-3.5 px-4">Đã Sử Dụng / Giới Hạn</th>
                          <th className="py-3.5 px-4">Trạng Thái</th>
                          <th className="py-3.5 px-4 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {coupons.map((cp) => (
                          <tr key={cp.id} className="hover:bg-ods-surface transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-sm text-black tracking-wider bg-zinc-100 border border-zinc-300 px-2.5 py-1 rounded-md">
                                  {cp.code}
                                </span>
                                {cp.isRandom && (
                                  <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                    RANDOM
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-gray-700">
                              {cp.discountType === 'PERCENT' ? 'Giảm Giá Phần Trăm (%)' : 'Giảm Giá Tiền Trực Tiếp (VNĐ)'}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                                {cp.discountType === 'PERCENT' ? `-${cp.discountValue}%` : `-${formatCurrency(cp.discountValue)}`}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-gray-600">
                              {cp.usedCount || 0} / {cp.usageLimit || 100} lượt
                            </td>
                            <td className="py-3.5 px-4">
                              {cp.status !== 'EXPIRED' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                  HOẠT ĐỘNG
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-red-600 bg-red-100 px-2.5 py-0.5 rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                  TẠM KHÓA
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleCopyCode(cp.code)}
                                  className="p-1.5 rounded-ods border border-ods-border bg-white text-gray-700 hover:border-black hover:text-black transition-all"
                                  title="Sao chép mã"
                                >
                                  {copiedCode === cp.code ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>

                                {/* EDIT COUPON BUTTON */}
                                <button
                                  onClick={() => handleOpenEditCouponModal(cp)}
                                  className="p-1.5 rounded-ods border border-ods-border bg-white text-ods-primary hover:border-ods-primary transition-all"
                                  title="Chỉnh sửa mã giảm giá"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDeleteCoupon(cp.id, cp.code)}
                                  className="p-1.5 rounded-ods border border-red-200 bg-white text-red-500 hover:bg-red-50 transition-all"
                                  title="Xóa mã"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* PRODUCTS TABLE / GRID (Game Key & Accounts) */
            <div className="rounded-ods border border-ods-border bg-white shadow-sm overflow-hidden">
              {isLoading ? (
                <div className="py-16 text-center text-xs text-ods-textMuted">Đang tải danh sách sản phẩm...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <Package className="h-10 w-10 text-gray-300 mx-auto" />
                  <p className="text-xs text-ods-textMuted font-light">Chưa có sản phẩm nào thuộc danh mục này.</p>
                  <button
                    onClick={handleOpenCreateModal}
                    className="text-xs font-bold text-ods-primary uppercase hover:underline"
                  >
                    + Thêm sản phẩm đầu tiên
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-ods-surface border-b border-ods-border text-[10px] font-bold uppercase tracking-wider text-ods-textMuted">
                      <tr>
                        <th className="py-3.5 px-4">Sản Phẩm</th>
                        <th className="py-3.5 px-4">Loại / Nền tảng</th>
                        <th className="py-3.5 px-4">Vị Trí Nổi Bật</th>
                        <th className="py-3.5 px-4">Giá Gốc</th>
                        <th className="py-3.5 px-4">Giá Giảm</th>
                        <th className="py-3.5 px-4">Trạng Thái</th>
                        <th className="py-3.5 px-4 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredProducts.map((p) => {
                        const priceNum = typeof p.price === 'string' ? parseFloat(p.price) : p.price;
                        const discNum = p.discountPrice !== null ? (typeof p.discountPrice === 'string' ? parseFloat(p.discountPrice) : p.discountPrice) : null;

                        return (
                          <tr key={p.id} className="hover:bg-ods-surface/50 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={p.coverImage}
                                  alt={p.name}
                                  className="h-12 w-20 rounded-ods object-cover bg-black border border-ods-border shrink-0"
                                />
                                <div className="min-w-0">
                                  <h4 className="font-heading text-xs font-bold text-black truncate">{p.name}</h4>
                                  <p className="text-[10px] text-ods-textMuted truncate">
                                    Slug: {p.slug}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-extrabold text-black uppercase text-[10px] bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
                                {p.platform}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col items-start gap-1 w-max">
                                {p.isFeaturedDeal && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 w-max">
                                    <Sparkles className="h-2.5 w-2.5" /> DEAL NỔI BẬT TUẦN
                                  </span>
                                )}
                                {p.isFlashDeal && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-max">
                                    <Award className="h-2.5 w-2.5 text-amber-500 fill-amber-500" /> TOP GAME BÁN CHẠY
                                  </span>
                                )}
                                {!p.isFeaturedDeal && !p.isFlashDeal && (
                                  <span className="text-[10px] text-gray-400 font-light">Thường</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-black">
                              {formatCurrency(priceNum)}
                            </td>
                            <td className="py-3.5 px-4">
                              {discNum !== null ? (
                                <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                  {formatCurrency(discNum)}
                                </span>
                              ) : (
                                <span className="text-gray-400 font-light text-[10px]">Không giảm</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {p.status !== false ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Đang bán
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                                  <XCircle className="h-3 w-3 text-red-500" /> Ngưng bán
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/products/${p.slug}`}
                                  target="_blank"
                                  className="p-1.5 rounded-ods border border-ods-border bg-white text-gray-500 hover:border-black hover:text-black transition-all"
                                  title="Xem giao diện người mua"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Link>
                                <button
                                  onClick={() => handleEditProduct(p)}
                                  className="p-1.5 rounded-ods border border-ods-border bg-white text-ods-primary hover:border-ods-primary transition-all"
                                  title="Chỉnh sửa sản phẩm"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-1.5 rounded-ods border border-red-200 bg-white text-red-500 hover:bg-red-50 transition-all"
                                  title="Xóa sản phẩm"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>

        {/* MODAL EDIT COUPON */}
        <AnimatePresence>
          {showEditCouponModal && editingCoupon && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-ods border border-ods-border bg-white p-6 text-black shadow-2xl my-8"
              >
                <div className="flex items-center justify-between border-b border-ods-border pb-4 mb-6">
                  <div>
                    <h3 className="font-heading text-lg font-extrabold uppercase tracking-wider text-black flex items-center gap-2">
                      <Edit className="h-5 w-5 text-ods-primary" />
                      <span>CHỈNH SỬA MÃ GIẢM GIÁ</span>
                    </h3>
                    <p className="text-xs text-ods-textMuted mt-0.5">Cập nhật mã: <strong className="font-mono text-black">{editingCoupon.code}</strong></p>
                  </div>
                  <button
                    onClick={() => setShowEditCouponModal(false)}
                    className="rounded-ods border border-ods-border p-1.5 text-ods-textMuted hover:text-black hover:border-black transition-all"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveEditCoupon} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase block">Mã Giảm Giá *</label>
                    <input
                      type="text"
                      required
                      value={editCouponCode}
                      onChange={(e) => setEditCouponCode(e.target.value.toUpperCase())}
                      className="w-full rounded-ods border border-ods-border bg-white py-2 px-3 text-xs font-extrabold text-black uppercase tracking-wider focus:border-ods-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block">Loại Giảm Giá *</label>
                      <select
                        value={editCouponType}
                        onChange={(e) => setEditCouponType(e.target.value as any)}
                        className="w-full rounded-ods border border-ods-border bg-white py-2 px-3 text-xs font-bold text-black focus:border-ods-primary focus:outline-none"
                      >
                        <option value="PERCENT">Phần Trăm (%)</option>
                        <option value="FIXED">Số Tiền (VNĐ)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block">Giá Trị Giảm *</label>
                      <input
                        type="text"
                        required
                        value={editCouponType === 'FIXED' ? formatNumberWithCommas(editCouponValue) : editCouponValue}
                        onChange={(e) => setEditCouponValue(editCouponType === 'FIXED' ? parseRawNumber(e.target.value) : e.target.value)}
                        className="w-full rounded-ods border border-ods-border bg-white py-2 px-3 text-xs font-bold text-black focus:border-ods-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block">Giới Hạn Lượt Dùng</label>
                      <input
                        type="number"
                        required
                        value={editCouponLimit}
                        onChange={(e) => setEditCouponLimit(e.target.value)}
                        className="w-full rounded-ods border border-ods-border bg-white py-2 px-3 text-xs font-bold text-black focus:border-ods-primary focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block">Trạng Thái Mã</label>
                      <select
                        value={editCouponStatus}
                        onChange={(e) => setEditCouponStatus(e.target.value)}
                        className="w-full rounded-ods border border-ods-border bg-white py-2 px-3 text-xs font-bold text-black focus:border-ods-primary focus:outline-none"
                      >
                        <option value="ACTIVE">Hoạt Động (Active)</option>
                        <option value="EXPIRED">Tạm Khóa (Disabled)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-ods-border pt-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowEditCouponModal(false)}
                      className="rounded-ods border border-ods-border px-5 py-2 text-xs font-bold uppercase text-gray-600 hover:text-black transition-all"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="submit"
                      className="rounded-ods bg-ods-primary hover:bg-ods-primaryHover text-white px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all shadow-buttonGlow active:scale-95"
                    >
                      Lưu Thay Đổi
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL FOR CREATING / EDITING PRODUCTS */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-4xl rounded-ods border border-ods-border bg-white p-6 text-black shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-ods-border pb-4 mb-6">
                  <div>
                    <h3 className="font-heading text-lg font-extrabold uppercase tracking-wider text-black">
                      {editingItem ? 'CHỈNH SỬA SẢN PHẨM' : 'THÊM SẢN PHẨM MỚI'}
                    </h3>
                    <p className="text-xs text-ods-textMuted mt-0.5">
                      {activeTab === 'game' ? 'Danh mục: Sản Phẩm Game (Steam/Epic)' : 'Danh mục: Tài Khoản & Dịch Vụ Premium'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="rounded-ods border border-ods-border p-1.5 text-ods-textMuted hover:text-black hover:border-black transition-all"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmitForm} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block">Tên Sản Phẩm *</label>
                      <input
                        type="text"
                        required
                        placeholder="VD: Resident Evil Requiem"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full rounded-ods border border-ods-border bg-white py-2 px-3 text-xs font-bold text-black focus:border-ods-primary focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block">Hình Thức Giao Hàng *</label>
                      <select
                        value={formDeliveryMethod}
                        onChange={(e) => setFormDeliveryMethod(e.target.value)}
                        className="w-full rounded-ods border border-ods-border bg-white py-2 px-3 text-xs font-bold text-black focus:border-ods-primary focus:outline-none cursor-pointer"
                      >
                        <option value="AUTO_KEY">⚡ Giao Key Tự Động</option>
                        <option value="NEW_ACC">🔑 Gửi Tài Khoản Mới</option>
                        <option value="GIFT_ACC">🎁 Gift Tài Khoản</option>
                        <option value="OFFLINE_ACC">🎮 Gửi Tài Khoản Offline</option>
                        <option value="SHARED_ACC">👥 Tài Khoản Dùng Chung</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block">Tình Trạng Kho Hàng *</label>
                      <select
                        value={formInStock ? 'instock' : 'outstock'}
                        onChange={(e) => setFormInStock(e.target.value === 'instock')}
                        className={`w-full rounded-ods border py-2 px-3 text-xs font-extrabold focus:outline-none transition-all cursor-pointer ${
                          formInStock
                            ? 'border-sky-300 bg-sky-50 text-sky-800'
                            : 'border-zinc-300 bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        <option value="instock">📦 Đang Còn Hàng (Sẵn sàng bán)</option>
                        <option value="outstock">🚫 Hết Hàng / Không Còn Hàng</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block">Trạng Thái Kinh Doanh *</label>
                      <select
                        value={formStatus ? 'active' : 'inactive'}
                        onChange={(e) => setFormStatus(e.target.value === 'active')}
                        className={`w-full rounded-ods border py-2 px-3 text-xs font-extrabold focus:outline-none transition-all cursor-pointer ${
                          formStatus
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                            : 'border-red-300 bg-red-50 text-red-800'
                        }`}
                      >
                        <option value="active">🟢 Đang Bán (Kích hoạt)</option>
                        <option value="inactive">🔴 Ngưng Bán (Tạm khóa)</option>
                      </select>
                    </div>

                    <div className="space-y-1 md:row-span-2 flex flex-col">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block">Thể Loại / Nhóm (Có thể chọn nhiều) *</label>
                      <div className="flex flex-wrap gap-2 p-3 bg-white border border-ods-border rounded-ods flex-1 overflow-y-auto min-h-[100px]">
                        {(activeTab === 'game' 
                          ? ['FPS', 'Survival', 'Multiplayer', 'Open World', 'Co-Op', 'RPG', 'Anime', 'Action', 'Singleplayer', 'Crafting', 'Building', 'Horror', 'Zombies', 'Dark']
                          : ['Premium', 'Pro', 'Plus', 'Super', 'Google One']
                        ).map((cat) => {
                          const isSelected = formCategory.includes(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setFormCategory(formCategory.filter(c => c !== cat));
                                } else {
                                  setFormCategory([...formCategory, cat]);
                                }
                              }}
                              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border transition-all ${
                                isSelected
                                  ? 'bg-sky-100 text-sky-700 border-sky-300 shadow-sm'
                                  : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-300'
                              }`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                      {formCategory.length === 0 && (
                        <p className="text-[10px] text-red-500 font-bold">Vui lòng chọn ít nhất 1 thể loại.</p>
                      )}
                    </div>

                    {/* Price & Discount Input Fields OR Automatic Package Badge */}
                    {activeTab === 'account' && formVariants.length > 0 ? (
                      <div className="col-span-1 sm:col-span-2 bg-purple-50/70 border border-purple-200 rounded-ods p-3 flex items-center justify-between text-xs text-purple-900 font-medium">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-purple-600 shrink-0" />
                          <span>Giá gốc & Giá khuyến mãi được <strong>tự động tính theo Cấu hình gói thời hạn ({formVariants.length} gói)</strong> bên dưới.</span>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200 shrink-0">
                          ⚡ TỰ ĐỘNG THEO GÓI
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-bold uppercase block">Giá Niêm Yết (Gốc) *</label>
                          <input
                            type="text"
                            required={!(activeTab === 'account' && formVariants.length > 0)}
                            placeholder="VD: 1,450,000"
                            value={formatNumberWithCommas(formPrice)}
                            onChange={(e) => setFormPrice(parseRawNumber(e.target.value))}
                            className="w-full rounded-ods border border-ods-border bg-white py-2 px-3 text-xs font-bold text-black focus:border-ods-primary focus:outline-none font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500 font-bold uppercase block">Phần Trăm Giảm Giá (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="99"
                            placeholder="VD: 20 (Nhập 0 nếu không giảm)"
                            value={formDiscountPercent}
                            onChange={(e) => setFormDiscountPercent(e.target.value)}
                            className="w-full rounded-ods border border-ods-border bg-white py-2 px-3 text-xs font-bold text-black focus:border-ods-primary focus:outline-none"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Media Links multiline inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-ods-border pt-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block flex items-center justify-between">
                        <span>Danh Sách Link Ảnh Sản Phẩm (Mỗi link 1 dòng)</span>
                        <span className="text-sky-600 font-extrabold">{parsedImageUrls.length} ảnh</span>
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Dán các link ảnh tại đây (mỗi link 1 dòng)..."
                        value={formImageUrlsText}
                        onChange={(e) => setFormImageUrlsText(e.target.value)}
                        className="w-full rounded-ods border border-ods-border bg-white p-3 text-xs font-mono text-black focus:border-ods-primary focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase block flex items-center justify-between">
                        <span>Link Video Youtube Trailer (Mỗi link 1 dòng)</span>
                        <span className="text-red-600 font-extrabold">{parsedVideoUrls.length} video</span>
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Dán các link Youtube trailer tại đây (mỗi link 1 dòng)..."
                        value={formVideoUrlsText}
                        onChange={(e) => setFormVideoUrlsText(e.target.value)}
                        className="w-full rounded-ods border border-ods-border bg-white p-3 text-xs font-mono text-black focus:border-ods-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Media Display Order Setting */}
                  <div className="rounded-ods border border-ods-border bg-ods-surface p-4 space-y-2">
                    <label className="text-[10px] font-bold uppercase text-black block tracking-wider">
                      CẤU HÌNH THỨ TỰ TRÌNH CHIẾU MEDIA (VIDEO & ANH)
                    </label>
                    <div className="flex flex-wrap gap-4 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="mediaOrder"
                          value="image_first"
                          checked={formMediaOrder === 'image_first'}
                          onChange={() => setFormMediaOrder('image_first')}
                          className="accent-ods-primary"
                        />
                        <span className="font-semibold text-black">🖼️ Hiển thị Ảnh sản phẩm trước tiên</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="mediaOrder"
                          value="video_first"
                          checked={formMediaOrder === 'video_first'}
                          onChange={() => setFormMediaOrder('video_first')}
                          className="accent-ods-primary"
                        />
                        <span className="font-semibold text-black">🎬 Hiển thị Video Youtube Trailer trước tiên</span>
                      </label>
                    </div>
                  </div>

                  {/* Highlights & Tags */}
                  <div className="border-t border-ods-border pt-4 space-y-3">
                    <label className="text-[10px] text-gray-500 font-bold uppercase block">NHÃN NỔI BẬT (TAGS)</label>
                    <div className="flex flex-wrap gap-3">
                      {TAG_OPTIONS.map((tag) => {
                        const isChecked = formTags.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => {
                              if (isChecked) {
                                setFormTags(formTags.filter((t) => t !== tag.id));
                              } else {
                                setFormTags([...formTags, tag.id]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                              isChecked
                                ? 'bg-black text-white border-black shadow-sm'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                            }`}
                          >
                            {tag.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Feature deals checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-ods-border pt-4">
                    <label className="flex items-center gap-3 p-3 rounded-ods border border-ods-border bg-ods-surface cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsFeaturedDeal}
                        onChange={(e) => setFormIsFeaturedDeal(e.target.checked)}
                        className="h-4 w-4 accent-ods-primary rounded"
                      />
                      <div>
                        <span className="text-xs font-bold text-black block">⭐ DEAL NỔI BẬT TUẦN</span>
                        <span className="text-[10px] text-ods-textMuted block">Đưa lên Banner chính Hero Section ở trang chủ</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-ods border border-ods-border bg-ods-surface cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsFlashDeal}
                        onChange={(e) => setFormIsFlashDeal(e.target.checked)}
                        className="h-4 w-4 accent-ods-primary rounded"
                      />
                      <div>
                        <span className="text-xs font-bold text-black block">🏆 TOP GAME BÁN CHẠY</span>
                        <span className="text-[10px] text-ods-textMuted block">Ưu tiên đưa vào Bảng xếp hạng Top Game bán chạy ở trang chủ</span>
                      </div>
                    </label>

                    {/* Date-Time Picker for Deal Expiration Date */}
                    {(formIsFeaturedDeal) && (
                      <div className="rounded-ods border border-amber-300 bg-amber-50/60 p-4 space-y-2 col-span-full">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="text-[11px] font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <span>NGÀY & GIỜ KẾT THÚC ƯU ĐÃI DEAL NỔI BẬT *</span>
                          </label>
                          <span className="text-[10px] text-amber-700 font-semibold">Đồng hồ đếm ngược sẽ tự đếm đến mốc thời gian này</span>
                        </div>
                        <input
                          type="datetime-local"
                          lang="en-GB"
                          value={formFlashSaleEnd}
                          onChange={(e) => setFormFlashSaleEnd(e.target.value)}
                          className="w-full rounded-ods border border-amber-300 bg-white py-2 px-3 text-xs font-bold text-black focus:border-amber-500 focus:outline-none shadow-xs font-mono"
                        />
                      </div>
                    )}
                  </div>

                  {/* Package Variants & Duration Options (ONLY for Account / Service Products) */}
                  {activeTab === 'account' && (
                    <div className="border-t border-ods-border pt-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ods-border pb-2">
                        <label className="text-[11px] font-black uppercase text-black flex items-center gap-2">
                          <Layers className="h-4 w-4 text-purple-600" />
                          <span>CẤU HÌNH GÓI THỜI HẠN & GIÁ BÁN (1 THÁNG, 3 THÁNG, 6 THÁNG, 12 THÁNG...)</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setFormVariants([
                                { id: 'v-1', name: '1 Tháng', price: '120,000', discountPrice: '41,000' },
                                { id: 'v-2', name: '3 Tháng', price: '330,000', discountPrice: '111,000' },
                                { id: 'v-3', name: '6 Tháng', price: '600,000', discountPrice: '210,000' },
                                { id: 'v-4', name: '12 Tháng', price: '1,190,000', discountPrice: '500,000' },
                              ]);
                              showToast('Đã nạp bộ 4 gói mặc định (1, 3, 6, 12 Tháng)!', 'success');
                            }}
                            className="inline-flex items-center gap-1 rounded-ods bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 text-[10.5px] font-bold uppercase transition-all cursor-pointer"
                            title="Nạp bộ 4 gói chuẩn 1, 3, 6, 12 Tháng"
                          >
                            <Zap className="h-3 w-3 text-amber-600" />
                            <span>⚡ Nạp 1, 3, 6, 12 Tháng</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const existingNames = formVariants.map(v => v.name.trim());
                              let nextName = '1 Tháng';
                              let nextPrice = '120,000';
                              let nextDisc = '79,000';

                              if (!existingNames.includes('1 Tháng')) {
                                nextName = '1 Tháng'; nextPrice = '120,000'; nextDisc = '41,000';
                              } else if (!existingNames.includes('3 Tháng')) {
                                nextName = '3 Tháng'; nextPrice = '330,000'; nextDisc = '111,000';
                              } else if (!existingNames.includes('6 Tháng')) {
                                nextName = '6 Tháng'; nextPrice = '600,000'; nextDisc = '210,000';
                              } else if (!existingNames.includes('12 Tháng')) {
                                nextName = '12 Tháng'; nextPrice = '1,190,000'; nextDisc = '500,000';
                              } else if (!existingNames.includes('1 Ngày')) {
                                nextName = '1 Ngày'; nextPrice = '25,000'; nextDisc = '10,000';
                              } else if (!existingNames.includes('7 Ngày')) {
                                nextName = '7 Ngày'; nextPrice = '60,000'; nextDisc = '21,000';
                              } else {
                                nextName = `${formVariants.length + 1} Tháng`; nextPrice = '150,000'; nextDisc = '99,000';
                              }

                              setFormVariants([
                                ...formVariants,
                                { id: `v-${Date.now()}`, name: nextName, price: nextPrice, discountPrice: nextDisc },
                              ]);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-ods bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1 text-[11px] font-bold uppercase transition-all cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Thêm Gói Mới</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {formVariants.map((v, idx) => (
                          <div key={v.id} className="grid grid-cols-12 gap-2 items-center bg-ods-surface border border-ods-border p-2.5 rounded-ods">
                            <div className="col-span-4">
                              <label className="text-[9px] font-bold uppercase text-gray-500 block mb-0.5">Tên Gói / Thời Hạn</label>
                              <input
                                type="text"
                                placeholder="VD: 1 Ngày, 1 Tháng..."
                                value={v.name}
                                onChange={(e) => {
                                  const updated = [...formVariants];
                                  updated[idx].name = e.target.value;
                                  setFormVariants(updated);
                                }}
                                className="w-full rounded-ods border border-ods-border bg-white py-1 px-2 text-xs font-bold text-black focus:border-purple-500 focus:outline-none"
                              />
                            </div>

                            <div className="col-span-3">
                              <label className="text-[9px] font-bold uppercase text-gray-500 block mb-0.5">Giá Niêm Yết (Gốc)</label>
                              <input
                                type="text"
                                placeholder="VD: 120,000"
                                value={v.price}
                                onChange={(e) => {
                                  const updated = [...formVariants];
                                  updated[idx].price = formatNumberWithCommas(e.target.value);
                                  setFormVariants(updated);
                                }}
                                className="w-full rounded-ods border border-ods-border bg-white py-1 px-2 text-xs font-bold text-black focus:border-purple-500 focus:outline-none font-mono"
                              />
                            </div>

                            <div className="col-span-4">
                              <label className="text-[9px] font-bold uppercase text-gray-500 block mb-0.5">Giá Khuyến Mãi (Sale)</label>
                              <input
                                type="text"
                                placeholder="VD: 79,000"
                                value={v.discountPrice}
                                onChange={(e) => {
                                  const updated = [...formVariants];
                                  updated[idx].discountPrice = formatNumberWithCommas(e.target.value);
                                  setFormVariants(updated);
                                }}
                                className="w-full rounded-ods border border-ods-border bg-white py-1 px-2 text-xs font-bold text-emerald-600 focus:border-purple-500 focus:outline-none font-mono"
                              />
                            </div>

                            <div className="col-span-1 flex justify-end pt-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setFormVariants(formVariants.filter((_, i) => i !== idx));
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-ods transition-colors"
                                title="Xóa gói này"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* System Requirements Section (Only for Game Products) */}
                  {activeTab === 'game' && (
                    <div className="border-t border-ods-border pt-4 space-y-4">
                      <div className="flex items-center justify-between border-b border-ods-border pb-2">
                        <label className="text-[11px] font-black uppercase text-black flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-sky-600" />
                          <span>CẤU HÌNH YÊU CẦU CỦA GAME (SYSTEM REQUIREMENTS)</span>
                        </label>
                        <span className="text-[10px] text-gray-500">Hiển thị trực quan cho người mua ở trang chi tiết</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Minimum Requirements Column */}
                        <div className="rounded-ods border border-sky-200 bg-sky-50/40 p-3.5 space-y-3">
                          <h4 className="font-heading text-xs font-bold text-sky-900 uppercase flex items-center gap-1.5">
                            🖥️ CẤU HÌNH TỐI THIỂU (MINIMUM)
                          </h4>
                          
                          <div className="space-y-2">
                            <div>
                              <label className="text-[9.5px] font-extrabold text-gray-500 uppercase block mb-0.5">Hệ điều hành (OS)</label>
                              <input
                                type="text"
                                value={minOs}
                                onChange={(e) => setMinOs(e.target.value)}
                                className="w-full rounded-ods border border-ods-border bg-white py-1.5 px-2.5 text-xs font-semibold text-black focus:border-sky-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9.5px] font-extrabold text-gray-500 uppercase block mb-0.5">Bộ xử lý (CPU)</label>
                              <input
                                type="text"
                                value={minCpu}
                                onChange={(e) => setMinCpu(e.target.value)}
                                className="w-full rounded-ods border border-ods-border bg-white py-1.5 px-2.5 text-xs font-semibold text-black focus:border-sky-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9.5px] font-extrabold text-gray-500 uppercase block mb-0.5">Bộ nhớ RAM</label>
                              <input
                                type="text"
                                value={minRam}
                                onChange={(e) => setMinRam(e.target.value)}
                                className="w-full rounded-ods border border-ods-border bg-white py-1.5 px-2.5 text-xs font-semibold text-black focus:border-sky-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9.5px] font-extrabold text-gray-500 uppercase block mb-0.5">Card đồ họa (GPU)</label>
                              <input
                                type="text"
                                value={minGpu}
                                onChange={(e) => setMinGpu(e.target.value)}
                                className="w-full rounded-ods border border-ods-border bg-white py-1.5 px-2.5 text-xs font-semibold text-black focus:border-sky-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9.5px] font-extrabold text-gray-500 uppercase block mb-0.5">Dung lượng trống (Storage)</label>
                              <input
                                type="text"
                                value={minStorage}
                                onChange={(e) => setMinStorage(e.target.value)}
                                className="w-full rounded-ods border border-ods-border bg-white py-1.5 px-2.5 text-xs font-semibold text-black focus:border-sky-500 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Recommended Requirements Column */}
                        <div className="rounded-ods border border-emerald-200 bg-emerald-50/40 p-3.5 space-y-3">
                          <h4 className="font-heading text-xs font-bold text-emerald-900 uppercase flex items-center gap-1.5">
                            🚀 CẤU HÌNH ĐỀ NGHỊ (RECOMMENDED)
                          </h4>
                          
                          <div className="space-y-2">
                            <div>
                              <label className="text-[9.5px] font-extrabold text-gray-500 uppercase block mb-0.5">Hệ điều hành (OS)</label>
                              <input
                                type="text"
                                value={recOs}
                                onChange={(e) => setRecOs(e.target.value)}
                                className="w-full rounded-ods border border-ods-border bg-white py-1.5 px-2.5 text-xs font-semibold text-black focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9.5px] font-extrabold text-gray-500 uppercase block mb-0.5">Bộ xử lý (CPU)</label>
                              <input
                                type="text"
                                value={recCpu}
                                onChange={(e) => setRecCpu(e.target.value)}
                                className="w-full rounded-ods border border-ods-border bg-white py-1.5 px-2.5 text-xs font-semibold text-black focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9.5px] font-extrabold text-gray-500 uppercase block mb-0.5">Bộ nhớ RAM</label>
                              <input
                                type="text"
                                value={recRam}
                                onChange={(e) => setRecRam(e.target.value)}
                                className="w-full rounded-ods border border-ods-border bg-white py-1.5 px-2.5 text-xs font-semibold text-black focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9.5px] font-extrabold text-gray-500 uppercase block mb-0.5">Card đồ họa (GPU)</label>
                              <input
                                type="text"
                                value={recGpu}
                                onChange={(e) => setRecGpu(e.target.value)}
                                className="w-full rounded-ods border border-ods-border bg-white py-1.5 px-2.5 text-xs font-semibold text-black focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[9.5px] font-extrabold text-gray-500 uppercase block mb-0.5">Dung lượng trống (Storage)</label>
                              <input
                                type="text"
                                value={recStorage}
                                onChange={(e) => setRecStorage(e.target.value)}
                                className="w-full rounded-ods border border-ods-border bg-white py-1.5 px-2.5 text-xs font-semibold text-black focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="border-t border-ods-border pt-4 space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase block">Mô Tả Sản Phẩm Chi Tiết</label>
                    <textarea
                      rows={4}
                      placeholder="Nhập mô tả sản phẩm..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full rounded-ods border border-ods-border bg-white p-3 text-xs font-normal text-black focus:border-ods-primary focus:outline-none"
                    />
                  </div>

                  {/* Modal Footer Buttons */}
                  <div className="flex justify-end gap-3 border-t border-ods-border pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="rounded-ods border border-ods-border px-5 py-2.5 text-xs font-bold uppercase text-gray-600 hover:text-black hover:border-black transition-all"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-ods bg-ods-primary hover:bg-ods-primaryHover text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all shadow-buttonGlow disabled:opacity-50"
                    >
                      {isSubmitting ? 'Đang lưu...' : editingItem ? 'Lưu Cập Nhật' : 'Tạo Sản Phẩm Mới'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
