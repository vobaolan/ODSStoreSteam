import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50, // Lấy 50 thông báo gần nhất
    });
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const notification = await prisma.notification.create({
      data: {
        orderId: body.orderId,
        customerId: body.customerId,
        customerName: body.customerName,
        isGift: body.isGift || false,
        productNames: body.productNames,
        read: false,
      },
    });
    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id } = await request.json();
    if (id) {
      // Mark specific notification as read
      const updated = await prisma.notification.update({
        where: { id },
        data: { read: true },
      });
      return NextResponse.json(updated);
    } else {
      // Mark all as read
      await prisma.notification.updateMany({
        where: { read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // Xóa tất cả thông báo
    await prisma.notification.deleteMany();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete notifications' }, { status: 500 });
  }
}
