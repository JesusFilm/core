import { Test, TestingModule } from '@nestjs/testing'
import { VideoIdType } from '../../__generated__/graphql'
import { VideoResolver } from './video.resolver'
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
    slug: [
      {
        value: 'video-slug'
      }
    ],
    variant: [
      {
        path: 'jesus.html/english.html'
      }
    ]
  }

  beforeEach(async () => {
    const videoService = {
      provide: VideoService,
      useFactory: () => ({
        filterAll: jest.fn(() => [video, video]),
        filterEpisodes: jest.fn(() => [video, video]),
        getVideosByIds: jest.fn(() => [video, video]),
        getVideo: jest.fn(() => video),
        getVideoBySlug: jest.fn(() => video),
        getVideoByPath: jest.fn(() => video)
      })
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoResolver, videoService]
    }).compile()
    resolver = module.get<VideoResolver>(VideoResolver)
    service = await module.resolve(VideoService)
  })

  describe('episodes', () => {
    it('returns Videos', async () => {
      const playlistId = 'rivka'
      const info = { fieldNodes: [{ selectionSet: { selections: [] } }] }
      expect(
        await resolver.episodesQuery(info, playlistId, VideoIdType.slug)
      ).toEqual([video, video])
      expect(service.filterEpisodes).toHaveBeenCalledWith({
        idType: VideoIdType.slug,
        playlistId
      })
    })

    it('returns filtered Videos', async () => {
      const playlistId = 'rivka_1'

      const info = {
        fieldNodes: [
          {
            selectionSet: {
              selections: [
                {
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
      }
      expect(
        await resolver.episodesQuery(
          info,
          playlistId,
          VideoIdType.databaseId,
          {
            title: 'abc',
            availableVariantLanguageIds: ['fr']
          },
          100,
          200
        )
      ).toEqual([video, video])
      expect(service.filterEpisodes).toHaveBeenCalledWith({
        playlistId,
        idType: VideoIdType.databaseId,
        title: 'abc',
        availableVariantLanguageIds: ['fr'],
        variantLanguageId: 'en',
        offset: 100,
        limit: 200
      })
    })
  })

  describe('videos', () => {
    it('returns Videos', async () => {
      const info = { fieldNodes: [{ selectionSet: { selections: [] } }] }
      expect(await resolver.videos(info)).toEqual([video, video])
      expect(service.filterAll).toHaveBeenCalledWith({})
    })

    it('returns filtered Videos', async () => {
      const info = {
        fieldNodes: [
          {
            selectionSet: {
              selections: [
                {
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
      }
      expect(
        await resolver.videos(
          info,
          {
            title: 'abc',
            availableVariantLanguageIds: ['fr']
          },
          100,
          200
        )
      ).toEqual([video, video])
      expect(service.filterAll).toHaveBeenCalledWith({
        title: 'abc',
        availableVariantLanguageIds: ['fr'],
        variantLanguageId: 'en',
        offset: 100,
        limit: 200
      })
    })
  })

  describe('video', () => {
    const info = { fieldNodes: [{ selectionSet: { selections: [] } }] }
    it('return a video', async () => {
      expect(await resolver.video(info, '20615')).toEqual(video)
      expect(service.getVideo).toHaveBeenCalledWith('20615', undefined)
    })

    it('return a filtered video', async () => {
      const filteredInfo = {
        fieldNodes: [
          {
            selectionSet: {
              selections: [
                {
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
      }
      expect(await resolver.video(filteredInfo, '20615')).toEqual(video)
      expect(service.getVideo).toHaveBeenCalledWith('20615', 'en')
    })

    it('should return video with slug as idtype', async () => {
      expect(
        await resolver.video(info, 'video-slug', VideoIdType.slug)
      ).toEqual(video)
      expect(service.getVideoBySlug).toHaveBeenCalledWith(
        'video-slug',
        undefined
      )
    })

    it('should return video with path as idtype', async () => {
      expect(
        await resolver.video(info, 'jesus.html/english.html', VideoIdType.path)
      ).toEqual(video)
      expect(service.getVideoByPath).toHaveBeenCalledWith(
        'jesus.html/english.html'
      )
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
  })
})
