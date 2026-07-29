import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        gameKeys: {
          select: {
            id: true,
            keyCode: true,
            status: true,
            createdAt: true,
            product: {
              select: {
                id: true,
                name: true,
                platform: true,
                type: true,
                deliveryMethod: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi khi lấy lịch sử toàn bộ đơn hàng (Admin):', error);
    return NextResponse.json(
      { message: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau!' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { orderId, action } = body;

    if (!orderId || !action) {
      return NextResponse.json({ message: 'Thiếu thông tin' }, { status: 400 });
    }

    if (action === 'MARK_GIFT_SUCCESS') {
      // Find order
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { gameKeys: true }
      });

      if (!order) {
        return NextResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
      }

      // Mark all gameKeys associated with this order that are GIFT related as SOLD/Completed
      for (const key of order.gameKeys) {
        if (key.status !== 'SOLD') {
          await prisma.gameKey.update({
            where: { id: key.id },
            data: { status: 'SOLD' }
          });
        }
      }
      
      // Update order status if it was pending
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'COMPLETED' }
      });

      return NextResponse.json({ success: true, message: 'Đã đánh dấu hoàn thành' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Hành động không hợp lệ' }, { status: 400 });
  } catch (error: any) {
    console.error('Lỗi update đơn hàng (Admin):', error);
    return NextResponse.json(
      { message: error.message || 'Lỗi xử lý' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ message: 'Thiếu ID đơn hàng' }, { status: 400 });
    }

    // We can just delete the order directly. Prisma will cascade or set null gameKeys depending on schema.
    await prisma.order.delete({
      where: { id: orderId }
    });

    return NextResponse.json({ success: true, message: 'Đã xóa đơn hàng' }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi xóa đơn hàng (Admin):', error);
    return NextResponse.json({ message: 'Lỗi xử lý' }, { status: 500 });
  }
}
