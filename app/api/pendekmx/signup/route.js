import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function POST() {
  const prisma = new PrismaClient();
  const formData = await request.formData();
  const entries = [...formData.entries()];

  const username = entries.find(([key]) => key === 'username')?.[1];
  const password = entries.find(([key]) => key === 'password')?.[1];

  if (!username || !password) {
    return Response.json({ error: 'All fields are required' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    return Response.json({ error: 'User already exists' }, { status: 400 });
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to hash password' }, { status: 500 });
  }

  try {
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    return Response.json({ message: 'User created' });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to create user' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
