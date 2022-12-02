import fetch, { Response } from 'node-fetch'
import {
  getArclightMediaLanguages,
  getArclightMediaComponents,
  getArclightMediaComponentLanguages,
  getArclightMediaComponentLinks,
  transformArclightMediaComponentToVideo,
  transformArclightMediaComponentLanguageToVideoVariant,
  ArclightMediaComponentLanguage,
  ArclightMediaComponent,
  ArclightMediaLanguage,
  Language,
  transformArclightMediaLanguageToLanguage,
  MediaComponent,
  Video,
  fetchMediaComponentsAndTransformToVideos,
  fetchMediaLanguagesAndTransformToLanguages
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
        'https://api.arclight.org/v2/media-languages?limit=5000&filter=default&apiKey='
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
        'https://api.arclight.org/v2/media-components?limit=50&isDeprecated=false&contentTypes=video&page=1&apiKey='
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
        'https://api.arclight.org/v2/media-components/mediaComponentId/languages?platform=android&apiKey='
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
        'https://api.arclight.org/v2/media-component-links/mediaComponentId?apiKey='
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
      subType: 'video',
      slug: [
        {
          value: 'title',
          languageId: '529',
          primary: true
        }
      ]
    }
    const language: Language = {
      languageId: 529,
      bcp47: 'en',
      name: 'English',
      slug: [
        {
          value: 'english',
          languageId: '529',
          primary: true
        }
      ]
    }
    const videoVariant = {
      id: 'refId',
      languageId: '529',
      duration: 1,
      hls: 'hlsUrl',
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
      ],
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
      slug: [
        {
          value: 'title/english',
          languageId: '529',
          primary: true
        }
      ]
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
        ...videoVariant,
        downloads: [],
        subtitle: [],
        hls: undefined
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
      ).toEqual({ ...videoVariant, hls: undefined })
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
      subType: 'video'
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
    const mediaComponentLinks = []
    const languages: Language[] = [
      {
        languageId: 529,
        bcp47: 'en',
        name: 'English',
        slug: [
          {
            value: 'english',
            languageId: '529',
            primary: true
          }
        ]
      }
    ]
    const video: Video = {
      _key: 'mediaComponentId',
      childIds: [],
      description: [
        { languageId: '529', primary: true, value: 'longDescription' }
      ],
      image: 'mobileCinematicHigh',
      imageAlt: [{ languageId: '529', primary: true, value: 'title' }],
      label: 'video',
      noIndex: false,
      primaryLanguageId: '529',
      seoTitle: [{ languageId: '529', primary: true, value: 'title' }],
      slug: [{ languageId: '529', primary: true, value: 'title' }],
      snippet: [
        { languageId: '529', primary: true, value: 'shortDescription' }
      ],
      studyQuestions: [],
      title: [{ languageId: '529', primary: true, value: 'title' }],
      variants: [
        {
          id: 'refId',
          languageId: '529',
          duration: 1,
          hls: 'hlsUrl',
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
          ],
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
          slug: [{ languageId: '529', primary: true, value: 'title/english' }]
        }
      ]
    }

    it('transforms media component to video', () => {
      const usedSlugs = []
      expect(
        transformArclightMediaComponentToVideo(
          mediaComponent,
          mediaComponentLanguages,
          mediaComponentLinks,
          languages,
          usedSlugs
        )
      ).toEqual(video)
      expect(usedSlugs).toEqual(['title'])
    })

    it('transforms media component to video when slug exists', () => {
      const usedSlugs = ['title']
      expect(
        transformArclightMediaComponentToVideo(
          mediaComponent,
          mediaComponentLanguages,
          mediaComponentLinks,
          languages,
          usedSlugs
        )
      ).toEqual({
        ...video,
        slug: [
          {
            languageId: '529',
            primary: true,
            value: 'title-2'
          }
        ],
        variants: [
          {
            ...video.variants[0],
            slug: [{ ...video.variants[0].slug[0], value: 'title-2/english' }]
          }
        ]
      })
      expect(usedSlugs).toEqual(['title', 'title-2'])
    })

    it('transforms media component to video without languages', () => {
      const usedSlugs = []
      expect(
        transformArclightMediaComponentToVideo(
          mediaComponent,
          mediaComponentLanguages,
          mediaComponentLinks,
          [],
          usedSlugs
        )
      ).toEqual({ ...video, variants: [] })
      expect(usedSlugs).toEqual(['title'])
    })

    it('transforms media component to video with study questions', () => {
      const usedSlugs = []
      expect(
        transformArclightMediaComponentToVideo(
          { ...mediaComponent, studyQuestions: ['How can I know Jesus?'] },
          mediaComponentLanguages,
          mediaComponentLinks,
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
      expect(usedSlugs).toEqual(['title'])
    })

    it('transforms media component to video with long title', () => {
      const usedSlugs = []
      expect(
        transformArclightMediaComponentToVideo(
          {
            ...mediaComponent,
            title:
              'The Quick Brown Fox Jumps Over The Lazy Dog Many Times Over And Over Until It Gets Cut Off When Over 100 Characters'
          },
          mediaComponentLanguages,
          mediaComponentLinks,
          languages,
          usedSlugs
        )
      ).toEqual({
        ...video,
        title: [
          {
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
        slug: [
          {
            languageId: '529',
            primary: true,
            value:
              'the-quick-brown-fox-jumps-over-the-lazy-dog-many-times-over-and-over-until-it-gets-cut-off-when-over-100-characters'
          }
        ],
        variants: [
          {
            ...video.variants[0],
            slug: [
              {
                ...video.variants[0].slug[0],
                value:
                  'the-quick-brown-fox-jumps-over-the-lazy-dog-many-times-over-and-over-until-it-gets-cut-off-when-over-100-characters/english'
              }
            ]
          }
        ]
      })
      expect(usedSlugs).toEqual([
        'the-quick-brown-fox-jumps-over-the-lazy-dog-many-times-over-and-over-until-it-gets-cut-off-when-over-100-characters'
      ])
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
        transformArclightMediaLanguageToLanguage(mediaLanguage, []).slug
      ).toEqual([
        { languageId: '987', primary: true, value: 'english-new-zealand' }
      ])
    })

    it('when slug already used then slug value will have number following', () => {
      expect(
        transformArclightMediaLanguageToLanguage(mediaLanguage, [
          'english-new-zealand'
        ]).slug
      ).toEqual([
        { languageId: '987', primary: true, value: 'english-new-zealand-2' }
      ])
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
          slug: [
            {
              languageId: '529',
              primary: true,
              value: 'english'
            }
          ]
        }
      ])
    })
  })

  describe('fetchMediaComponentsAndTransformToVideos', () => {
    it('returns a collection of videos', async () => {
      mockFetch.mockImplementation(async (url) => {
        let response
        switch (url) {
          case 'https://api.arclight.org/v2/media-components?limit=50&isDeprecated=false&contentTypes=video&page=1&apiKey=':
            response = {
              _embedded: {
                mediaComponents: [
                  {
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
                    subType: 'video'
                  }
                ]
              }
            }
            break
          case 'https://api.arclight.org/v2/media-component-links/mediaComponentId?apiKey=':
            response = {
              linkedMediaComponentIds: {
                contains: ['otherMediaComponentId']
              }
            }
            break
          case 'https://api.arclight.org/v2/media-components/mediaComponentId/languages?platform=android&apiKey=':
            response = {
              _embedded: {
                mediaComponentLanguage: [
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
              }
            }
            break
        }

        return await Promise.resolve({
          json: async () => await Promise.resolve(response)
        } as unknown as Response)
      })
      const languages = [
        {
          name: 'English',
          bcp47: 'en',
          languageId: 529,
          slug: [
            {
              languageId: '529',
              primary: true,
              value: 'english'
            }
          ]
        }
      ]
      await expect(
        fetchMediaComponentsAndTransformToVideos(languages, [], 1)
      ).resolves.toEqual([
        {
          _key: 'mediaComponentId',
          childIds: ['otherMediaComponentId'],
          description: [
            { languageId: '529', primary: true, value: 'longDescription' }
          ],
          image: 'mobileCinematicHigh',
          imageAlt: [{ languageId: '529', primary: true, value: 'title' }],
          label: 'video',
          noIndex: false,
          primaryLanguageId: '529',
          seoTitle: [{ languageId: '529', primary: true, value: 'title' }],
          slug: [{ languageId: '529', primary: true, value: 'title' }],
          snippet: [
            { languageId: '529', primary: true, value: 'shortDescription' }
          ],
          studyQuestions: [],
          title: [{ languageId: '529', primary: true, value: 'title' }],
          variants: [
            {
              downloads: [
                { quality: 'low', size: 1024, url: 'lowUrl' },
                { quality: 'high', size: 1024, url: 'highUrl' }
              ],
              duration: 1,
              hls: 'hlsUrl',
              id: 'refId',
              languageId: '529',
              slug: [
                { languageId: '529', primary: true, value: 'title/english' }
              ],
              subtitle: [
                { languageId: '529', primary: true, value: 'subtitleUrl529' },
                {
                  languageId: '2048',
                  primary: false,
                  value: 'subtitleUrl2048'
                }
              ]
            }
          ]
        }
      ])
    })
  })
})
