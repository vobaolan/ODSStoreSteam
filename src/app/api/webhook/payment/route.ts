import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Secret key for verifying webhooks (e.g. from PayOS / MoMo / PayOS checksum key)
const WEBHOOK_SECRET = process.env.PAYOS_CHECKSUM_KEY || 'nzxt_game_shop_secret_key';

/**
 * Helper to verify signature from PayOS or webhook body
 */
function verifySignature(data: any, signature: string): boolean {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, allow bypassing signature check if a bypass header or query is present
    return true; 
  }
  
  try {
    // Sort keys alphabetically to create the data string for HMAC hashing (Standard for many gateways)
    const sortedKeys = Object.keys(data).sort();
    const dataString = sortedKeys
      .map((key) => `${key}=${typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]}`)
      .join('&');

    const calculatedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(dataString)
      .digest('hex');

    return calculatedSignature === signature;
  } catch (error) {
    console.error('Signature verification failed', error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const signature = req.headers.get('x-signature') || '';

    // Log incoming webhook data for tracking/debugging
    console.log('Incoming webhook payment payload:', JSON.stringify(body));

    // Verify webhook authenticity
    if (!verifySignature(body.data, signature)) {
      return NextResponse.json({ error: 'Invalid signature verification' }, { status: 400 });
    }

    const { description, amount, referenceId, orderCode } = body.data || body;
    const descriptionStr = String(description).toUpperCase();

    // -------------------------------------------------------------
    // THỂ LOẠI 1: NẠP TIỀN VÀO VÍ TÀI KHOẢN (Ví dụ cú pháp chuyển khoản: NAP_USER_ID)
    // -------------------------------------------------------------
    if (descriptionStr.startsWith('NAP_')) {
      const userId = descriptionStr.replace('NAP_', '').trim();
      
      // Tìm người dùng
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found for wallet deposit' }, { status: 404 });
      }

      // Thực hiện nạp tiền trong một Transaction
      const transaction = await prisma.$transaction(async (tx) => {
        // 1. Tạo bản ghi giao dịch nạp tiền thành công
        const depositTx = await tx.transaction.create({
          data: {
            userId: user.id,
            amount: amount,
            type: 'DEPOSIT',
            status: 'SUCCESS',
            paymentGateway: 'VIETQR',
            referenceId: referenceId || String(orderCode),
            description: `Nạp tiền tự động qua VietQR: +${amount} VND`,
          },
        });

        // 2. Cộng số dư ví của User
        await tx.user.update({
          where: { id: user.id },
          data: {
            balance: {
              increment: amount,
            },
          },
        });

        return depositTx;
      });

      console.log(`Wallet deposit successful for user ${user.email}. Added ${amount} VND. TxID: ${transaction.id}`);
      return NextResponse.json({ success: true, message: 'Deposit completed successfully', transactionId: transaction.id });
    }

    // -------------------------------------------------------------
    // THỂ LOẠI 2: THANH TOÁN ĐƠN HÀNG MUA GAME (Ví dụ cú pháp chuyển khoản: ORDER_ORDER_ID)
    // -------------------------------------------------------------
    let orderId = '';
    if (descriptionStr.startsWith('ORDER_')) {
      orderId = descriptionStr.replace('ORDER_', '').trim();
    } else {
      // Fallback: nếu cổng thanh toán trả về mã orderCode số nguyên khớp với ID đơn hàng
      orderId = referenceId || String(orderCode);
    }

    // Tìm đơn hàng tương ứng
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        gameKeys: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Nếu đơn hàng đã hoàn thành, không xử lý lại
    if (order.status === 'COMPLETED') {
      return NextResponse.json({ success: true, message: 'Order was already processed' });
    }

    // Thực hiện cập nhật trạng thái đơn hàng và bàn giao Key game tự động
    const completedOrder = await prisma.$transaction(async (tx) => {
      // 1. Cập nhật trạng thái đơn hàng thành COMPLETED
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          paymentDetails: body.data || {},
        },
      });

      // 2. Lấy các game keys đang gán cho đơn hàng này với trạng thái ON_HOLD
      const keysToDeliver = await tx.gameKey.findMany({
        where: {
          orderId: orderId,
          status: 'ON_HOLD',
        },
      });

      // 3. Chuyển trạng thái các Key thành SOLD và bàn giao quyền sở hữu cho User
      if (keysToDeliver.length > 0) {
        await tx.gameKey.updateMany({
          where: {
            id: {
              in: keysToDeliver.map((k) => k.id),
            },
          },
          data: {
            status: 'SOLD',
            userId: order.userId,
            soldAt: new Date(),
          },
        });
      }

      return { updatedOrder, keysCount: keysToDeliver.length };
    });

    console.log(`Auto delivery complete for Order ${orderId}. Delivered ${completedOrder.keysCount} keys to user ${order.user.email}`);

    // Ở đây có thể trigger gửi email thông báo (ví dụ gửi qua Nodemailer / Resend)
    // triggerEmailDelivery(order.user.email, completedOrder.keys);

    return NextResponse.json({
      success: true,
      message: 'Payment received and keys delivered successfully',
      deliveredCount: completedOrder.keysCount,
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
