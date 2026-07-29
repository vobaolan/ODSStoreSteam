import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  };

  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json({ message: 'Slug là bắt buộc' }, { status: 400, headers });
    }

    const baseSlug = slug.split('-')[0].toLowerCase();

    // 1. Primary: Prisma fallback to bypass Next.js fetch cache!
    let product = await prisma.product.findUnique({
      where: { slug },
    });

    if (!product) {
      const allPrisma = await prisma.product.findMany();
      product = allPrisma.find((p) => 
        p.slug === slug || 
        slug.startsWith(p.slug) || 
        p.slug.startsWith(baseSlug) ||
        p.name.toLowerCase().includes(baseSlug)
      ) || null;
    }

    if (product) {
      const price = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price);
      const discountPrice = product.discountPrice
        ? (typeof product.discountPrice === 'string' ? parseFloat(product.discountPrice) : Number(product.discountPrice))
        : null;

      let trailerUrls: string[] = [];
      if (product.trailerUrl) {
        trailerUrls = product.trailerUrl.split(' | ').filter((u) => u.trim().length > 0).map((u) => u.trim());
      }

      const screenshots = product.screenshots && Array.isArray(product.screenshots) && product.screenshots.length > 0 
        ? product.screenshots 
        : [product.coverImage];

      return NextResponse.json(
        {
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            price,
            discountPrice,
            coverImage: product.coverImage,
            screenshots,
            category: product.category,
            platform: product.platform,
            type: product.type,
            deliveryMethod: product.deliveryMethod || 'AUTO_KEY',
            mediaOrder: product.mediaOrder || 'image_first',
            status: product.status,
            isFlashDeal: product.isFlashDeal || false,
            flashSaleEnd: product.flashSaleEnd ? new Date(product.flashSaleEnd).toISOString() : null,
            isFeaturedDeal: product.isFeaturedDeal || false,
            tags: product.tags,
            trailerUrl: product.trailerUrl,
            trailerUrls,
            minimumReq: product.minimumReq,
            recommendedReq: product.recommendedReq,
          },
        },
        { status: 200, headers }
      );
    }

    // 2. Query Supabase REST SDK (Fallback)
    const { data: supabaseProducts } = await supabase
      .from('Product')
      .select('*');

    if (supabaseProducts && supabaseProducts.length > 0) {
      const match = supabaseProducts.find((p: any) => 
        p.slug === slug || 
        p.id === slug || 
        slug.startsWith(p.slug) || 
        p.slug.startsWith(baseSlug) ||
        p.name.toLowerCase().includes(baseSlug)
      );

      if (match) {
        const price = typeof match.price === 'string' ? parseFloat(match.price) : Number(match.price);
        const discountPrice = match.discountPrice
          ? (typeof match.discountPrice === 'string' ? parseFloat(match.discountPrice) : Number(match.discountPrice))
          : null;

        let trailerUrls: string[] = [];
        if (match.trailerUrl) {
          trailerUrls = match.trailerUrl.split(' | ').filter((u: any) => u.trim().length > 0).map((u: any) => u.trim());
        }

        const screenshots = match.screenshots && match.screenshots.length > 0 
          ? match.screenshots 
          : [match.coverImage];

        return NextResponse.json(
          {
            product: {
              id: match.id,
              name: match.name,
              slug: match.slug,
              description: match.description,
              price,
              discountPrice,
              coverImage: match.coverImage,
              screenshots,
              category: match.category,
              platform: match.platform,
              type: match.type,
              deliveryMethod: match.deliveryMethod || 'AUTO_KEY',
              mediaOrder: match.mediaOrder || 'image_first',
              status: match.status,
              isFlashDeal: match.isFlashDeal || false,
              flashSaleEnd: match.flashSaleEnd ? new Date(match.flashSaleEnd).toISOString() : null,
              isFeaturedDeal: match.isFeaturedDeal || false,
              tags: match.tags,
              trailerUrl: match.trailerUrl,
              trailerUrls,
              minimumReq: match.minimumReq,
              recommendedReq: match.recommendedReq,
            },
          },
          { status: 200, headers }
        );
      }
    }

    return NextResponse.json({ message: 'Không tìm thấy sản phẩm' }, { status: 404, headers });
  } catch (error: any) {
    console.error('Lỗi khi tải chi tiết sản phẩm:', error);
    return NextResponse.json(
      { message: 'Lỗi lấy dữ liệu chi tiết' },
      { status: 500, headers }
    );
  }
}
