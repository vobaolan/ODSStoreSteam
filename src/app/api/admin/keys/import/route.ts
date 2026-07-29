import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, keys, rawText } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId parameter' }, { status: 400 });
    }

    // 1. Kiểm tra sản phẩm (game) tồn tại
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product (Game) not found' }, { status: 404 });
    }

    // 2. Phân tích danh sách key cần import
    let keysList: string[] = [];

    if (Array.isArray(keys)) {
      keysList = keys.map((k) => String(k).trim()).filter(Boolean);
    } else if (typeof rawText === 'string') {
      // Phân tách bằng dòng mới (mỗi dòng 1 key, bỏ dòng trống)
      keysList = rawText
        .split(/\r?\n/)
        .map((k) => k.trim())
        .filter(Boolean);
    }

    if (keysList.length === 0) {
      return NextResponse.json({ error: 'No valid key codes found to import' }, { status: 400 });
    }

    // 3. Chuẩn bị dữ liệu để insert vào DB (trạng thái AVAILABLE)
    const keysData = keysList.map((code) => ({
      productId: productId,
      keyCode: code,
      status: 'AVAILABLE' as const,
    }));

    // 4. Thực hiện insert hàng loạt (Bulk Insert)
    const importResult = await prisma.gameKey.createMany({
      data: keysData,
      skipDuplicates: true, // Tránh trùng key nếu DB có ràng buộc duy nhất (nếu cấu hình)
    });

    console.log(`Bulk Import Success: Added ${importResult.count} keys to product ID ${productId} (${product.name})`);

    return NextResponse.json({
      success: true,
      message: `Đã nhập thành công ${importResult.count} key vào sản phẩm "${product.name}".`,
      count: importResult.count,
    });
  } catch (error: any) {
    console.error('Bulk key import error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
