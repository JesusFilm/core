import { type Mock, vi } from 'vitest'

import { Block } from '@core/prisma/journeys/client'
import { getImageDescription } from '@core/shared/ai/getImageDescription'

import { getImageBlockContent } from './getImageBlockContent'

vi.mock('@core/shared/ai/getImageDescription', () => ({
  getImageDescription: vi.fn()
}))

describe('getImageBlockContent', () => {
  const baseBlock: Partial<Block> = { id: 'block1', typename: 'ImageBlock' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns description if src is present and getImageDescription returns value', async () => {
    ;(getImageDescription as Mock).mockResolvedValue('desc')
    const block = { ...baseBlock, src: 'url' } as Block
    const result = await getImageBlockContent({ block })
    expect(getImageDescription).toHaveBeenCalledWith({ imageUrl: 'url' })
    expect(result).toContain('## Image:')
    expect(result).toContain('- Block ID: block1')
    expect(result).toContain('- Description: desc')
  })

  it('returns no info if src is present but getImageDescription returns falsy', async () => {
    ;(getImageDescription as Mock).mockResolvedValue('')
    const block = { ...baseBlock, src: 'url' } as Block
    const result = await getImageBlockContent({ block })
    expect(getImageDescription).toHaveBeenCalledWith({ imageUrl: 'url' })
    expect(result).toContain('## Image:')
    expect(result).toContain('- Block ID: block1')
    expect(result).toContain('No infomation is available for this image')
  })

  it('returns no info if src is missing', async () => {
    const block = { ...baseBlock, src: null } as unknown as Block
    const result = await getImageBlockContent({ block })
    expect(getImageDescription).not.toHaveBeenCalled()
    expect(result).toContain('## Image:')
    expect(result).toContain('- Block ID: block1')
    expect(result).toContain('No infomation is available for this image')
  })

  it('uses Background Image label if isCoverBlock is true', async () => {
    ;(getImageDescription as Mock).mockResolvedValue('desc')
    const block = { ...baseBlock, src: 'url' } as Block
    const result = await getImageBlockContent({ block, isCoverBlock: true })
    expect(result).toContain('## Background Image:')
    expect(result).toContain('- Description: desc')
  })

  it('uses Image label if isCoverBlock is false', async () => {
    ;(getImageDescription as Mock).mockResolvedValue('desc')
    const block = { ...baseBlock, src: 'url' } as Block
    const result = await getImageBlockContent({ block, isCoverBlock: false })
    expect(result).toContain('## Image:')
    expect(result).toContain('- Description: desc')
  })
})
