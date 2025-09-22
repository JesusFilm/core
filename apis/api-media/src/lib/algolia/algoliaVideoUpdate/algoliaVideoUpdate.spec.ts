import { Logger } from 'pino'

import { prismaMock } from '../../../../test/prismaMock'

import { updateVideoInAlgolia } from './algoliaVideoUpdate'

// Mock the algolia client helper
jest.mock('../algoliaClient', () => ({
  getAlgoliaClient: jest.fn()
}))

// Mock the languages helper
jest.mock('../languages', () => ({
  getLanguages: jest.fn()
}))

describe('algoliaVideoUpdate', () => {
  const saveObjectsSpy = jest
    .fn()
    .mockResolvedValue([{ taskID: 'test-task-123' }])

  const mockAlgoliaClient = {
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
    process.env.ALGOLIA_INDEX_VIDEOS = 'test-videos'
    process.env.CLOUDFLARE_IMAGE_ACCOUNT = 'test-account'

    // Reset the spy mock return values
    saveObjectsSpy.mockResolvedValue([{ taskID: 'test-task-123' }])

    getAlgoliaClient.mockResolvedValue(mockAlgoliaClient)
    getLanguages.mockResolvedValue(mockLanguages)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should skip update when algolia client is null', async () => {
    getAlgoliaClient.mockResolvedValueOnce(null)

    await updateVideoInAlgolia('test-video-id', mockLogger)

    expect(mockLogger.warn).toHaveBeenCalledWith(
      'algolia client not found, skipping update'
    )
    expect(saveObjectsSpy).not.toHaveBeenCalled()
  })

  it('should warn when video is not found', async () => {
    prismaMock.video.findUnique.mockResolvedValueOnce(null)

    await updateVideoInAlgolia('non-existent-video', mockLogger)

    expect(mockLogger.warn).toHaveBeenCalledWith(
      'video non-existent-video not found'
    )
    expect(saveObjectsSpy).not.toHaveBeenCalled()
  })

  it('should successfully update video in algolia', async () => {
    // Mock video query
    prismaMock.video.findUnique.mockResolvedValueOnce({
      id: 'test-video-id',
      label: 'segment',
      primaryLanguageId: '529',
      childIds: ['child1', 'child2'],
      restrictDownloadPlatforms: [],
      published: true,
      restrictViewPlatforms: [],
      title: [
        { value: 'Test Video Title', languageId: '529' },
        { value: 'Test Video Title ZH', languageId: '21754' }
      ],
      description: [{ value: 'Test description', languageId: '529' }],
      studyQuestions: [
        { value: 'Question 1?', languageId: '529' },
        { value: 'Question 2?', languageId: '529' }
      ],
      bibleCitation: [
        {
          osisId: 'Gen',
          chapterStart: 1,
          verseStart: 1,
          chapterEnd: null,
          verseEnd: null
        }
      ],
      keywords: [{ value: 'creation' }, { value: 'genesis' }],
      images: [
        { id: 'banner-image-id', aspectRatio: 'banner' },
        { id: 'hd-image-id', aspectRatio: 'hd' }
      ],
      availableLanguages: ['529', '3934'],
      variants: [
        {
          published: true,
          hls: 'https://example.com/video.m3u8',
          lengthInMilliseconds: 120000,
          downloadable: true,
          downloads: [
            { quality: 'low', size: 1000000 },
            { quality: 'high', size: 5000000 }
          ]
        }
      ]
    } as any)

    await updateVideoInAlgolia('test-video-id', mockLogger)

    expect(saveObjectsSpy).toHaveBeenCalledWith({
      indexName: 'test-videos',
      objects: [
        expect.objectContaining({
          objectID: 'test-video-id',
          mediaComponentId: 'test-video-id',
          componentType: 'content',
          subType: 'segment',
          contentType: 'video',
          lengthInMilliseconds: 120000,
          published: true,
          restrictViewPlatforms: [],
          hasAvailableLanguages: true,
          titles: [
            { value: 'Test Video Title', languageId: '529', bcp47: 'en' },
            {
              value: 'Test Video Title ZH',
              languageId: '21754',
              bcp47: 'zh-Hans'
            }
          ],
          descriptions: [
            { value: 'Test description', languageId: '529', bcp47: 'en' }
          ],
          studyQuestions: [
            {
              value: ['Question 1?', 'Question 2?'],
              languageId: '529',
              bcp47: 'en'
            }
          ],
          keywords: ['creation', 'genesis'],
          isDownloadable: true,
          downloadSizes: {
            approximateSmallDownloadSizeInBytes: 1000000,
            approximateLargeDownloadSizeInBytes: 5000000
          },
          primaryLanguageId: 529,
          bibleCitations: [
            {
              osisBibleBook: 'Gen',
              chapterStart: 1,
              verseStart: 1,
              chapterEnd: null,
              verseEnd: null
            }
          ],
          containsCount: 2,
          imageUrls: {
            thumbnail:
              'https://imagedelivery.net/test-account/hd-image-id/f=jpg,w=120,h=68,q=95',
            videoStill:
              'https://imagedelivery.net/test-account/hd-image-id/f=jpg,w=1920,h=1080,q=95',
            mobileCinematicHigh:
              'https://imagedelivery.net/test-account/banner-image-id/f=jpg,w=1280,h=600,q=95',
            mobileCinematicLow:
              'https://imagedelivery.net/test-account/banner-image-id/f=jpg,w=640,h=300,q=95',
            mobileCinematicVeryLow:
              'https://imagedelivery.net/test-account/banner-image-id/f=webp,w=640,h=300,q=50'
          }
        })
      ],
      waitForTasks: true
    })

    expect(mockLogger.info).toHaveBeenCalledWith(
      'Successfully saved to Algolia. Tasks: test-task-123'
    )
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Record test-video-id is now available in index test-videos'
    )
  })

  it('should handle collection/series videos correctly', async () => {
    // Mock video query for collection
    prismaMock.video.findUnique.mockResolvedValueOnce({
      id: 'collection-id',
      label: 'collection',
      primaryLanguageId: '529',
      childIds: [],
      restrictDownloadPlatforms: [],
      published: true,
      restrictViewPlatforms: [],
      title: [{ value: 'Test Collection', languageId: '529' }],
      description: [],
      studyQuestions: [],
      bibleCitation: [],
      keywords: [],
      images: [],
      availableLanguages: [],
      variants: [
        {
          published: false,
          hls: null,
          lengthInMilliseconds: 0,
          downloadable: false,
          downloads: []
        }
      ]
    } as any)

    await updateVideoInAlgolia('collection-id', mockLogger)

    expect(saveObjectsSpy).toHaveBeenCalledWith({
      indexName: 'test-videos',
      objects: [
        expect.objectContaining({
          objectID: 'collection-id',
          mediaComponentId: 'collection-id',
          componentType: 'container',
          subType: 'collection',
          contentType: 'none',
          lengthInMilliseconds: 0,
          published: true,
          restrictViewPlatforms: [],
          hasAvailableLanguages: false,
          titles: [
            { value: 'Test Collection', languageId: '529', bcp47: 'en' }
          ],
          descriptions: [],
          studyQuestions: [],
          keywords: [],
          isDownloadable: false,
          downloadSizes: {},
          primaryLanguageId: 529,
          bibleCitations: [],
          containsCount: 0,
          imageUrls: {
            thumbnail: null,
            videoStill: null,
            mobileCinematicHigh: null,
            mobileCinematicLow: null,
            mobileCinematicVeryLow: null
          }
        })
      ],
      waitForTasks: true
    })
  })

  it('should handle videos with arclight restriction', async () => {
    prismaMock.video.findUnique.mockResolvedValueOnce({
      id: 'restricted-video',
      label: 'segment',
      primaryLanguageId: '529',
      childIds: [],
      restrictDownloadPlatforms: [],
      restrictViewPlatforms: ['arclight'],
      title: [{ value: 'Restricted Video', languageId: '529' }],
      description: [],
      studyQuestions: [],
      bibleCitation: [],
      keywords: [],
      images: [],
      published: true,
      availableLanguages: [],
      variants: [
        {
          published: true,
          hls: 'https://example.com/video.m3u8',
          lengthInMilliseconds: 60000,
          downloadable: false,
          downloads: []
        }
      ]
    } as any)

    await updateVideoInAlgolia('restricted-video', mockLogger)

    expect(saveObjectsSpy).toHaveBeenCalledWith({
      indexName: 'test-videos',
      objects: [
        expect.objectContaining({
          hasAvailableLanguages: false,
          restrictViewPlatforms: ['arclight'],
          published: true
        })
      ],
      waitForTasks: true
    })
  })

  it('should handle errors gracefully', async () => {
    prismaMock.video.findUnique.mockRejectedValueOnce(
      new Error('Database error')
    )

    await updateVideoInAlgolia('test-video-id', mockLogger)

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.any(Error),
      'failed to update video test-video-id in algolia'
    )
  })
})
