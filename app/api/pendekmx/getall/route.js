import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/utils/sessionSecret';
import { getIronSession } from 'iron-session';

export async function GET() {
  const session = await getIronSession(cookies(), sessionOptions);

  if (session.isLoggedIn !== true) {
    return Response.json({ error: 'Not logged in' }, { status: 401 });
  }

  const prisma = new PrismaClient();

  try {
    const pageSize = 10;
    const page = 1;

    const skip = pageSize * (page - 1);

    const codes = await prisma.code.findMany({
      where: {
        belongsTo: {
          username: session.username,
        },
      },
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        urls: true,
      },
    });

    const totalCodes = await prisma.code.count({
      where: {
        belongsTo: {
          username: session.username,
        },
      },
    });

    return Response.json({ codes, totalCodes });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to get codes' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
