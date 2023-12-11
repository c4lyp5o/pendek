import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/utils/sessionSecret';
import { getIronSession } from 'iron-session';

export async function GET(request, context) {
  const { isLoggedIn, username } = await getIronSession(
    cookies(),
    sessionOptions
  );

  if (!isLoggedIn) {
    return Response.json({ error: 'Not logged in' }, { status: 401 });
  }

  const prisma = new PrismaClient();

  try {
    const { code } = context.params;
    const singleCode = await prisma.code.findUnique({
      where: {
        code,
        belongsTo: { username },
      },
      include: {
        urls: true,
      },
    });

    if (!singleCode) {
      return Response.json({ error: 'Code not found' }, { status: 404 });
    }

    return Response.json(singleCode);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to get code' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(request, context) {
  const session = await getIronSession(cookies(), sessionOptions);

  if (session.isLoggedIn !== true) {
    return Response.json({ error: 'Not logged in' }, { status: 401 });
  }

  const prisma = new PrismaClient();
  const id = parseInt(context.params.code);
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
    return Response.json({ error: 'No urls provided' }, { status: 400 });
  }

  try {
    const shortLink = await prisma.code.update({
      where: { id: id },
      data: {
        code: code,
        isMultiple: urls.length > 1,
        urls: {
          deleteMany: {
            codeId: { equals: id },
          },
          create: urls.map((url, index) => ({
            url,
            tag: tags[index] || null,
          })),
        },
      },
    });

    if (!shortLink) {
      return Response.json({ error: 'Code not found' }, { status: 404 });
    }

    return Response.json({ message: 'Link updated' });
  } catch (error) {
    console.error(error);
    return Response.json({ message: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request, context) {
  const session = await getIronSession(cookies(), sessionOptions);

  if (session.isLoggedIn !== true) {
    return Response.json({ error: 'Not logged in' }, { status: 401 });
  }

  const prisma = new PrismaClient();
  const code = context.params.code;

  if (!code) {
    return Response.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const deletedUrls = await prisma.url.deleteMany({
      where: {
        code: {
          code,
        },
      },
    });

    const deletedCode = await prisma.code.delete({
      where: {
        code,
      },
    });

    if (!deletedCode) {
      return Response.json({ error: 'Code not found' }, { status: 404 });
    }

    return Response.json({ message: 'Link deleted' });
  } catch (error) {
    return Response.json(
      { error: 'Failed to delete shortlink' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
