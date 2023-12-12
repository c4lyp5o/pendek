import { prisma } from '@/utils/prismaClient';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { defaultSession, sessionOptions } from '@/utils/sessionSecret';
import { getIronSession } from 'iron-session';

export async function GET(request) {
  const session = await getIronSession(cookies(), sessionOptions);

  if (session.isLoggedIn !== true) {
    return Response.json(defaultSession);
  }

  return Response.json(session);
}

export async function POST(request) {
  const formData = await request.formData();
  const entries = [...formData.entries()];

  const username = entries.find(([key]) => key === 'username')?.[1];
  const password = entries.find(([key]) => key === 'password')?.[1];

  if (!username || !password) {
    return Response.json(
      { message: 'All fields are required' },
      { status: 400 }
    );
  }

  let user;
  try {
    user = await prisma.user.findUnique({ where: { username } });
  } catch (error) {
    return Response.json(
      { message: 'Incorrect username/password' },
      { status: 400 }
    );
  }

  let isPasswordCorrect;
  try {
    isPasswordCorrect = await bcrypt.compare(password, user.password);
  } catch (error) {
    return Response.json(
      { message: 'Failed to compare passwords' },
      { status: 500 }
    );
  }

  if (!isPasswordCorrect) {
    return Response.json(
      { message: 'Incorrect username/password' },
      { status: 400 }
    );
  }

  const session = await getIronSession(cookies(), sessionOptions);

  session.isLoggedIn = true;
  session.username = user.username;
  session.userId = user.id;
  session.loginTime = Date.now();

  await session.save();

  return Response.json(session);
}

export async function DELETE() {
  const session = await getIronSession(cookies(), sessionOptions);

  session.destroy();

  return Response.json(defaultSession);
}
