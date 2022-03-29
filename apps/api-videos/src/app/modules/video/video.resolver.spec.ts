import { Test, TestingModule } from '@nestjs/testing'
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
    ]
  }

  beforeEach(async () => {
    const videoService = {
      provide: VideoService,
      useFactory: () => ({
        filterAll: jest.fn(() => [video, video]),
        getVideo: jest.fn(() => video)
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
          2,
          200
        )
      ).toEqual([video, video])
      expect(service.filterAll).toHaveBeenCalledWith({
        title: 'abc',
        availableVariantLanguageIds: ['fr'],
        variantLanguageId: 'en',
        page: 2,
        limit: 200
      })
    })
  })

  describe('video', () => {
    it('return a video', async () => {
      const info = { fieldNodes: [{ selectionSet: { selections: [] } }] }
      expect(await resolver.video(info, '20615')).toEqual(video)
      expect(service.getVideo).toHaveBeenCalledWith('20615', undefined)
    })

    it('return a filtered video', async () => {
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
      expect(await resolver.video(info, '20615')).toEqual(video)
      expect(service.getVideo).toHaveBeenCalledWith('20615', 'en')
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
