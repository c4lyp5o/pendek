import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

function generateCode() {
  return nanoid(7);
}

export async function GET(request) {
  const prisma = new PrismaClient();
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    prisma.$disconnect();
    return NextResponse.json({ error: 'No content sent' }, { status: 400 });
  }

  try {
    const codeEntry = await prisma.code.findUnique({
      where: { code },
      include: { urls: true },
    });

    if (!codeEntry) {
      prisma.$disconnect();
      return NextResponse.json({ error: 'Code not found' }, { status: 404 });
    }

    await prisma.code.update({
      where: { code },
      data: { timesClicked: { increment: 1 } },
    });

    prisma.$disconnect();
    return NextResponse.json(codeEntry);
  } catch (error) {
    prisma.$disconnect();
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const prisma = new PrismaClient();
  const formData = await request.formData();
  const entries = [...formData.entries()];
  const urls = entries
    .filter(([key]) => key.startsWith('url'))
    .map(([, value]) => value);
  const tags = entries
    .filter(([key]) => key.startsWith('tag'))
    .map(([, value]) => value);

  if (!urls.length) {
    prisma.$disconnect();
    return NextResponse.json({ error: 'No urls provided' }, { status: 400 });
  }

  try {
    const code = generateCode();

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

    prisma.$disconnect();
    return NextResponse.json(shortLink);
  } catch (error) {
    prisma.$disconnect();
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
