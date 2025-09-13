import { Logger } from 'pino'

import { prismaMock } from '../../../../test/prismaMock'

import { updateVideoVariantInAlgolia } from './algoliaVideoVariantUpdate'

// Mock the algolia client helper
jest.mock('../algoliaClient', () => ({
  getAlgoliaClient: jest.fn()
}))

// Mock the languages helper
jest.mock('../languages', () => ({
  getLanguages: jest.fn()
}))

describe('algoliaVideoVariantUpdate', () => {
  const deleteObjectSpy = jest.fn().mockResolvedValue({})
  const saveObjectsSpy = jest
    .fn()
    .mockResolvedValue([{ taskID: 'test-task-123' }])

  const mockAlgoliaClient = {
    deleteObject: deleteObjectSpy,
    saveObjects: saveObjectsSpy
  }

  const mockLanguages = {
    '529': {
      english: 'English',
      primary: 'English',
      bcp47: 'en'
    },
    '21754': {
      english: 'Chinese, Simplified',
      primary: '简体中文',
      bcp47: 'zh-Hans'
    }
  }

  const mockLogger: Logger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  } as any

  // Get the mocked functions
  const { getAlgoliaClient } = require('../algoliaClient')
  const { getLanguages } = require('../languages')

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.ALGOLIA_INDEX_VIDEO_VARIANTS = 'test-video-variants'
    process.env.CLOUDFLARE_IMAGE_ACCOUNT = 'test-account'

    // Reset the spy mock return values
    saveObjectsSpy.mockResolvedValue([{ taskID: 'test-task-123' }])
    deleteObjectSpy.mockResolvedValue({})

    getAlgoliaClient.mockResolvedValue(mockAlgoliaClient)
    getLanguages.mockResolvedValue(mockLanguages)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should skip update when algolia client is null', async () => {
    getAlgoliaClient.mockResolvedValueOnce(null)

    await updateVideoVariantInAlgolia('test-variant-id', mockLogger)

    expect(mockLogger.warn).toHaveBeenCalledWith(
      'algolia client not found, skipping update'
    )
    expect(saveObjectsSpy).not.toHaveBeenCalled()
  })

  it('should successfully update video variant in algolia', async () => {
    prismaMock.videoVariant.findUnique.mockResolvedValueOnce({
      id: 'test-variant-id',
      videoId: 'test-video-id',
      published: true,
      duration: 120,
      languageId: '529',
      edition: 'base',
      slug: 'test-slug',
      video: {
        label: 'segment',
        childIds: ['child1', 'child2'],
        published: true,
        restrictViewPlatforms: [],
        title: [
          { value: 'Test Video Title', languageId: '529' },
          { value: 'Test Video Title ZH', languageId: '21754' }
        ],
        description: [{ value: 'Test description', languageId: '529' }],
        imageAlt: [{ value: 'Test alt text', languageId: '529' }],
        snippet: [],
        subtitles: [
          { edition: 'base', languageId: '529' },
          { edition: 'base', languageId: '21754' },
          { edition: 'other', languageId: '529' }
        ],
        images: [{ id: 'banner-image-id', aspectRatio: 'banner' }]
      }
    } as any)

    await updateVideoVariantInAlgolia('test-variant-id', mockLogger)

    expect(saveObjectsSpy).toHaveBeenCalledWith({
      indexName: 'test-video-variants',
      objects: [
        {
          objectID: 'test-variant-id',
          videoId: 'test-video-id',
          titles: ['Test Video Title', 'Test Video Title ZH'],
          titlesWithLanguages: [
            { value: 'Test Video Title', languageId: '529' },
            { value: 'Test Video Title ZH', languageId: '21754' }
          ],
          description: ['Test description'],
          duration: 120,
          languageId: '529',
          languageEnglishName: 'English',
          languagePrimaryName: 'English',
          subtitles: ['529', '21754'],
          slug: 'test-slug',
          label: 'segment',
          published: true,
          restrictViewPlatforms: [],
          videoPublished: true,
          image:
            'https://imagedelivery.net/test-account/banner-image-id/f=jpg,w=1280,h=600,q=95',
          imageAlt: 'Test alt text',
          childrenCount: 2,
          manualRanking: 0
        }
      ],
      waitForTasks: true
    })

    expect(mockLogger.info).toHaveBeenCalledWith(
      'Successfully saved to Algolia. Tasks: test-task-123'
    )
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Record test-variant-id is now available in index test-video-variants'
    )
  })

  it('should handle video variant with non-English language', async () => {
    prismaMock.videoVariant.findUnique.mockResolvedValueOnce({
      id: 'test-variant-zh',
      videoId: 'test-video-id',
      published: true,
      duration: 120,
      languageId: '21754',
      edition: 'base',
      slug: 'test-slug-zh',
      video: {
        label: 'segment',
        childIds: [],
        published: true,
        videoPublished: true,
        restrictViewPlatforms: [],
        title: [{ value: 'Test Video Title ZH', languageId: '21754' }],
        description: [],
        imageAlt: [],
        snippet: [],
        subtitles: [],
        images: []
      }
    } as any)

    await updateVideoVariantInAlgolia('test-variant-zh', mockLogger)

    expect(saveObjectsSpy).toHaveBeenCalledWith({
      indexName: 'test-video-variants',
      objects: [
        expect.objectContaining({
          languageId: '21754',
          languageEnglishName: 'Chinese, Simplified',
          languagePrimaryName: '简体中文',
          manualRanking: 1,
          published: true,
          restrictViewPlatforms: [],
          videoPublished: true
        })
      ],
      waitForTasks: true
    })
  })

  it('should handle video variant with no image', async () => {
    prismaMock.videoVariant.findUnique.mockResolvedValueOnce({
      id: 'test-variant-no-image',
      videoId: 'test-video-id',
      published: true,
      duration: 120,
      languageId: '529',
      edition: 'base',
      slug: 'test-slug',
      video: {
        label: 'segment',
        childIds: [],
        published: true,
        videoPublished: true,
        restrictViewPlatforms: [],
        title: [{ value: 'Test Video Title', languageId: '529' }],
        description: [],
        imageAlt: [],
        snippet: [],
        subtitles: [],
        images: []
      }
    } as any)

    await updateVideoVariantInAlgolia('test-variant-no-image', mockLogger)

    expect(saveObjectsSpy).toHaveBeenCalledWith({
      indexName: 'test-video-variants',
      objects: [
        expect.objectContaining({
          image: '',
          imageAlt: ''
        })
      ],
      waitForTasks: true
    })
  })

  it('should handle errors gracefully', async () => {
    prismaMock.videoVariant.findUnique.mockRejectedValueOnce(
      new Error('Database error')
    )

    await updateVideoVariantInAlgolia('test-variant-id', mockLogger)

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.any(Error),
      'failed to update video variant test-variant-id in algolia'
    )
  })
})
