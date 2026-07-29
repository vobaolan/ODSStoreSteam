import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const keys = await prisma.gameKey.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            type: true,
            deliveryMethod: true,
          }
        },
        user: {
          select: {
            email: true,
          }
        },
        order: {
          select: {
            id: true,
          }
        }
      }
    });

    return NextResponse.json({ keys }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách Key (Admin):', error);
    return NextResponse.json({ message: 'Lỗi máy chủ' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, keys, variantName } = body;

    if (!productId || !keys || !Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json({ message: 'Thiếu thông tin' }, { status: 400 });
    }

    const createdKeys = [];
    for (const keyCode of keys) {
      const newKey = await prisma.gameKey.create({
        data: {
          productId,
          variantName: variantName || null,
          keyCode,
          status: 'AVAILABLE'
        }
      });
      createdKeys.push(newKey);
    }

    return NextResponse.json({ success: true, count: createdKeys.length }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi thêm Key (Admin):', error);
    return NextResponse.json({ message: 'Lỗi xử lý' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const keyId = url.searchParams.get('id');

    if (!keyId) {
      return NextResponse.json({ message: 'Thiếu ID' }, { status: 400 });
    }

    await prisma.gameKey.delete({
      where: { id: keyId }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi xóa Key (Admin):', error);
    return NextResponse.json({ message: 'Lỗi xử lý' }, { status: 500 });
  }
}
