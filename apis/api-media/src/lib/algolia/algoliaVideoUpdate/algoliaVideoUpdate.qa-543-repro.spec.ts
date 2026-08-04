import { Logger } from 'pino'
import { vi } from 'vitest'

import { prismaMock } from '../../../../test/prismaMock'

import {
  updateVideoInAlgolia,
  updateVideoPublishedStatus
} from './algoliaVideoUpdate'

// QA-543: on-publish Algolia indexing was fire-and-forget. updateVideoInAlgolia
// and updateVideoPublishedStatus caught every error, logged it, and returned
// void — so a transient Algolia failure (timeout, rate limit, network blip)
// left the DB record published while it silently never reached the index,
// with no retry and no signal to the editor that anything had failed. This
// spec used to assert exactly that swallow-and-drop behavior; it now asserts
// the opposite — failures must propagate so the videoAlgoliaSync worker can
// catch them and let BullMQ retry the job instead of losing the write.

vi.mock('../algoliaClient', () => ({
  getAlgoliaClient: () => ({
    saveObjects: vi.fn().mockRejectedValue(new Error('Algolia unavailable')),
    partialUpdateObjects: vi
      .fn()
      .mockRejectedValue(new Error('Algolia unavailable'))
  }),
  getAlgoliaConfig: () => ({
    appId: 'test-app-id',
    apiKey: 'test-api-key',
    videosIndex: 'test-videos',
    videoVariantsIndex: 'test-video-variants'
  })
}))

vi.mock('../languages', () => ({
  getLanguages: vi.fn().mockResolvedValue({})
}))

const mockLogger: Logger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
} as any

describe('QA-543 repro: durable Algolia indexing', () => {
  const previousVideoVariantsIndex = process.env.ALGOLIA_INDEX_VIDEO_VARIANTS

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ALGOLIA_INDEX_VIDEO_VARIANTS = 'test-video-variants'
  })

  afterEach(() => {
    process.env.ALGOLIA_INDEX_VIDEO_VARIANTS = previousVideoVariantsIndex
  })

  it('propagates (does not swallow) a transient Algolia failure when updating a video record', async () => {
    prismaMock.video.findUnique.mockResolvedValueOnce({
      id: 'video-id',
      label: 'segment',
      primaryLanguageId: '529',
      childIds: [],
      published: true,
      restrictDownloadPlatforms: [],
      restrictViewPlatforms: [],
      title: [],
      description: [],
      studyQuestions: [],
      bibleCitation: [],
      keywords: [],
      images: [],
      availableLanguages: [],
      variants: []
    } as any)

    await expect(updateVideoInAlgolia('video-id', mockLogger)).rejects.toThrow(
      'Algolia unavailable'
    )

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.any(Error),
      'failed to update video video-id in algolia'
    )
  })

  it('propagates (does not swallow) a transient Algolia failure when updating variant published status', async () => {
    prismaMock.videoVariant.findMany.mockResolvedValueOnce([
      { id: 'variant-id' } as any
    ])

    await expect(
      updateVideoPublishedStatus('video-id', true, mockLogger)
    ).rejects.toThrow('Algolia unavailable')

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.any(Error),
      'failed to update video published status for video video-id'
    )
  })
})
