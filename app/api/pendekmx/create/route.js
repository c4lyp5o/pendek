import { prisma } from '@/utils/prismaClient';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/utils/sessionSecret';
import { getIronSession } from 'iron-session';

export async function POST(request) {
  const session = await getIronSession(cookies(), sessionOptions);

  if (session.isLoggedIn !== true) {
    return Response.json({ message: 'Not logged in' }, { status: 401 });
  }

  const formData = await request.formData();
  const entries = [...formData.entries()];

  const code = entries.find(([key]) => key === 'code')?.[1];
  const urls = entries
    .filter(([key]) => key.startsWith('url'))
    .map(([, value]) => value);
  const tags = entries
    .filter(([key]) => key.startsWith('tag'))
    .map(([, value]) => value);

  if (!urls.length) {
    return Response.json({ message: 'No urls provided' }, { status: 400 });
  }

  const existingCode = await prisma.code.findUnique({
    where: {
      code,
    },
  });

  if (existingCode) {
    return Response.json({ message: 'Code already taken' }, { status: 400 });
  }

  try {
    await prisma.code.create({
      data: {
        code: code,
        isMultiple: urls.length > 1,
        belongsTo: {
          connect: {
            username: session.username,
          },
        },
        urls: {
          create: urls.map((url, index) => ({
            url,
            tag: tags[index] || null,
          })),
        },
      },
    });

    return Response.json({ message: 'Link created' });
  } catch (error) {
    console.error(error);
    return Response.json({ message: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
