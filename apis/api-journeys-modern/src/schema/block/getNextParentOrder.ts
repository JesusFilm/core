import { prisma } from '@core/prisma/journeys/client'

export async function getNextParentOrder(
  journeyId: string,
  parentBlockId: string
) {
  const siblings = await prisma.block.findMany({
    where: {
      journeyId,
      parentBlockId,
      deletedAt: null,
      parentOrder: { not: null }
    },
    orderBy: { parentOrder: 'desc' },
    take: 1
  })

  return (siblings[0]?.parentOrder ?? -1) + 1
}
