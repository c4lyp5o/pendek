import { prisma } from '@/utils/prismaClient';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/utils/sessionSecret';
import { getIronSession } from 'iron-session';

export async function GET(request, context) {
  const session = await getIronSession(cookies(), sessionOptions);

  if (!session.isLoggedIn) {
    return Response.json({ message: 'Not logged in' }, { status: 401 });
  }

  try {
    const { code } = context.params;
    const singleCode = await prisma.code.findUnique({
      where: {
        code,
        belongsTo: { username: session.username },
      },
      include: {
        urls: true,
      },
    });

    if (!singleCode) {
      return Response.json({ message: 'Code not found' }, { status: 404 });
    }

    return Response.json(singleCode);
  } catch (error) {
    return Response.json({ message: 'Failed to get code' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(request, context) {
  const session = await getIronSession(cookies(), sessionOptions);

  if (session.isLoggedIn !== true) {
    return Response.json({ message: 'Not logged in' }, { status: 401 });
  }

  const id = parseInt(context.params.code); // sbb dlm route dah declare [code]. sbnrnya isi dia id
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

  const currentCode = await prisma.code.findUnique({
    where: {
      id,
    },
  });

  const existingCode = await prisma.code.findUnique({
    where: {
      code,
    },
  });

  if (existingCode && existingCode.code !== currentCode.code) {
    return Response.json({ message: 'Code already taken' }, { status: 400 });
  }

  try {
    const shortLink = await prisma.code.update({
      where: { id: id },
      data: {
        code: code,
        belongsTo: { connect: { username: session.username } },
        isMultiple: urls.length > 1,
        urls: {
          deleteMany: {
            codeId: { equals: id },
          },
          create: urls.map((url, index) => ({
            url,
            tag: ['undefined', 'null'].includes(tags[index])
              ? null
              : tags[index],
          })),
        },
      },
    });

    return Response.json({ message: 'Link updated' });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request, context) {
  const session = await getIronSession(cookies(), sessionOptions);

  if (session.isLoggedIn !== true) {
    return Response.json({ message: 'Not logged in' }, { status: 401 });
  }

  const code = context.params.code;

  if (!code) {
    return Response.json({ message: 'No code provided' }, { status: 400 });
  }

  try {
    const codeExists = await prisma.code.findUnique({
      where: {
        code,
        belongsTo: { username: session.username },
      },
    });

    if (!codeExists) {
      return Response.json({ message: 'Code not found' }, { status: 404 });
    }

    await prisma.url.deleteMany({
      where: {
        code: {
          code,
        },
      },
    });

    await prisma.code.delete({
      where: {
        code,
      },
    });

    return Response.json({ message: 'Link deleted' });
  } catch (error) {
    return Response.json(
      { message: 'Failed to delete shortlink' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
