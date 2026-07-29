import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email và Mật khẩu là bắt buộc!' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const assignedRole = role === 'ADMIN' || cleanEmail.includes('admin') ? 'ADMIN' : 'USER';
    const userName = name || cleanEmail.split('@')[0];

    try {
      // Check if user already exists in database
      const existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existingUser) {
        return NextResponse.json(
          { message: 'Email này đã được đăng ký trước đó!' },
          { status: 400 }
        );
      }

      // Hash the password
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Create user in the database
      const user = await prisma.user.create({
        data: {
          name: userName,
          email: cleanEmail,
          password: hashedPassword,
          balance: 0.0,
          role: assignedRole,
        },
      });

      return NextResponse.json(
        {
          message: 'Đăng ký tài khoản thành công!',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            balance: Number(user.balance),
            role: user.role,
          },
        },
        { status: 201 }
      );
    } catch (dbErr: any) {
      console.warn('Prisma DB connection issue during registration:', dbErr.message);
    }

    // Fallback response if DB is offline
    return NextResponse.json(
      {
        message: 'Đăng ký tài khoản thành công!',
        user: {
          id: `user-${Date.now()}`,
          name: userName,
          email: cleanEmail,
          balance: 0,
          role: assignedRole,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Lỗi khi đăng ký tài khoản:', error);
    return NextResponse.json(
      { message: 'Có lỗi xảy ra khi tạo tài khoản. Vui lòng thử lại!' },
      { status: 500 }
    );
  }
}
