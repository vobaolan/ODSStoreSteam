import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  };

  try {
    // Helper to resolve accurate delivery method
    const resolveDeliveryMethod = (p: any) => {
      if (p.deliveryMethod && p.deliveryMethod !== 'AUTO_KEY') {
        return p.deliveryMethod;
      }
      const nameLower = String(p.name || '').toLowerCase();
      const rawMethod = String(p.deliveryMethod || p.type || '').toUpperCase();
      if (
        nameLower.includes('resident evil') ||
        nameLower.includes('palworld') ||
        nameLower.includes('stardew') ||
        nameLower.includes('rust') ||
        rawMethod.includes('GIFT')
      ) {
        return 'GIFT';
      }
      if (nameLower.includes('dying light') || rawMethod.includes('SHARED')) {
        return 'SHARED_ACC';
      }
      if (nameLower.includes('netflix') || rawMethod.includes('NEW')) {
        return 'NEW_ACC';
      }
      return p.deliveryMethod || 'GIFT';
    };

    // [OPTIMIZATION] Bypass Prisma on Netlify due to IPv6/IPv4 connection timeout issues.
    // We use Supabase REST SDK as the PRIMARY fetch method for blazing fast performance.
    const { data: supabaseProducts, error: supaErr } = await supabase
      .from('Product')
      .select('*')
      .order('createdAt', { ascending: false });

    if (supaErr) {
      console.error('Supabase REST error:', supaErr);
      throw new Error('Supabase fetch failed');
    }

    const formattedSupabaseProducts = (supabaseProducts || []).map((p: any) => {
      const price = typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price);
      const discountPrice = p.discountPrice
        ? (typeof p.discountPrice === 'string' ? parseFloat(p.discountPrice) : Number(p.discountPrice))
        : null;

      let trailerUrls: string[] = [];
      if (p.trailerUrl) {
        trailerUrls = p.trailerUrl.split(' | ').map((u: string) => u.trim());
      }

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price,
        discountPrice,
        coverImage: p.coverImage,
        category: p.category,
        platform: p.platform,
        type: p.type,
        deliveryMethod: resolveDeliveryMethod(p),
        mediaOrder: p.mediaOrder || 'image_first',
        status: p.status,
        isFlashDeal: p.isFlashDeal || false,
        flashSaleEnd: p.flashSaleEnd ? new Date(p.flashSaleEnd).toISOString() : null,
        isFeaturedDeal: p.isFeaturedDeal || false,
        tags: p.tags,
        trailerUrl: p.trailerUrl,
        trailerUrls,
        screenshots: p.screenshots || [],
      };
    });

    return NextResponse.json({ products: formattedSupabaseProducts }, { status: 200, headers });

  } catch (error: any) {
    console.error('Lỗi khi tải danh sách sản phẩm:', error);
    return NextResponse.json(
      { message: 'Lỗi lấy dữ liệu sản phẩm' },
      { status: 500, headers }
    );
  }
}
