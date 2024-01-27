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

  if (!existingUser) {
    return Response.json(
      { message: 'Incorrect username/password' },
      { status: 400 }
    );
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    existingUser.password
  );

  if (!isPasswordCorrect) {
    return Response.json(
      { message: 'Incorrect username/password' },
      { status: 400 }
    );
  }

  const session = await getIronSession(cookies(), sessionOptions);

  session.isLoggedIn = true;
  session.username = existingUser.username;
  session.userId = existingUser.id;
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
