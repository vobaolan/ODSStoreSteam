import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let usersList: any[] = [];
    let ordersCount = 0;
    let totalRevenue = 0;

    // 1. Query Supabase User / Profiles table first
    try {
      const { data: supaUsers } = await supabase
        .from('User')
        .select('*')
        .order('createdAt', { ascending: false });

      if (supaUsers && supaUsers.length > 0) {
        usersList = supaUsers.map((u: any) => ({
          id: u.id,
          name: u.name || u.email?.split('@')[0] || 'Khách hàng ODS',
          email: u.email,
          role: u.role || 'USER',
          balance: Number(u.balance ?? 0),
          createdAt: u.createdAt || new Date().toISOString(),
          _count: { orders: u.ordersCount || 0, transactions: u.transactionsCount || 0 },
        }));
      } else {
        const { data: supaProfiles } = await supabase.from('profiles').select('*');
        if (supaProfiles && supaProfiles.length > 0) {
          usersList = supaProfiles.map((u: any) => ({
            id: u.id,
            name: u.name || u.full_name || u.email?.split('@')[0] || 'Khách hàng ODS',
            email: u.email,
            role: u.role || 'USER',
            balance: Number(u.balance ?? 0),
            createdAt: u.created_at || u.createdAt || new Date().toISOString(),
            _count: { orders: 0, transactions: 0 },
          }));
        }
      }
    } catch (e) {
      console.warn('Lỗi query Supabase users:', e);
    }

    // 2. Query Prisma if Supabase has no users
    if (usersList.length === 0) {
      try {
        const prismaUsers = await prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            balance: true,
            createdAt: true,
            _count: {
              select: {
                orders: true,
                transactions: true,
              },
            },
          },
        });
        if (prismaUsers && prismaUsers.length > 0) {
          usersList = prismaUsers.map((u) => ({
            ...u,
            balance: Number(u.balance),
          }));
        }
      } catch (e) {}
    }

    // 3. Query Orders for Revenue Stats
    try {
      const { data: supaOrders } = await supabase.from('Order').select('netAmount, status');
      if (supaOrders && supaOrders.length > 0) {
        ordersCount = supaOrders.length;
        totalRevenue = supaOrders
          .filter((o: any) => o.status === 'COMPLETED' || o.status === 'PAID')
          .reduce((sum: number, o: any) => sum + Number(o.netAmount || 0), 0);
      } else {
        ordersCount = await prisma.order.count();
        const completedOrders = await prisma.order.findMany({
          where: { status: 'COMPLETED' },
          select: { netAmount: true },
        });
        totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.netAmount), 0);
      }
    } catch (e) {}

    const totalUsers = usersList.length;

    // Ensure master admin has initial default balance if not explicitly set
    let adminInList = usersList.find((u) => u.email === 'admin@odsstore.vn');
    if (adminInList) {
      if (adminInList.balance === undefined || adminInList.balance === null) {
        adminInList.balance = 0;
      }
    } else {
      usersList.unshift({
        id: 'admin-id-master',
        name: 'ODS ADMIN',
        email: 'admin@odsstore.vn',
        role: 'ADMIN',
        balance: 0,
        createdAt: new Date().toISOString(),
        _count: { orders: 0, transactions: 0 },
      });
    }

    const totalBalance = usersList.reduce((sum, u) => sum + Number(u.balance || 0), 0);

    return NextResponse.json(
      {
        users: usersList,
        stats: {
          totalUsers,
          totalBalance,
          ordersCount,
          totalRevenue,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách khách hàng CRM:', error);
    return NextResponse.json(
      { message: 'Lỗi máy chủ nội bộ!', users: [], stats: { totalUsers: 0, totalBalance: 0, ordersCount: 0, totalRevenue: 0 } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, balance, role } = body;

    if (!userId && !email) {
      return NextResponse.json({ message: 'UserId hoặc Email là bắt buộc' }, { status: 400 });
    }

    const updateData: any = {};
    if (balance !== undefined) updateData.balance = parseFloat(balance);
    if (role !== undefined) updateData.role = role;

    // Update in Supabase
    try {
      if (userId) {
        await supabase.from('User').update(updateData).eq('id', userId);
        await supabase.from('profiles').update(updateData).eq('id', userId);
      }
      if (email) {
        await supabase.from('User').update(updateData).eq('email', email);
        await supabase.from('profiles').update(updateData).eq('email', email);
      }
    } catch (e) {}

    // Update in Prisma
    let updatedUser: any = null;
    try {
      if (userId) {
        updatedUser = await prisma.user.update({
          where: { id: userId },
          data: updateData,
        });
      } else if (email) {
        updatedUser = await prisma.user.update({
          where: { email: email },
          data: updateData,
        });
      }
    } catch (e) {}

    return NextResponse.json(
      { message: 'Cập nhật khách hàng thành công!', user: updatedUser || { id: userId || email, ...updateData } },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Lỗi khi cập nhật khách hàng CRM:', error);
    return NextResponse.json(
      { message: 'Lỗi cập nhật khách hàng: ' + error.message },
      { status: 500 }
    );
  }
}
