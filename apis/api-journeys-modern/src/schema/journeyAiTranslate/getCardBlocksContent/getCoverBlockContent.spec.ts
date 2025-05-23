import { Block } from '.prisma/api-journeys-modern-client'
import { getImageDescription } from '@core/shared/ai/getImageDescription'

import { getCoverBlockContent } from './getCoverBlockContent'
import { getImageBlockContent } from './getImageBlockContent'

jest.mock('@core/shared/ai/getImageDescription', () => ({
  getImageDescription: jest.fn()
}))
jest.mock('./getImageBlockContent', () => ({
  getImageBlockContent: jest.fn()
}))

describe('getCoverBlockContent', () => {
  const imageBlock: Partial<Block> = {
    id: 'img1',
    typename: 'ImageBlock',
    src: 'img-url'
  }
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
  const blocks: Block[] = [
    imageBlock as Block,
    videoBlock as Block,
    posterBlock as Block
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('delegates to getImageBlockContent for image cover block with src', async () => {
    ;(getImageBlockContent as jest.Mock).mockResolvedValue('image-content')
    const result = await getCoverBlockContent({
      blocks,
      coverBlock: imageBlock as Block
    })
    expect(getImageBlockContent).toHaveBeenCalledWith({
      block: imageBlock,
      isCoverBlock: true
    })
    expect(result).toBe('image-content')
  })

  it('returns background video description if poster block has src and getImageDescription returns value', async () => {
    ;(getImageDescription as jest.Mock).mockResolvedValue('poster-desc')
    const result = await getCoverBlockContent({
      blocks,
      coverBlock: videoBlock as Block
    })
    expect(getImageDescription).toHaveBeenCalledWith({ imageUrl: 'poster-url' })
    expect(result).toContain('## Background Video:')
    expect(result).toContain('- Description: poster-desc')
  })

  it('returns "No description given" if getImageDescription returns falsy', async () => {
    ;(getImageDescription as jest.Mock).mockResolvedValue('')
    const result = await getCoverBlockContent({
      blocks,
      coverBlock: videoBlock as Block
    })
    expect(result).toContain('## Background Video:')
    expect(result).toContain('- Description: No description given')
  })

  it('returns "No description given" if getImageDescription throws', async () => {
    ;(getImageDescription as jest.Mock).mockRejectedValue(new Error('fail'))
    const result = await getCoverBlockContent({
      blocks,
      coverBlock: videoBlock as Block
    })
    expect(result).toContain('## Background Video:')
    expect(result).toContain('- Description: No description given')
  })

  it('returns "No description given" if poster block is missing', async () => {
    const result = await getCoverBlockContent({
      blocks,
      coverBlock: { ...videoBlock, posterBlockId: 'notfound' } as Block
    })
    expect(result).toContain('## Background Video:')
    expect(result).toContain('- Description: No description given')
  })

  it('returns "No description given" if poster block has no src', async () => {
    const noSrcPoster = {
      id: 'poster1',
      typename: 'ImageBlock',
      src: null
    } as unknown as Block
    const blocksWithNoSrc = [
      imageBlock as Block,
      videoBlock as Block,
      noSrcPoster
    ]
    const result = await getCoverBlockContent({
      blocks: blocksWithNoSrc,
      coverBlock: videoBlock as Block
    })
    expect(result).toContain('## Background Video:')
    expect(result).toContain('- Description: No description given')
  })

  it('returns empty string for unsupported block type', async () => {
    const result = await getCoverBlockContent({
      blocks,
      coverBlock: { id: 'other', typename: 'OtherBlock' } as Block
    })
    expect(result).toBe('')
  })
})
