import { Mock, beforeEach, describe, expect, it, vi } from 'vitest'

import { prismaMock } from '../../test/prismaMock'
import { videoCacheReset } from '../lib/videoCacheReset'

import { fixUnderscoreVideoTitles } from './fix-underscore-video-titles'

vi.mock('../lib/videoCacheReset', () => ({
  videoCacheReset: vi.fn()
}))

const mockedVideoCacheReset = videoCacheReset as unknown as Mock

describe('fixUnderscoreVideoTitles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rewrites a title that still matches the known bad value', async () => {
    prismaMock.videoTitle.findUniqueOrThrow
      .mockResolvedValueOnce({ id: 'title-1', value: 'Brand_Video' } as never)
      .mockResolvedValueOnce({
        id: 'title-2',
        value: 'La_Busqueda_La Recherche\n'
      } as never)

    const results = await fixUnderscoreVideoTitles()

    expect(results).toEqual([
      { videoId: '2_0-Brand_Video', languageId: '529', updated: true },
      {
        videoId: '2_0-La_Busqueda_The_Search',
        languageId: '496',
        updated: true
      }
    ])
    expect(prismaMock.videoTitle.update).toHaveBeenCalledWith({
      where: { id: 'title-1' },
      data: { value: 'Brand Video' }
    })
    expect(prismaMock.videoTitle.update).toHaveBeenCalledWith({
      where: { id: 'title-2' },
      data: { value: 'La Búsqueda - La Recherche' }
    })
    expect(mockedVideoCacheReset).toHaveBeenCalledWith('2_0-Brand_Video')
    expect(mockedVideoCacheReset).toHaveBeenCalledWith(
      '2_0-La_Busqueda_The_Search'
    )
  })

  it('is a no-op once a title has already been fixed', async () => {
    prismaMock.videoTitle.findUniqueOrThrow.mockResolvedValue({
      id: 'title-1',
      value: 'Brand Video'
    } as never)

    const results = await fixUnderscoreVideoTitles()

    expect(results.every((r) => !r.updated)).toBe(true)
    expect(prismaMock.videoTitle.update).not.toHaveBeenCalled()
    expect(mockedVideoCacheReset).not.toHaveBeenCalled()
  })
})
