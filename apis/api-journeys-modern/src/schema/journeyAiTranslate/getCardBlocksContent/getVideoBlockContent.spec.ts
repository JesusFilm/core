import { type Mock, vi } from 'vitest'

import { Block } from '@core/prisma/journeys/client'
import { getImageDescription } from '@core/shared/ai/getImageDescription'

import { getVideoBlockContent } from './getVideoBlockContent'

vi.mock('@core/shared/ai/getImageDescription', () => ({
  getImageDescription: vi.fn()
}))

describe('getVideoBlockContent', () => {
  const videoBlock: Partial<Block> = {
    id: 'vid1',
    typename: 'VideoBlock',
    posterBlockId: 'poster1'
  }
  const posterBlock: Partial<Block> = {
    id: 'poster1',
    typename: 'ImageBlock',
    src: 'poster-url'
  }
  const blocks: Block[] = [videoBlock as Block, posterBlock as Block]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns description if poster block exists with src and getImageDescription returns value', async () => {
    ;(getImageDescription as Mock).mockResolvedValue('desc')
    const result = await getVideoBlockContent({
      blocks,
      block: videoBlock as Block
    })
    expect(getImageDescription).toHaveBeenCalledWith({ imageUrl: 'poster-url' })
    expect(result).toContain('## Video:')
    expect(result).toContain('- Description: desc')
  })

  it('returns "No description given" if getImageDescription returns falsy', async () => {
    ;(getImageDescription as Mock).mockResolvedValue('')
    const result = await getVideoBlockContent({
      blocks,
      block: videoBlock as Block
    })
    expect(result).toContain('## Video:')
    expect(result).toContain('- Description: No description given')
  })

  it('returns "No description given" if getImageDescription throws', async () => {
    ;(getImageDescription as Mock).mockRejectedValue(new Error('fail'))
    const result = await getVideoBlockContent({
      blocks,
      block: videoBlock as Block
    })
    expect(result).toContain('## Video:')
    expect(result).toContain('- Description: No description given')
  })

  it('returns "No description given" if poster block is missing', async () => {
    const result = await getVideoBlockContent({
      blocks: [videoBlock as Block],
      block: videoBlock as Block
    })
    expect(result).toContain('## Video:')
    expect(result).toContain('- Description: No description given')
  })

  it('returns "No description given" if poster block has no src', async () => {
    const noSrcPoster = {
      id: 'poster1',
      typename: 'ImageBlock',
      src: null
    } as unknown as Block
    const blocksWithNoSrc = [videoBlock as Block, noSrcPoster]
    const result = await getVideoBlockContent({
      blocks: blocksWithNoSrc,
      block: videoBlock as Block
    })
    expect(result).toContain('## Video:')
    expect(result).toContain('- Description: No description given')
  })

  it('uses Background Video label if isCoverBlock is true', async () => {
    ;(getImageDescription as Mock).mockResolvedValue('desc')
    const result = await getVideoBlockContent({
      blocks,
      block: videoBlock as Block,
      isCoverBlock: true
    })
    expect(result).toContain('## Background Video:')
    expect(result).toContain('- Description: desc')
  })

  it('uses Video label if isCoverBlock is false', async () => {
    ;(getImageDescription as Mock).mockResolvedValue('desc')
    const result = await getVideoBlockContent({
      blocks,
      block: videoBlock as Block,
      isCoverBlock: false
    })
    expect(result).toContain('## Video:')
    expect(result).toContain('- Description: desc')
  })
})
