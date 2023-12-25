import { prisma } from '@/utils/prismaClient';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { defaultSession, sessionOptions, sleep } from '@/utils/sessionSecret';
import { getIronSession } from 'iron-session';

export async function GET(request) {
  const session = await getIronSession(cookies(), sessionOptions);

  await sleep(500);

  if (session.isLoggedIn !== true) {
    return Response.json(defaultSession);
  }

  await prisma.$disconnect();
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

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    return Response.json(
      { message: 'Incorrect username/password' },
      { status: 400 }
    );
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

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

  await sleep(500);

  await prisma.$disconnect();
  return Response.json(session);
}

export async function DELETE() {
  const session = await getIronSession(cookies(), sessionOptions);

  session.destroy();

  await sleep(500);

  await prisma.$disconnect();
  return Response.json({ message: 'Logged out' });
}
