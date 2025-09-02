import { PrismaClient } from '.prisma/api-journeys-client'

const prisma = new PrismaClient()

export async function formBlocksDelete(): Promise<void> {
  const blocks = await prisma.block.findMany({
    where: { typename: 'FormBlock' }
  })

  await prisma.block.deleteMany({
    where: { id: { in: blocks.map((block) => block.id) } }
  })

  async function updateSiblings(block): Promise<void> {
    const siblings = await prisma.block.findMany({
      where: {
        journeyId: block.journeyId,
        parentBlockId: block.parentBlockId,
        parentOrder: { not: null },
        deletedAt: null
      },
      orderBy: { parentOrder: 'asc' },
      include: { action: true }
    })

    await Promise.all(
      siblings.map(
        async (block, parentOrder) =>
          await prisma.block.update({
            where: { id: block.id },
            data: { parentOrder },
            include: { action: true }
          })
      )
    )
  }

  await Promise.all(blocks.map(async (block) => await updateSiblings(block)))
}
