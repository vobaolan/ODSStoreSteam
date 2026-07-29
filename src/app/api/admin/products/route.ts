import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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
    // 1. Primary: Use Prisma to bypass Next.js fetch cache!
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { keys: true },
        },
      },
    });

    if (products && products.length > 0) {
      return NextResponse.json({ products }, { status: 200, headers });
    }

    // 2. Secondary: Fallback to Supabase REST SDK
    const { data: supabaseProducts } = await supabase
      .from('Product')
      .select('*')
      .order('createdAt', { ascending: false });

    return NextResponse.json({ products: supabaseProducts || [] }, { status: 200, headers });
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách sản phẩm admin:', error);
    return NextResponse.json(
      { message: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau!' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      category,
      price,
      discountPercent,
      trailerUrl,
      trailerUrls,
      coverImage,
      imageUrls,
      screenshots,
      platform,
      type,
      deliveryMethod,
      mediaOrder,
      tags,
      status,
      isFlashDeal,
      flashSaleEnd,
      isFeaturedDeal,
      minimumReq,
      recommendedReq,
      variants,
    } = body;

    let finalCoverImage = coverImage;
    let finalScreenshots: string[] = Array.isArray(screenshots) ? screenshots : [];

    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      finalCoverImage = imageUrls[0];
      finalScreenshots = imageUrls;
    }

    if (!name || !price || !finalCoverImage) {
      return NextResponse.json(
        { message: 'Tên sản phẩm, Giá gốc và Ảnh đại diện là bắt buộc!' },
        { status: 400 }
      );
    }

    let finalTrailerUrl: string | null = null;
    if (Array.isArray(trailerUrls) && trailerUrls.length > 0) {
      finalTrailerUrl = trailerUrls.join(' | ');
    } else if (trailerUrl) {
      finalTrailerUrl = trailerUrl;
    }

    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const originalPrice = parseFloat(price);
    const discount = discountPercent ? parseFloat(discountPercent) : 0;
    const discountPrice = discount > 0 ? Math.round(originalPrice * (1 - discount / 100)) : null;

    const finalTags = Array.isArray(tags) && tags.length > 0 
      ? tags 
      : (discount > 0 ? ['Đang giảm giá'] : ['Mới ra mắt']);

    const isAvailable = status !== undefined ? Boolean(status) : true;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: body.description || `Sản phẩm ${name} bản quyền chính hãng tại ODS Store.`,
        price: originalPrice,
        discountPrice,
        coverImage: finalCoverImage,
        screenshots: finalScreenshots,
        trailerUrl: finalTrailerUrl,
        category: Array.isArray(category) ? category : [category || 'General'],
        platform: platform || 'STEAM',
        type: type || 'KEY_CODE',
        deliveryMethod: deliveryMethod || 'AUTO_KEY',
        mediaOrder: mediaOrder || 'image_first',
        tags: finalTags,
        status: isAvailable,
        isFlashDeal: Boolean(isFlashDeal),
        flashSaleEnd: flashSaleEnd ? new Date(flashSaleEnd) : null,
        isFeaturedDeal: Boolean(isFeaturedDeal),
        minimumReq: minimumReq || null,
        recommendedReq: recommendedReq || null,
        variants: variants || null,
      },
    });

    revalidatePath('/');
    revalidatePath('/products');
    
    return NextResponse.json(
      { message: 'Thêm sản phẩm mới thành công!', product },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Lỗi khi tạo sản phẩm admin:', error);
    return NextResponse.json(
      { message: 'Lỗi tạo sản phẩm: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      category,
      price,
      discountPercent,
      trailerUrls,
      trailerUrl,
      imageUrls,
      screenshots,
      platform,
      type,
      deliveryMethod,
      mediaOrder,
      tags,
      status,
      isFlashDeal,
      flashSaleEnd,
      isFeaturedDeal,
      minimumReq,
      recommendedReq,
      variants,
    } = body;

    if (!id || !name || !price) {
      return NextResponse.json({ message: 'ID, Tên và Giá gốc là bắt buộc!' }, { status: 400 });
    }

    const originalPrice = parseFloat(price);
    const discount = discountPercent ? parseFloat(discountPercent) : 0;
    const discountPrice = discount > 0 ? Math.round(originalPrice * (1 - discount / 100)) : null;

    let updateData: any = {
      name,
      price: originalPrice,
      discountPrice,
      category: Array.isArray(category) ? category : [category || 'General'],
      platform,
      type,
      deliveryMethod: deliveryMethod || 'AUTO_KEY',
      mediaOrder: mediaOrder || 'image_first',
      minimumReq,
      recommendedReq,
      variants,
    };

    if (status !== undefined) {
      updateData.status = Boolean(status);
    }

    if (isFlashDeal !== undefined) {
      updateData.isFlashDeal = Boolean(isFlashDeal);
    }

    if (flashSaleEnd !== undefined) {
      updateData.flashSaleEnd = flashSaleEnd ? new Date(flashSaleEnd) : null;
    }

    if (isFeaturedDeal !== undefined) {
      updateData.isFeaturedDeal = Boolean(isFeaturedDeal);
    }

    if (Array.isArray(tags)) {
      updateData.tags = tags;
    }

    const targetImgs = Array.isArray(imageUrls) ? imageUrls : (Array.isArray(screenshots) ? screenshots : undefined);
    if (targetImgs !== undefined) {
      updateData.screenshots = targetImgs;
      if (targetImgs.length > 0) {
        updateData.coverImage = targetImgs[0];
      }
    }

    if (Array.isArray(trailerUrls)) {
      updateData.trailerUrl = trailerUrls.join(' | ');
    } else if (trailerUrl !== undefined) {
      updateData.trailerUrl = trailerUrl || '';
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/');
    revalidatePath('/products');

    return NextResponse.json(
      { message: 'Cập nhật sản phẩm thành công!', product: updatedProduct },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
    return NextResponse.json(
      { message: 'Lỗi cập nhật sản phẩm: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'ID sản phẩm là bắt buộc' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath('/products');

    return NextResponse.json({ message: 'Đã xóa sản phẩm thành công!' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Lỗi xóa sản phẩm' }, { status: 500 });
  }
}
