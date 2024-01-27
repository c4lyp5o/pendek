import { prisma } from '@/utils/prismaClient';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    const formData = await request.formData();

    const username = formData.get('username');
    const password = formData.get('password');

    if (!username || !password) {
      return Response.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { username: username },
    });

    if (existingUser) {
      return Response.json({ message: 'User already exists' }, { status: 400 });
    }

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      console.error(error);
      return Response.json(
        { message: 'Failed to hash password' },
        { status: 500 }
      );
    }

    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    return Response.json({ message: 'User created' });
  } catch (error) {
    return Response.json({ message: 'Failed to create user' }, { status: 500 });
  }
}
