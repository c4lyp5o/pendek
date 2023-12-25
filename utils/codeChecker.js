import { prisma } from './prismaClient';
import { nanoid } from 'nanoid';

export async function generateUniqueCode() {
  let code;
  let codeEntry;

  do {
    code = nanoid(7);
    codeEntry = await prisma.code.findUnique({
      where: { code },
    });
  } while (codeEntry);

  await prisma.$disconnect();
  return code;
}
