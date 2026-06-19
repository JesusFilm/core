import { type Mock, vi } from 'vitest'

import { Block } from '@core/prisma/journeys/client'

import { getBlockContent } from './getBlockContent'
import { getCardBlocksContent } from './getCardBlocksContent'
import { getCoverBlockContent } from './getCoverBlockContent'

vi.mock('./getBlockContent', () => ({
  getBlockContent: vi.fn()
}))
vi.mock('./getCoverBlockContent', () => ({
  getCoverBlockContent: vi.fn()
}))

describe('getCardBlocksContent', () => {
  const cardBlock: Partial<Block> = {
    id: 'card1',
    typename: 'CardBlock',
    coverBlockId: 'cover1'
  }
  const coverBlock: Partial<Block> = {
    id: 'cover1',
    typename: 'ImageBlock',
    parentBlockId: 'card1'
  }
  const child1: Partial<Block> = {
    id: 'child1',
    typename: 'TypographyBlock',
    parentBlockId: 'card1',
    parentOrder: 1
  }
  const child2: Partial<Block> = {
    id: 'child2',
    typename: 'ButtonBlock',
    parentBlockId: 'card1',
    parentOrder: 0
  }
  const blocks: Block[] = [
    cardBlock as Block,
    coverBlock as Block,
    child1 as Block,
    child2 as Block
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(getBlockContent as Mock).mockImplementation(
      async ({ block }) => `block:${block.id}`
    )
    ;(getCoverBlockContent as Mock).mockResolvedValue('cover-content\n')
  })

  it('returns card content with cover and children, ordered by parentOrder', async () => {
    const result = await getCardBlocksContent({
      blocks,
      cardBlocks: [cardBlock as Block]
    })
    expect(getCoverBlockContent).toHaveBeenCalledWith({ blocks, coverBlock })
    // Should skip the card block itself
    expect(getBlockContent).toHaveBeenCalledWith({ blocks, block: child2 })
    expect(getBlockContent).toHaveBeenCalledWith({ blocks, block: child1 })
    // Children should be ordered by parentOrder (child2 first)
    expect(result[0]).toContain('cover-content')
    // Instead of /s flag, check order with indexOf
    const idxChild2 = result[0].indexOf('block:child2')
    const idxChild1 = result[0].indexOf('block:child1')
    expect(idxChild2).toBeLessThan(idxChild1)
    expect(result[0]).toContain(`# Card`)
    expect(result[0]).toContain('- Card ID: card1')
  })

  it('returns card content without cover if no coverBlockId', async () => {
    const cardNoCover = {
      ...cardBlock,
      coverBlockId: undefined
    } as unknown as Block
    const result = await getCardBlocksContent({
      blocks,
      cardBlocks: [cardNoCover]
    })
    expect(getCoverBlockContent).not.toHaveBeenCalled()
    expect(result[0]).toContain(`# Card`)
    expect(result[0]).toContain('- Card ID: card1')
  })

  it('does not leak per-card showAssistant / expandChatByDefault into translation context', async () => {
    const cardWithChatFlags = {
      ...cardBlock,
      showAssistant: true,
      expandChatByDefault: true
    } as Block
    const result = await getCardBlocksContent({
      blocks: [cardWithChatFlags, coverBlock as Block, child1 as Block],
      cardBlocks: [cardWithChatFlags]
    })
    expect(result[0]).not.toContain('showAssistant')
    expect(result[0]).not.toContain('expandChatByDefault')
  })

  it('returns content for multiple cards', async () => {
    const card2 = { id: 'card2', typename: 'CardBlock' } as Block
    const blocks2 = [
      cardBlock as Block,
      card2,
      coverBlock as Block,
      child1 as Block,
      child2 as Block
    ]
    const result = await getCardBlocksContent({
      blocks: blocks2,
      cardBlocks: [cardBlock as Block, card2]
    })
    expect(result).toHaveLength(2)
    expect(result[0]).toContain('- Card ID: card1')
    expect(result[1]).toContain('- Card ID: card2')
  })
})
