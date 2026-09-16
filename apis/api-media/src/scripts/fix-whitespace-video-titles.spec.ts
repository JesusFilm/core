import { Mock, beforeEach, describe, expect, it, vi } from 'vitest'

import { prismaMock } from '../../test/prismaMock'
import { videoCacheReset } from '../lib/videoCacheReset'

import { fixWhitespaceVideoTitles } from './fix-whitespace-video-titles'

vi.mock('../lib/videoCacheReset', () => ({
  videoCacheReset: vi.fn()
}))

const mockedVideoCacheReset = videoCacheReset as unknown as Mock

describe('fixWhitespaceVideoTitles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('trims every title with leading or trailing whitespace and invalidates each touched video once', async () => {
    prismaMock.videoTitle.findMany.mockResolvedValue([
      { id: 'title-1', videoId: 'video-1', value: ' Praying Hands ' },
      { id: 'title-2', videoId: 'video-1', value: 'Betende Hände\n' },
      { id: 'title-3', videoId: 'video-2', value: 'Clean Title' }
    ] as never)

    const result = await fixWhitespaceVideoTitles()

    expect(result).toEqual({
      scanned: 3,
      updated: 2,
      videoIdsInvalidated: ['video-1']
    })
    expect(prismaMock.videoTitle.update).toHaveBeenCalledWith({
      where: { id: 'title-1' },
      data: { value: 'Praying Hands' }
    })
    expect(prismaMock.videoTitle.update).toHaveBeenCalledWith({
      where: { id: 'title-2' },
      data: { value: 'Betende Hände' }
    })
    expect(prismaMock.videoTitle.update).not.toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'title-3' } })
    )
    expect(mockedVideoCacheReset).toHaveBeenCalledTimes(1)
    expect(mockedVideoCacheReset).toHaveBeenCalledWith('video-1')
  })

  it('is a no-op when nothing has stray whitespace', async () => {
    prismaMock.videoTitle.findMany.mockResolvedValue([
      { id: 'title-1', videoId: 'video-1', value: 'Clean Title' }
    ] as never)

    const result = await fixWhitespaceVideoTitles()

    expect(result).toEqual({ scanned: 1, updated: 0, videoIdsInvalidated: [] })
    expect(prismaMock.videoTitle.update).not.toHaveBeenCalled()
    expect(mockedVideoCacheReset).not.toHaveBeenCalled()
  })
})
