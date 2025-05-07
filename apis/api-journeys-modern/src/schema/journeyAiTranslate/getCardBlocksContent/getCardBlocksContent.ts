import { Block } from '.prisma/api-journeys-modern-client'

import { getBlockContent } from './getBlockContent'
import { getCoverBlockContent } from './getCoverBlockContent'

export async function getCardBlocksContent({
  blocks,
  cardBlocks
}: {
  blocks: Block[]
  cardBlocks: Block[]
}): Promise<string[]> {
  const cardBlocksChildren = cardBlocks.map(({ id }) =>
    blocks.filter(({ parentBlockId }) => parentBlockId === id)
  )

  const result = await Promise.all(
    cardBlocks.map(async (cardBlock, i) => {
      let cardResult = `
# Card
- Card ID: ${cardBlock.id}
`
      if (cardBlock.coverBlockId) {
        const coverBlock = cardBlocksChildren[i].find(
          (block) => block.id === cardBlock.coverBlockId
        )
        if (coverBlock) {
          cardResult += await getCoverBlockContent({
            blocks,
            coverBlock
          })
        }
      }
      const orderedBlocks = cardBlocksChildren[i].sort(
        (a, b) => (a.parentOrder ?? 0) - (b.parentOrder ?? 0)
      )
      for (let j = 0; j < orderedBlocks.length; j++) {
        const block = orderedBlocks[j]
        if (block.id === cardBlock.id) {
          continue
        }
        cardResult += await getBlockContent({
          blocks,
          block
        })
      }
      return cardResult
    })
  )

  return result
}
