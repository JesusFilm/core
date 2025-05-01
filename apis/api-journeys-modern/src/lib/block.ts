import { PrismaClient } from '.prisma/api-journeys-modern-client'

export class BlockService {
  constructor(private readonly prisma: PrismaClient) {}

  async getDuplicateChildren(
    blocks: any[],
    originalJourneyId: string,
    parentBlockId: string | null,
    isRoot = false,
    stepMap?: Map<string, string>,
    blockMap?: Map<string, string>,
    newJourneyId?: string,
    extraStepMap?: Map<string, string>
  ): Promise<any[]> {
    const result: any[] = []
    for (const block of blocks) {
      const blockWithoutId = { ...block }
      let newId = blockMap?.get(block.id)

      if (newId == null) {
        newId = stepMap?.get(block.id) ?? extraStepMap?.get(block.id)
      }

      // Set references for the duplicated block
      blockWithoutId.id = newId ?? block.id
      blockWithoutId.journeyId = newJourneyId ?? originalJourneyId

      if (parentBlockId != null) {
        blockWithoutId.parentBlockId = parentBlockId
      }

      // Add the duplicated block to the result
      result.push(blockWithoutId)

      // Recursively handle child blocks
      if (!isRoot) {
        const childBlocks = await this.prisma.block.findMany({
          where: {
            parentBlockId: block.id,
            deletedAt: null,
            journeyId: originalJourneyId
          },
          orderBy: { parentOrder: 'asc' },
          include: { action: true }
        })

        const children = await this.getDuplicateChildren(
          childBlocks,
          originalJourneyId,
          blockWithoutId.id,
          false,
          stepMap,
          blockMap,
          newJourneyId,
          extraStepMap
        )

        result.push(...children)
      }
    }
    return result
  }

  async saveAll(blocks: any[]): Promise<void> {
    await this.prisma.block.createMany({
      data: blocks
    })
  }

  async removeDescendantsOfDeletedBlocks(blocks: any[]): Promise<any[]> {
    const blockIds = new Set(blocks.map((block) => block.id))
    return blocks.filter(
      (block) =>
        block.parentBlockId == null || blockIds.has(block.parentBlockId)
    )
  }
}
