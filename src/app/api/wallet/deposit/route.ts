import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId, email, amount, memo } = await request.json();

    const addAmount = Number(amount);
    if (isNaN(addAmount) || addAmount <= 0) {
      return NextResponse.json({ message: 'Số tiền nạp không hợp lệ!' }, { status: 400 });
    }

    let updatedBalance = addAmount;

    // 1. Try updating via Supabase
    if (userId || email) {
      try {
        let query = supabase.from('User').select('balance').limit(1);
        if (userId) query = query.eq('id', userId);
        else if (email) query = query.eq('email', email);

        const { data: userRows } = await query;
        if (userRows && userRows.length > 0) {
          const currentBal = Number(userRows[0].balance || 0);
          updatedBalance = currentBal + addAmount;

          let updateQuery = supabase.from('User').update({ balance: updatedBalance });
          if (userId) updateQuery = updateQuery.eq('id', userId);
          else if (email) updateQuery = updateQuery.eq('email', email);
          await updateQuery;
        }
      } catch (e) {}

      // 2. Try updating via Prisma
      try {
        const user = await prisma.user.findFirst({
          where: userId ? { id: userId } : { email },
        });

        if (user) {
          const currentBal = Number(user.balance || 0);
          updatedBalance = currentBal + addAmount;
          await prisma.user.update({
            where: { id: user.id },
            data: { balance: updatedBalance },
          });
        }
      } catch (e) {}
    }

    return NextResponse.json(
      {
        message: 'Nạp tiền vào ví thành công!',
        addedAmount: addAmount,
        newBalance: updatedBalance,
        memo,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Lỗi khi nạp tiền ví:', error);
    return NextResponse.json({ message: 'Có lỗi xảy ra khi nạp tiền!' }, { status: 500 });
  }
}
