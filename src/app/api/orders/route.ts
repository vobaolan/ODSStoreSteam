import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { message: 'UserId là bắt buộc!' },
        { status: 400 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        gameKeys: {
          select: {
            id: true,
            keyCode: true,
            createdAt: true,
            product: {
              select: {
                name: true,
                platform: true,
                type: true,
                coverImage: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi khi lấy lịch sử đơn hàng:', error);
    return NextResponse.json(
      { message: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau!' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, cartItems, netAmount, paymentMethod } = body;

    if (!userId || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ message: 'Thiếu thông tin đơn hàng' }, { status: 400 });
    }

    // Process in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. If paying with WALLET, check balance and deduct
      if (paymentMethod === 'WALLET') {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) {
          throw new Error('Người dùng không tồn tại');
        }
        if (Number(user.balance) < netAmount) {
          throw new Error('Số dư ví không đủ');
        }
        // Deduct balance
        await tx.user.update({
          where: { id: userId },
          data: { balance: { decrement: netAmount } },
        });
        
        // Log transaction
        await tx.transaction.create({
          data: {
            userId,
            amount: -netAmount,
            type: 'PURCHASE',
            status: 'SUCCESS',
            paymentGateway: 'WALLET',
            description: 'Thanh toán đơn hàng từ ví ODS',
          }
        });
      }

      // Generate Custom Order ID: ODS + 1 Digit + 5 Alphanumeric
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let randStr = '';
      for (let i = 0; i < 5; i++) {
        randStr += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const firstDigit = Math.floor(Math.random() * 10);
      const customOrderId = `ODS${firstDigit}${randStr}`;

      const productIds = cartItems.map((i: any) => i.productId || i.id);
      const productsInCart = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, type: true, deliveryMethod: true }
      });
      const hasGift = productsInCart.some(p => p.type === 'STEAM_GIFT' || p.deliveryMethod === 'GIFT');

      // 2. Create the Order
      const newOrder = await tx.order.create({
        data: {
          id: customOrderId,
          userId,
          totalAmount: netAmount, // Simplification
          netAmount: netAmount,
          paymentMethod,
          paymentStatus: paymentMethod === 'WALLET' ? 'PAID' : 'PENDING',
          status: hasGift ? 'PENDING' : (paymentMethod === 'WALLET' ? 'COMPLETED' : 'PENDING'),
        }
      });

      // 3. Assign GameKeys to Order
      for (const item of cartItems) {
        // Fetch product to check delivery method
        const actualProductId = item.productId || item.id;
        const productInfo = await tx.product.findUnique({
          where: { id: actualProductId },
          select: { deliveryMethod: true, type: true }
        });

        if (productInfo?.deliveryMethod === 'GIFT' || productInfo?.type === 'STEAM_GIFT') {
          // Gifts do not require physical keys in stock
          await tx.gameKey.create({
            data: {
              productId: actualProductId,
              variantName: item.variantName || null,
              keyCode: `Chờ ODS Liên Hệ & Gửi Gift`,
              status: 'SOLD',
              orderId: newOrder.id,
              userId: userId,
              soldAt: new Date()
            }
          });
          continue; // Move to next item
        }

        // Try to find an available key for physical goods
        const availableKey = await tx.gameKey.findFirst({
          where: {
            productId: actualProductId,
            variantName: item.variantName || null,
            status: 'AVAILABLE'
          }
        });

        if (availableKey) {
          await tx.gameKey.update({
            where: { id: availableKey.id },
            data: {
              status: 'SOLD',
              orderId: newOrder.id,
              userId: userId,
              soldAt: new Date()
            }
          });
        } else {
          throw new Error(`Sản phẩm ${item.name} hiện đang tạm hết hàng trong kho. Vui lòng thử lại sau!`);
        }
      }

      return newOrder;
    });

    return NextResponse.json({ 
      message: 'Đặt hàng thành công',
      order: order,
      hasGift: order.status === 'PENDING'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Lỗi khi xử lý đơn hàng:', error);
    
    // Nếu là lỗi do hết hàng mà chúng ta tự throw ở trên
    if (error.message && error.message.includes('tạm hết hàng')) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: error.message || 'Lỗi xử lý thanh toán' },
      { status: 500 }
    );
  }
}
