import { prisma } from '@/utils/prismaClient';
import { generateUniqueCode } from '@/utils/codeChecker.js';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return Response.json({ message: 'No content sent' }, { status: 400 });
  }

  try {
    const codeEntry = await prisma.code.findUnique({
      where: { code },
      include: { urls: true },
    });

    if (!codeEntry) {
      return Response.json({ message: 'Code not found' }, { status: 404 });
    }

    await prisma.code.update({
      where: { code },
      data: { timesClicked: { increment: 1 } },
    });

    return Response.json(codeEntry);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  const formData = await request.formData();
  const entries = [...formData.entries()];
  const urls = entries
    .filter(([key]) => key.startsWith('url'))
    .map(([, value]) => value);
  const tags = entries
    .filter(([key]) => key.startsWith('tag'))
    .map(([, value]) => value);

  if (!urls.length) {
    return Response.json({ message: 'No urls provided' }, { status: 400 });
  }

  try {
    const code = await generateUniqueCode();

    const shortLink = await prisma.code.create({
      data: {
        code,
        isMultiple: urls.length > 1,
        urls: {
          create: urls.map((url, index) => ({
            url,
            tag: tags[index] || null,
          })),
        },
      },
    });

    return Response.json(shortLink);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
