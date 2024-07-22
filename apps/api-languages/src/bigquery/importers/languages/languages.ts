import { prisma } from '../../../lib/prisma'

export async function getExistingPrismaLanguageIds(): Promise<string[]> {
  const prismaLangages = await prisma.language.findMany({
    select: {
      id: true
    }
  })
  return prismaLangages.map(({ id }) => id)
}
