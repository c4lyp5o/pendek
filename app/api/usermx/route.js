import { prisma } from '@/utils/prismaClient';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { defaultSession, sessionOptions, sleep } from '@/utils/sessionSecret';
import { getIronSession } from 'iron-session';

export async function GET(request) {
  try {
    const session = await getIronSession(cookies(), sessionOptions);

    await sleep(500);

    if (session.isLoggedIn !== true) {
      return Response.json(defaultSession);
    }

    return Response.json(session);
  } catch (error) {
    console.error(error);
    return Response.json({ message: 'Failed to get session' }, { status: 500 });
  }
}

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

    return Response.json(session);
  } catch (error) {
    console.error(error);
    return Response.json({ message: 'Failed to login' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getIronSession(cookies(), sessionOptions);

    session.destroy();

    await sleep(500);

    return Response.json({ message: 'Logged out' });
  } catch (error) {
    console.error(error);
    return Response.json({ message: 'Failed to logout' }, { status: 500 });
  }
}
