import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (orderId) {
      const messages = await prisma.chatMessage.findMany({
        where: { orderId },
        orderBy: { createdAt: 'asc' },
      });
      return NextResponse.json(messages);
    } else {
      // If no orderId, return all messages (or recent)
      const messages = await prisma.chatMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      return NextResponse.json(messages);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = await prisma.chatMessage.create({
      data: {
        orderId: body.orderId,
        senderId: body.senderId,
        receiverId: body.receiverId,
        content: body.content,
        isRead: false,
      },
    });
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const body = await request.json();
    const receiverId = body.receiverId;

    if (receiverId) {
      if (orderId === 'all') {
        // Mark all messages for this receiver as read
        await prisma.chatMessage.updateMany({
          where: { 
            receiverId,
            isRead: false 
          },
          data: { isRead: true },
        });
        return NextResponse.json({ success: true });
      } else if (orderId) {
        await prisma.chatMessage.updateMany({
          where: { 
            orderId, 
            receiverId,
            isRead: false 
          },
          data: { isRead: true },
        });
        return NextResponse.json({ success: true });
      }
    }
    
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update messages' }, { status: 500 });
  }
}
