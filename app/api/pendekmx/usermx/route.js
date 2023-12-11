import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { defaultSession, sessionOptions } from '@/utils/sessionSecret';
import { getIronSession } from 'iron-session';

export async function GET() {
  const session = await getIronSession(cookies(), sessionOptions);

  if (session.isLoggedIn !== true) {
    return Response.json(defaultSession);
  }

  return Response.json(session);
}

export async function POST(request) {
  const prisma = new PrismaClient();
  const formData = await request.formData();
  const entries = [...formData.entries()];

  const username = entries.find(([key]) => key === 'username')?.[1];
  const password = entries.find(([key]) => key === 'password')?.[1];

  if (!username || !password) {
    return Response.json({ error: 'All fields are required' }, { status: 400 });
  }

  let user;
  try {
    user = await prisma.user.findUnique({ where: { username } });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to query user' }, { status: 500 });
  }

  let isPasswordCorrect;
  try {
    isPasswordCorrect = await bcrypt.compare(password, user.password);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: 'Failed to compare passwords' },
      { status: 500 }
    );
  }

  if (!isPasswordCorrect) {
    return Response.json({ error: 'Incorrect password' }, { status: 400 });
  }

  const session = await getIronSession(cookies(), sessionOptions);

  session.isLoggedIn = true;
  session.username = user.username;
  session.userId = user.id;

  await session.save();

  return Response.json(session);
}

export async function DELETE() {
  const session = await getIronSession(cookies(), sessionOptions);

  session.destroy();

  return Response.json(defaultSession);
}
