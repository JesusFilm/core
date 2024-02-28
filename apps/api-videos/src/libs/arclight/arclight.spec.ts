import omit from 'lodash/omit'
import fetch, { FetchError, Response } from 'node-fetch'

import {
  ArclightMediaComponent,
  ArclightMediaComponentLanguage,
  ArclightMediaLanguage,
  Language,
  MediaComponent,
  fetchMediaLanguagesAndTransformToLanguages,
  fetchPlus,
  getArclightMediaComponentLanguages,
  getArclightMediaComponentLinks,
  getArclightMediaComponents,
  getArclightMediaLanguages,
  transformArclightMediaComponentLanguageToVideoVariant,
  transformArclightMediaComponentToVideo,
  transformArclightMediaLanguageToLanguage,
  transformMediaComponentToVideo
} from './arclight'

jest.mock('node-fetch', () => {
  const originalModule = jest.requireActual('node-fetch')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('arclight', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getArclightMediaLanguages', () => {
    it('fetches media languages from arclight', async () => {
      const request = mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () =>
          await Promise.resolve({
            _embedded: {
              mediaLanguages: []
            }
          })
      } as unknown as Response)
      await expect(getArclightMediaLanguages()).resolves.toEqual([])
      expect(request).toHaveBeenCalledWith(
        expect.stringContaining(
          'https://api.arclight.org/v2/media-languages?limit=5000&filter=default&apiKey='
        ),
        undefined
      )
    })
  })

  describe('getArclightMediaComponents', () => {
    it('fetches media components from arclight', async () => {
      const request = mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () =>
          await Promise.resolve({
            _embedded: {
              mediaComponents: []
            }
          })
      } as unknown as Response)
      await expect(getArclightMediaComponents(1)).resolves.toEqual([])
      expect(request).toHaveBeenCalledWith(
        expect.stringContaining(
          'https://api.arclight.org/v2/media-components?limit=10&isDeprecated=false&contentTypes=video&page=1&apiKey='
        ),
        undefined
      )
    })

    it('returns empty array when arclight returns overpagination error', async () => {
      const request = mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () =>
          await Promise.resolve({
            message:
              'Page [30] does not exist. Given a limit of [10] per page, value must not be greater than [29].'
          })
      } as unknown as Response)
      await expect(getArclightMediaComponents(1)).resolves.toEqual([])
      expect(request).toHaveBeenCalledWith(
        expect.stringContaining(
          'https://api.arclight.org/v2/media-components?limit=10&isDeprecated=false&contentTypes=video&page=1&apiKey='
        ),
        undefined
      )
    })
  })

  describe('getArclightMediaComponentLanguages', () => {
    it('fetches media component languages from arclight', async () => {
      const request = mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () =>
          await Promise.resolve({
            _embedded: {
              mediaComponentLanguage: []
            }
          })
      } as unknown as Response)
      await expect(
        getArclightMediaComponentLanguages('mediaComponentId')
      ).resolves.toEqual([])
      expect(request).toHaveBeenCalledWith(
        expect.stringContaining(
          'https://api.arclight.org/v2/media-components/mediaComponentId/languages?platform=android&apiKey='
        ),
        undefined
      )
    })
  })

  describe('getArclightMediaComponentLinks', () => {
    it('fetches media component links from arclight', async () => {
      const request = mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () =>
          await Promise.resolve({
            linkedMediaComponentIds: {
              contains: []
            }
          })
      } as unknown as Response)
      await expect(
        getArclightMediaComponentLinks('mediaComponentId')
      ).resolves.toEqual([])
      expect(request).toHaveBeenCalledWith(
        expect.stringContaining(
          'https://api.arclight.org/v2/media-component-links/mediaComponentId?apiKey='
        ),
        undefined
      )
    })

    it('handles null media component links from arclight', async () => {
      const request = mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () =>
          await Promise.resolve({
            linkedMediaComponentIds: {}
          })
      } as unknown as Response)
      await expect(
        getArclightMediaComponentLinks('mediaComponentId')
      ).resolves.toEqual([])
      expect(request).toHaveBeenCalledWith(
        expect.stringContaining(
          'https://api.arclight.org/v2/media-component-links/mediaComponentId?apiKey='
        ),
        undefined
      )
    })
  })

  describe('transformArclightMediaComponentLanguageToVideoVariant', () => {
    const mediaComponentLanguage: ArclightMediaComponentLanguage = {
      refId: 'refId',
      languageId: 529,
      lengthInMilliseconds: 1000,
      subtitleUrls: {
        vtt: [
          {
            languageId: 529,
            url: 'subtitleUrl529'
          },
          {
            languageId: 2048,
            url: 'subtitleUrl2048'
          }
        ]
      },
      streamingUrls: {
        hls: [
          {
            url: 'hlsUrl'
          }
        ]
      },
      downloadUrls: {
        low: {
          url: 'lowUrl',
          sizeInBytes: 1024
        },
        high: {
          url: 'highUrl',
          sizeInBytes: 1024
        }
      }
    }
    const mediaComponent: MediaComponent = {
      mediaComponentId: 'mediaComponentId',
      primaryLanguageId: 529,
      title: 'title',
      shortDescription: 'shortDescription',
      longDescription: 'longDescription',
      metadataLanguageTag: 'metadataLanguageTag',
      imageUrls: {
        mobileCinematicHigh: 'mobileCinematicHigh'
      },
      studyQuestions: [],
      subType: 'episode',
      slug: 'title'
    }
    const language: Language = {
      languageId: 529,
      bcp47: 'en',
      name: 'English',
      slug: 'english'
    }
    const videoVariant = {
      id: 'refId',
      videoId: 'mediaComponentId',
      languageId: '529',
      duration: 1,
      hls: 'hlsUrl',
      subtitle: [
        {
          videoVariantId: 'refId',
          languageId: '529',
          primary: true,
          value: 'subtitleUrl529'
        },
        {
          videoVariantId: 'refId',
          languageId: '2048',
          primary: false,
          value: 'subtitleUrl2048'
        }
      ],
      downloads: [
        {
          videoVariantId: 'refId',
          quality: 'low',
          size: 1024,
          url: 'lowUrl'
        },
        {
          videoVariantId: 'refId',
          quality: 'high',
          size: 1024,
          url: 'highUrl'
        }
      ],
      slug: 'title/english'
    }

    it('transforms media component language to variant', () => {
      expect(
        transformArclightMediaComponentLanguageToVideoVariant(
          mediaComponentLanguage,
          mediaComponent,
          language
        )
      ).toEqual(videoVariant)
    })

    it('transforms media component language where media component is series to variant', () => {
      expect(
        transformArclightMediaComponentLanguageToVideoVariant(
          mediaComponentLanguage,
          { ...mediaComponent, subType: 'series' },
          language
        )
      ).toEqual({
        ...omit(videoVariant, 'downloads'),
        subtitle: [],
        hls: null,
        videoId: mediaComponent.mediaComponentId
      })
    })

    it('handles null duration when media component is series', () => {
      expect(
        transformArclightMediaComponentLanguageToVideoVariant(
          {
            ...omit(mediaComponentLanguage, ['lengthInMilliseconds'])
          },
          { ...mediaComponent, subType: 'series' },
          language
        )
      ).toEqual({
        ...omit(videoVariant, 'downloads'),
        duration: 0,
        hls: null,
        subtitle: [],
        videoId: mediaComponent.mediaComponentId
      })
    })

    it('transforms media component language without subtitleUrls to variant', () => {
      expect(
        transformArclightMediaComponentLanguageToVideoVariant(
          { ...mediaComponentLanguage, subtitleUrls: {} },
          mediaComponent,
          language
        )
      ).toEqual({ ...videoVariant, subtitle: [] })
    })

    it('transforms media component language without streamingUrls to variant', () => {
      expect(
        transformArclightMediaComponentLanguageToVideoVariant(
          { ...mediaComponentLanguage, streamingUrls: {} },
          mediaComponent,
          language
        )
      ).toEqual({ ...videoVariant, hls: null })
    })

    it('handles null duration', () => {
      expect(
        transformArclightMediaComponentLanguageToVideoVariant(
          {
            ...omit(mediaComponentLanguage, ['lengthInMilliseconds']),
            streamingUrls: {}
          },
          mediaComponent,
          language
        )
      ).toEqual({ ...videoVariant, duration: 0, hls: null })
    })
  })

  describe('transformArclightMediaComponentToVideo', () => {
    const mediaComponent: ArclightMediaComponent = {
      mediaComponentId: 'mediaComponentId',
      primaryLanguageId: 529,
      title: 'title',
      shortDescription: 'shortDescription',
      longDescription: 'longDescription',
      metadataLanguageTag: 'en',
      imageUrls: {
        mobileCinematicHigh: 'mobileCinematicHigh'
      },
      studyQuestions: [],
      subType: 'episode'
    }
    const mediaComponentLanguages: ArclightMediaComponentLanguage[] = [
      {
        refId: 'refId',
        languageId: 529,
        lengthInMilliseconds: 1000,
        subtitleUrls: {
          vtt: [
            {
              languageId: 529,
              url: 'subtitleUrl529'
            },
            {
              languageId: 2048,
              url: 'subtitleUrl2048'
            }
          ]
        },
        streamingUrls: {
          hls: [
            {
              url: 'hlsUrl'
            }
          ]
        },
        downloadUrls: {
          low: {
            url: 'lowUrl',
            sizeInBytes: 1024
          },
          high: {
            url: 'highUrl',
            sizeInBytes: 1024
          }
        }
      }
    ]
    const languages: Language[] = [
      {
        languageId: 529,
        bcp47: 'en',
        name: 'English',
        slug: 'english'
      }
    ]
    const video = {
      id: 'mediaComponentId',
      description: [
        { languageId: '529', primary: true, value: 'longDescription' }
      ],
      image: 'mobileCinematicHigh',
      imageAlt: [{ languageId: '529', primary: true, value: 'title' }],
      label: 'episode',
      noIndex: false,
      primaryLanguageId: '529',
      seoTitle: [{ languageId: '529', primary: true, value: 'title' }],
      slug: 'title',
      snippet: [
        { languageId: '529', primary: true, value: 'shortDescription' }
      ],
      studyQuestions: [],
      title: [
        {
          videoId: 'mediaComponentId',
          languageId: '529',
          primary: true,
          value: 'title'
        }
      ],
      variants: [
        {
          id: 'refId',
          videoId: 'mediaComponentId',
          languageId: '529',
          duration: 1,
          hls: 'hlsUrl',
          subtitle: [
            {
              videoVariantId: 'refId',
              languageId: '529',
              primary: true,
              value: 'subtitleUrl529'
            },
            {
              videoVariantId: 'refId',
              languageId: '2048',
              primary: false,
              value: 'subtitleUrl2048'
            }
          ],
          downloads: [
            {
              videoVariantId: 'refId',
              quality: 'low',
              size: 1024,
              url: 'lowUrl'
            },
            {
              videoVariantId: 'refId',
              quality: 'high',
              size: 1024,
              url: 'highUrl'
            }
          ],
          slug: 'title/english'
        }
      ]
    }

    it('transforms media component to video', () => {
      const usedSlugs = {}
      expect(
        transformArclightMediaComponentToVideo(
          mediaComponent,
          mediaComponentLanguages,
          languages,
          usedSlugs
        )
      ).toEqual(video)
      expect(usedSlugs).toEqual({ title: 'mediaComponentId' })
    })

    it('transforms media component to video when slug exists', () => {
      const usedSlugs = { title: 'id' }
      expect(
        transformArclightMediaComponentToVideo(
          mediaComponent,
          mediaComponentLanguages,
          languages,
          usedSlugs
        )
      ).toEqual({
        ...video,
        slug: 'title-2',
        variants: [
          {
            ...video.variants[0],
            slug: 'title-2/english'
          }
        ]
      })
      expect(usedSlugs).toEqual({ title: 'id', 'title-2': 'mediaComponentId' })
    })

    it('transforms media component to video without languages', () => {
      const usedSlugs = {}
      expect(
        transformArclightMediaComponentToVideo(
          mediaComponent,
          mediaComponentLanguages,
          [],
          usedSlugs
        )
      ).toEqual({ ...video, variants: [] })
      expect(usedSlugs).toEqual({ title: 'mediaComponentId' })
    })

    it('transforms media component to video with study questions', () => {
      const usedSlugs = {}
      expect(
        transformArclightMediaComponentToVideo(
          { ...mediaComponent, studyQuestions: ['How can I know Jesus?'] },
          mediaComponentLanguages,
          languages,
          usedSlugs
        )
      ).toEqual({
        ...video,
        studyQuestions: [
          {
            languageId: '529',
            primary: true,
            value: 'How can I know Jesus?'
          }
        ]
      })
      expect(usedSlugs).toEqual({ title: 'mediaComponentId' })
    })

    it('transforms media component to video with long title', () => {
      const usedSlugs = {}
      expect(
        transformArclightMediaComponentToVideo(
          {
            ...mediaComponent,
            title:
              'The Quick Brown Fox Jumps Over The Lazy Dog Many Times Over And Over Until It Gets Cut Off When Over 100 Characters'
          },
          mediaComponentLanguages,
          languages,
          usedSlugs
        )
      ).toEqual({
        ...video,
        title: [
          {
            videoId: 'mediaComponentId',
            languageId: '529',
            primary: true,
            value:
              'The Quick Brown Fox Jumps Over The Lazy Dog Many Times Over And Over Until It Gets Cut Off When Over 100 Characters'
          }
        ],
        seoTitle: [
          {
            languageId: '529',
            primary: true,
            value:
              'The Quick Brown Fox Jumps Over The Lazy Dog Many Times Over And Over Until It Gets Cut Off When Over 100 Characters'
          }
        ],
        imageAlt: [
          {
            languageId: '529',
            primary: true,
            value:
              'The Quick Brown Fox Jumps Over The Lazy Dog Many Times Over And Over Until It Gets Cut Off When Ove'
          }
        ],
        slug: 'the-quick-brown-fox-jumps-over-the-lazy-dog-many-times-over-and-over-until-it-gets-cut-off-when-over-100-characters',
        variants: [
          {
            ...video.variants[0],
            slug: 'the-quick-brown-fox-jumps-over-the-lazy-dog-many-times-over-and-over-until-it-gets-cut-off-when-over-100-characters/english'
          }
        ]
      })
      expect(usedSlugs).toEqual({
        'the-quick-brown-fox-jumps-over-the-lazy-dog-many-times-over-and-over-until-it-gets-cut-off-when-over-100-characters':
          'mediaComponentId'
      })
    })
  })

  describe('transformArclightMediaLanguageToLanguage', () => {
    const mediaLanguage: ArclightMediaLanguage = {
      name: 'English (New Zealand)',
      bcp47: 'en-nz',
      languageId: 987
    }

    it('adds slug', () => {
      expect(
        transformArclightMediaLanguageToLanguage(mediaLanguage, {}).slug
      ).toBe('english-new-zealand')
    })

    it('when slug already used then slug value will have number following', () => {
      expect(
        transformArclightMediaLanguageToLanguage(mediaLanguage, {
          'english-new-zealand': 'id'
        }).slug
      ).toBe('english-new-zealand-2')
    })
  })

  describe('fetchMediaLanguagesAndTransformToLanguages', () => {
    it('returns a collection of languages', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () =>
          await Promise.resolve({
            _embedded: {
              mediaLanguages: [
                {
                  name: 'English',
                  bcp47: 'en',
                  languageId: 529
                }
              ]
            }
          })
      } as unknown as Response)
      await expect(
        fetchMediaLanguagesAndTransformToLanguages()
      ).resolves.toEqual([
        {
          name: 'English',
          bcp47: 'en',
          languageId: 529,
          slug: 'english'
        }
      ])
    })
  })

  describe('fetchPlus', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('calls fetch with provided url and init', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => await Promise.resolve({})
      } as unknown as Response)

      const url = 'https://example.com'
      const init = { method: 'POST' }
      await expect(fetchPlus(url, init)).resolves.toEqual(
        expect.objectContaining({ ok: true })
      )
      expect(mockFetch).toHaveBeenCalledWith(url, init)
    })

    it('retries up to 3 times on FetchError', async () => {
      mockFetch.mockRejectedValue(new FetchError('FetchError', 'FetchError'))

      const url = 'https://example.com'
      const init = { method: 'POST' }
      await expect(fetchPlus(url, init)).rejects.toThrow(Error)
      expect(mockFetch).toHaveBeenCalledTimes(4)
    })

    it('throws error when retries are exhausted', async () => {
      mockFetch.mockRejectedValueOnce(new Error('FetchError'))

      const url = 'https://example.com'
      const init = { method: 'POST' }
      await expect(fetchPlus(url, init, 0)).rejects.toThrow(Error)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('transformMediaComponentToVideo', () => {
    jest.mock('./arclight', () => {
      const originalModule = jest.requireActual('./arclight')
      return {
        __esModule: true,
        ...originalModule,
        getArclightMediaComponentLanguages: jest.fn()
      }
    })
    const mockGetArclightMediaComponentLanguages =
      getArclightMediaComponentLanguages as jest.MockedFunction<
        typeof getArclightMediaComponentLanguages
      >
    const mediaComponent: ArclightMediaComponent = {
      mediaComponentId: 'mediaComponentId',
      primaryLanguageId: 529,
      title: 'title',
      shortDescription: 'shortDescription',
      longDescription: 'longDescription',
      metadataLanguageTag: 'en',
      imageUrls: {
        mobileCinematicHigh: 'mobileCinematicHigh'
      },
      studyQuestions: [],
      subType: 'episode'
    }
    const mediaComponentLanguages: ArclightMediaComponentLanguage[] = [
      {
        refId: 'refId',
        languageId: 529,
        lengthInMilliseconds: 1000,
        subtitleUrls: {
          vtt: [
            {
              languageId: 529,
              url: 'subtitleUrl529'
            },
            {
              languageId: 2048,
              url: 'subtitleUrl2048'
            }
          ]
        },
        streamingUrls: {
          hls: [
            {
              url: 'hlsUrl'
            }
          ]
        },
        downloadUrls: {
          low: {
            url: 'lowUrl',
            sizeInBytes: 1024
          },
          high: {
            url: 'highUrl',
            sizeInBytes: 1024
          }
        }
      }
    ]
    const languages: Language[] = [
      {
        languageId: 529,
        bcp47: 'en',
        name: 'English',
        slug: 'english'
      }
    ]
    const usedVideoSlugs = {}

    beforeEach(() => {
      mockGetArclightMediaComponentLanguages.mockClear()
    })

    it('transforms media component to video', async () => {
      mockGetArclightMediaComponentLanguages.mockResolvedValueOnce(
        mediaComponentLanguages
      )
      const video = await transformMediaComponentToVideo(
        mediaComponent,
        languages,
        usedVideoSlugs
      )
      expect(video).toEqual({
        id: mediaComponent.mediaComponentId,
        description: [
          { languageId: '529', primary: true, value: 'longDescription' }
        ],
        duration: 1,
        hls: 'hlsUrl',
        image: 'mobileCinematicHigh',
        languageId: '529',
        slug: 'title/english',
        subType: 'episode',
        title: 'title',
        videoVariants: [
          {
            id: 'refId',
            downloads: [
              {
                quality: 'low',
                size: 1024,
                url: 'lowUrl'
              },
              {
                quality: 'high',
                size: 1024,
                url: 'highUrl'
              }
            ],
            duration: 1,
            hls: 'hlsUrl',
            languageId: '529',
            slug: 'title/english',
            subtitle: [
              {
                languageId: '529',
                primary: true,
                value: 'subtitleUrl529'
              },
              {
                languageId: '2048',
                primary: false,
                value: 'subtitleUrl2048'
              }
            ]
          }
        ]
      })
      expect(mockGetArclightMediaComponentLanguages).toHaveBeenCalledWith(
        mediaComponent.mediaComponentId
      )
    })
  })
})
