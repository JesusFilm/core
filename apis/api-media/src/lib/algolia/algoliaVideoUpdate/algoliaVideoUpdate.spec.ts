import { Logger } from 'pino'
import { vi } from 'vitest'

import { prismaMock } from '../../../../test/prismaMock'
import { getLanguages } from '../languages'

import { updateVideoInAlgolia } from './algoliaVideoUpdate'

const saveObjectsSpy = vi.fn()
const deleteObjectsSpy = vi.fn()

// Mock the algolia client helper
vi.mock('../algoliaClient', () => ({
  getAlgoliaClient: () => ({
    saveObjects: saveObjectsSpy,
    deleteObjects: deleteObjectsSpy
  }),
  getAlgoliaConfig: () => ({
    appId: 'test-app-id',
    apiKey: 'test-api-key',
    videosIndex: 'test-videos',
    videoVariantsIndex: 'test-video-variants'
  })
}))

// Mock the languages helper
vi.mock('../languages', () => ({
  getLanguages: vi.fn()
}))

describe('algoliaVideoUpdate', () => {
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
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  } as any

  // Get the mocked functions
  const mockedGetLanguages = vi.mocked(getLanguages)

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CLOUDFLARE_IMAGE_ACCOUNT = 'test-account'

    // Reset the spy mock return values
    saveObjectsSpy.mockResolvedValue([{ taskID: 'test-task-123' }])
    deleteObjectsSpy.mockResolvedValue([{ taskID: 'test-delete-task-123' }])

    mockedGetLanguages.mockResolvedValue(mockLanguages)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('removes the video from algolia when it no longer exists (deleted)', async () => {
    prismaMock.video.findUnique.mockResolvedValueOnce(null)

    await updateVideoInAlgolia('non-existent-video', mockLogger)

    expect(mockLogger.warn).toHaveBeenCalledWith(
      'video non-existent-video not found, removing from algolia'
    )
    expect(deleteObjectsSpy).toHaveBeenCalledWith({
      indexName: 'test-videos',
      objectIDs: ['non-existent-video'],
      waitForTasks: true
    })
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
          published: true,
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

  it.each(['collection', 'series'])(
    'reports a %s as downloadable only when its own variant has playable media and downloads',
    async (label) => {
      prismaMock.video.findUnique.mockResolvedValueOnce({
        id: 'container-id',
        label,
        primaryLanguageId: '529',
        childIds: ['child1'],
        restrictDownloadPlatforms: [],
        published: true,
        restrictViewPlatforms: [],
        title: [{ value: 'Test Container', languageId: '529' }],
        description: [],
        studyQuestions: [],
        bibleCitation: [],
        keywords: [],
        images: [],
        availableLanguages: [],
        variants: [
          {
            published: true,
            hls: 'https://example.com/container.m3u8',
            dash: '',
            lengthInMilliseconds: 1000,
            downloadable: true,
            downloads: [
              { quality: 'low', size: 1000 },
              { quality: 'high', size: 5000 }
            ]
          }
        ]
      } as any)

      await updateVideoInAlgolia('container-id', mockLogger)

      expect(saveObjectsSpy).toHaveBeenCalledWith({
        indexName: 'test-videos',
        objects: [
          expect.objectContaining({
            objectID: 'container-id',
            subType: label,
            isDownloadable: true,
            downloadSizes: {
              approximateSmallDownloadSizeInBytes: 1000,
              approximateLargeDownloadSizeInBytes: 5000
            }
          })
        ],
        waitForTasks: true
      })
    }
  )

  it.each(['collection', 'series'])(
    'classifies a %s with a DASH-only variant as content, matching isDownloadable',
    async (label) => {
      prismaMock.video.findUnique.mockResolvedValueOnce({
        id: 'dash-only-container-id',
        label,
        primaryLanguageId: '529',
        childIds: ['child1'],
        restrictDownloadPlatforms: [],
        published: true,
        restrictViewPlatforms: [],
        title: [{ value: 'Test Container', languageId: '529' }],
        description: [],
        studyQuestions: [],
        bibleCitation: [],
        keywords: [],
        images: [],
        availableLanguages: [],
        variants: [
          {
            published: true,
            hls: '',
            dash: 'https://example.com/container.mpd',
            lengthInMilliseconds: 1000,
            downloadable: true,
            downloads: [{ quality: 'low', size: 1000 }]
          }
        ]
      } as any)

      await updateVideoInAlgolia('dash-only-container-id', mockLogger)

      expect(saveObjectsSpy).toHaveBeenCalledWith({
        indexName: 'test-videos',
        objects: [
          expect.objectContaining({
            objectID: 'dash-only-container-id',
            subType: label,
            componentType: 'content',
            contentType: 'video',
            isDownloadable: true
          })
        ],
        waitForTasks: true
      })
    }
  )

  it.each(['collection', 'series'])(
    'never reports an empty %s (generated parent variant) as downloadable, even when its flag is true',
    async (label) => {
      prismaMock.video.findUnique.mockResolvedValueOnce({
        id: 'empty-container-id',
        label,
        primaryLanguageId: '529',
        childIds: ['child1'],
        restrictDownloadPlatforms: [],
        published: true,
        restrictViewPlatforms: [],
        title: [{ value: 'Empty Container', languageId: '529' }],
        description: [],
        studyQuestions: [],
        bibleCitation: [],
        keywords: [],
        images: [],
        availableLanguages: [],
        variants: [
          {
            published: true,
            hls: '',
            dash: '',
            lengthInMilliseconds: 0,
            downloadable: true,
            downloads: []
          }
        ]
      } as any)

      await updateVideoInAlgolia('empty-container-id', mockLogger)

      expect(saveObjectsSpy).toHaveBeenCalledWith({
        indexName: 'test-videos',
        objects: [
          expect.objectContaining({
            objectID: 'empty-container-id',
            subType: label,
            isDownloadable: false,
            downloadSizes: {}
          })
        ],
        waitForTasks: true
      })
    }
  )

  it.each([
    ['featureFilm', 'https://example.com/film.m3u8', ''],
    ['episode', '', 'https://example.com/episode.mpd'],
    ['segment', 'https://example.com/segment.m3u8', '']
  ])(
    'does not report a %s as downloadable when its flag is true but it has no download rows',
    async (label, hls, dash) => {
      prismaMock.video.findUnique.mockResolvedValueOnce({
        id: 'no-downloads-id',
        label,
        primaryLanguageId: '529',
        childIds: [],
        restrictDownloadPlatforms: [],
        published: true,
        restrictViewPlatforms: [],
        title: [{ value: 'No Downloads', languageId: '529' }],
        description: [],
        studyQuestions: [],
        bibleCitation: [],
        keywords: [],
        images: [],
        availableLanguages: [],
        variants: [
          {
            published: true,
            hls,
            dash,
            lengthInMilliseconds: 1000,
            downloadable: true,
            downloads: []
          }
        ]
      } as any)

      await updateVideoInAlgolia('no-downloads-id', mockLogger)

      expect(saveObjectsSpy).toHaveBeenCalledWith({
        indexName: 'test-videos',
        objects: [
          expect.objectContaining({
            objectID: 'no-downloads-id',
            subType: label,
            componentType: 'content',
            isDownloadable: false,
            downloadSizes: {}
          })
        ],
        waitForTasks: true
      })
    }
  )

  it('does not report a non-container video without playable media as downloadable', async () => {
    prismaMock.video.findUnique.mockResolvedValueOnce({
      id: 'no-media-id',
      label: 'featureFilm',
      primaryLanguageId: '529',
      childIds: [],
      restrictDownloadPlatforms: [],
      published: true,
      restrictViewPlatforms: [],
      title: [{ value: 'No Media', languageId: '529' }],
      description: [],
      studyQuestions: [],
      bibleCitation: [],
      keywords: [],
      images: [],
      availableLanguages: [],
      variants: [
        {
          published: true,
          hls: '',
          dash: '',
          lengthInMilliseconds: 0,
          downloadable: true,
          downloads: [{ quality: 'low', size: 1000 }]
        }
      ]
    } as any)

    await updateVideoInAlgolia('no-media-id', mockLogger)

    expect(saveObjectsSpy).toHaveBeenCalledWith({
      indexName: 'test-videos',
      objects: [
        expect.objectContaining({
          objectID: 'no-media-id',
          isDownloadable: false
        })
      ],
      waitForTasks: true
    })
  })

  it('reports a video as downloadable when its only download rows are above high quality', async () => {
    prismaMock.video.findUnique.mockResolvedValueOnce({
      id: 'hd-only-id',
      label: 'featureFilm',
      primaryLanguageId: '529',
      childIds: [],
      restrictDownloadPlatforms: [],
      published: true,
      restrictViewPlatforms: [],
      title: [{ value: 'HD Only', languageId: '529' }],
      description: [],
      studyQuestions: [],
      bibleCitation: [],
      keywords: [],
      images: [],
      availableLanguages: [],
      variants: [
        {
          published: true,
          hls: 'https://example.com/film.m3u8',
          dash: '',
          lengthInMilliseconds: 1000,
          downloadable: true,
          // Lowest static rendition is already 1080p, so no low/sd/high row
          // was ever created for this variant.
          downloads: [{ quality: 'fhd', size: 9000000 }]
        }
      ]
    } as any)

    await updateVideoInAlgolia('hd-only-id', mockLogger)

    expect(saveObjectsSpy).toHaveBeenCalledWith({
      indexName: 'test-videos',
      objects: [
        expect.objectContaining({
          objectID: 'hd-only-id',
          isDownloadable: true,
          downloadSizes: {
            approximateSmallDownloadSizeInBytes: 0,
            approximateLargeDownloadSizeInBytes: 0
          }
        })
      ],
      waitForTasks: true
    })
  })

  it('selects only the published English variant', async () => {
    prismaMock.video.findUnique.mockResolvedValueOnce({
      id: 'test-video-id',
      label: 'featureFilm',
      primaryLanguageId: '529',
      childIds: [],
      restrictDownloadPlatforms: [],
      published: true,
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

    await updateVideoInAlgolia('test-video-id', mockLogger)

    expect(prismaMock.video.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          variants: expect.objectContaining({
            where: { languageId: '529', published: true },
            take: 1
          })
        })
      })
    )
    // No published English variant: not downloadable, no sizes.
    expect(saveObjectsSpy).toHaveBeenCalledWith({
      indexName: 'test-videos',
      objects: [
        expect.objectContaining({
          isDownloadable: false,
          downloadSizes: {},
          componentType: 'container'
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

  it('logs and rethrows so the caller can retry', async () => {
    prismaMock.video.findUnique.mockRejectedValueOnce(
      new Error('Database error')
    )

    await expect(
      updateVideoInAlgolia('test-video-id', mockLogger)
    ).rejects.toThrow('Database error')

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.any(Error),
      'failed to update video test-video-id in algolia'
    )
  })
})
