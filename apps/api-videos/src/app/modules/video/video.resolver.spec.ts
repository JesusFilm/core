import { Test, TestingModule } from '@nestjs/testing'
import { GraphQLResolveInfo, Kind } from 'graphql'

import { IdType } from '../../__generated__/graphql'

import { LanguageWithSlugResolver, VideoResolver } from './video.resolver'
import { VideoService } from './video.service'

describe('VideoResolver', () => {
  let resolver: VideoResolver, service: VideoService

  const video = {
    id: '20615',
    bcp47: 'zh',
    name: [
      {
        value: '普通話',
        primary: true,
        videoId: '20615'
      },
      {
        value: 'Chinese, Mandarin',
        primary: false,
        videoId: '529'
      }
    ],
    slug: 'video-slug',
    variant: [
      {
        slug: 'jesus/english'
      }
    ]
  }

  beforeEach(async () => {
    const videoService = {
      provide: VideoService,
      useFactory: () => ({
        filterAll: jest.fn(() => [video, video]),
        getVideosByIds: jest.fn(() => [video, video]),
        getVideo: jest.fn(() => video),
        getVideoBySlug: jest.fn(() => video)
      })
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoResolver, videoService]
    }).compile()
    resolver = module.get<VideoResolver>(VideoResolver)
    service = await module.resolve(VideoService)
  })

  describe('videos', () => {
    it('returns Videos', async () => {
      const info = {
        fieldNodes: [{ selectionSet: { selections: [] } }]
      } as unknown as GraphQLResolveInfo
      expect(await resolver.videos(info)).toEqual([video, video])
      expect(service.filterAll).toHaveBeenCalledWith({})
    })

    it('returns videos filtered by variant language id with string argument', async () => {
      const info = {
        fieldNodes: [
          {
            selectionSet: {
              selections: [
                {
                  kind: Kind.FIELD,
                  name: { value: 'variant' },
                  arguments: [
                    {
                      name: { value: 'languageId' },
                      value: { value: 'en' }
                    }
                  ]
                }
              ]
            }
          }
        ]
      } as unknown as GraphQLResolveInfo
      expect(
        await resolver.videos(
          info,
          {
            title: 'abc',
            availableVariantLanguageIds: ['fr'],
            ids: ['1_jf-0-0']
          },
          100,
          200
        )
      ).toEqual([video, video])
      expect(service.filterAll).toHaveBeenCalledWith({
        title: 'abc',
        availableVariantLanguageIds: ['fr'],
        ids: ['1_jf-0-0'],
        variantLanguageId: 'en',
        offset: 100,
        limit: 200
      })
    })

    it('returns videos filtered by variant language id with variable argument', async () => {
      const info = {
        fieldNodes: [
          {
            selectionSet: {
              selections: [
                {
                  kind: Kind.FIELD,
                  name: { value: 'variant' },
                  arguments: [
                    {
                      name: { value: 'languageId' },
                      value: {
                        kind: Kind.VARIABLE,
                        name: { value: 'customLanguageId' }
                      }
                    }
                  ]
                }
              ]
            }
          }
        ],
        variableValues: {
          customLanguageId: 'en'
        }
      } as unknown as GraphQLResolveInfo
      expect(
        await resolver.videos(
          info,
          {
            title: 'abc',
            availableVariantLanguageIds: ['fr'],
            ids: ['1_jf-0-0']
          },
          100,
          200
        )
      ).toEqual([video, video])
      expect(service.filterAll).toHaveBeenCalledWith({
        title: 'abc',
        availableVariantLanguageIds: ['fr'],
        ids: ['1_jf-0-0'],
        variantLanguageId: 'en',
        offset: 100,
        limit: 200
      })
    })
  })

  describe('video', () => {
    const info = {
      fieldNodes: [{ selectionSet: { selections: [] } }]
    } as unknown as GraphQLResolveInfo

    it('return a video', async () => {
      expect(await resolver.video(info, '20615')).toEqual(video)
      expect(service.getVideo).toHaveBeenCalledWith('20615', undefined)
    })

    it('returns a video filtered by variant language id with string argument', async () => {
      const filteredInfo = {
        fieldNodes: [
          {
            selectionSet: {
              selections: [
                {
                  name: { value: 'variant' },
                  kind: Kind.FIELD,
                  arguments: [
                    {
                      name: { value: 'languageId' },
                      value: { value: 'en' }
                    }
                  ]
                }
              ]
            }
          }
        ]
      } as unknown as GraphQLResolveInfo
      expect(await resolver.video(filteredInfo, '20615')).toEqual(video)
      expect(service.getVideo).toHaveBeenCalledWith('20615', 'en')
    })

    it('returns a video filtered by variant language id with variable argument', async () => {
      const filteredInfo = {
        fieldNodes: [
          {
            selectionSet: {
              selections: [
                {
                  name: { value: 'variant' },
                  kind: Kind.FIELD,
                  arguments: [
                    {
                      name: { value: 'languageId' },
                      value: {
                        kind: Kind.VARIABLE,
                        name: { value: 'customLanguageId' }
                      }
                    }
                  ]
                }
              ]
            }
          }
        ],
        variableValues: {
          customLanguageId: 'en'
        }
      } as unknown as GraphQLResolveInfo
      expect(await resolver.video(filteredInfo, '20615')).toEqual(video)
      expect(service.getVideo).toHaveBeenCalledWith('20615', 'en')
    })

    it('should return video with slug as idtype', async () => {
      expect(await resolver.video(info, 'jesus/english', IdType.slug)).toEqual(
        video
      )
      expect(service.getVideoBySlug).toHaveBeenCalledWith('jesus/english')
    })
  })

  describe('resolveReference', () => {
    it('returns video', async () => {
      expect(
        await resolver.resolveReference({
          __typename: 'Video',
          id: '20615',
          primaryLanguageId: 'en'
        })
      ).toEqual(video)
      expect(service.getVideo).toHaveBeenCalledWith('20615', 'en')
    })

    it('returns video if primaryLanguageId is undefined', async () => {
      expect(
        await resolver.resolveReference({
          __typename: 'Video',
          id: '20615',
          primaryLanguageId: undefined
        })
      ).toEqual(video)
      expect(service.getVideo).toHaveBeenCalledWith('20615', undefined)
    })

    it('returns video if primaryLanguageId is null', async () => {
      expect(
        await resolver.resolveReference({
          __typename: 'Video',
          id: '20615',
          primaryLanguageId: null
        })
      ).toEqual(video)
      expect(service.getVideo).toHaveBeenCalledWith('20615', undefined)
    })

    it('returns children count', async () => {
      expect(
        resolver.childrenCount({
          childIds: [{ id: '1' }, { id: '2' }, 0, '', undefined, null, NaN]
        })
      ).toBe(2)
    })
  })

  describe('children', () => {
    it('returns null when no childIds', async () => {
      expect(await resolver.children({ childIds: undefined })).toBeNull()
    })

    it('returns videos by childIds without languageId', async () => {
      expect(await resolver.children({ childIds: ['abc', 'def'] })).toEqual([
        video,
        video
      ])
      expect(service.getVideosByIds).toHaveBeenCalledWith(
        ['abc', 'def'],
        undefined
      )
    })

    it('returns videos by childIds with languageId', async () => {
      expect(
        await resolver.children({
          childIds: ['abc', 'def'],
          variant: { languageId: '529' }
        })
      ).toEqual([video, video])
      expect(service.getVideosByIds).toHaveBeenCalledWith(['abc', 'def'], '529')
    })
  })

  describe('variantLanguagesCount', () => {
    it('returns variant languages count', async () => {
      expect(
        await resolver.variantLanguagesCount({
          variantLanguages: [
            {
              id: '1'
            },
            {
              id: '2'
            }
          ]
        })
      ).toBe(2)
    })

    it('does not include falsey values into the count', async () => {
      expect(
        await resolver.variantLanguagesCount({
          variantLanguages: [
            0,
            '',
            undefined,
            null,
            NaN,
            {
              id: '1'
            }
          ]
        })
      ).toBe(1)
    })
  })
})

describe('LangugageWithSlugResolver', () => {
  let resolver: LanguageWithSlugResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LanguageWithSlugResolver]
    }).compile()
    resolver = module.get<LanguageWithSlugResolver>(LanguageWithSlugResolver)
  })

  it('should resolve field language with slug', async () => {
    expect(await resolver.language({ languageId: 'id' })).toEqual({
      __typename: 'Language',
      id: 'id'
    })
  })
})
