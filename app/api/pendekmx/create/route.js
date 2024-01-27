import { prisma } from '@/utils/prismaClient';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/utils/sessionSecret';
import { getIronSession } from 'iron-session';

export async function POST(request) {
  try {
    const session = await getIronSession(cookies(), sessionOptions);

    if (session.isLoggedIn !== true) {
      return Response.json({ message: 'Not logged in' }, { status: 401 });
    }

    const formData = await request.formData();
    const entries = [...formData.entries()];

    const code = formData.get('code');
    const urls = entries
      .filter(([key]) => key.startsWith('url'))
      .map(([, value]) => value);
    const tags = entries
      .filter(([key]) => key.startsWith('tag'))
      .map(([, value]) => value);

    const rejectCriteria = (urls, code) => {
      if (urls.some((url) => !url)) {
        return true;
      }

      if (code.match(/[^a-zA-Z0-9]|^(dashboard|login|signup|api)$/i)) {
        return true;
      }

      if (code.length < 4) {
        return true;
      }

      if (code.length > 25) {
        return true;
      }

      if (code.match(/\s/)) {
        return true;
      }

      return false;
    };

    if (rejectCriteria(urls, code)) {
      return Response.json({ message: 'Bad Request' }, { status: 400 });
    }

    const existingCode = await prisma.code.findUnique({
      where: {
        code: code,
      },
    });

    if (existingCode) {
      return Response.json({ message: 'Code already taken' }, { status: 400 });
    }

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
