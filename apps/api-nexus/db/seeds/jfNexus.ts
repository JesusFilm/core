import { PrismaClient } from '.prisma/api-nexus-client';

const prisma = new PrismaClient();

export async function jfNexus(): Promise<void> {
  await prisma.nexus.upsert({
    where: { id: 'jf-nexus' },
    update: {},
    create: {
      id: 'jf-nexus',
      name: 'Jesus Film Project',
      description: 'A Jesus Film Peoject Nexus',
    },
  });
}
