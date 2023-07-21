import { Test, TestingModule } from '@nestjs/testing'
import { GraphQLResolveInfo, Kind } from 'graphql'
import { IdType } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { LanguageWithSlugResolver, VideoResolver } from './video.resolver'
import { VideoService } from './video.service'

describe('VideoResolver', () => {
  let resolver: VideoResolver,
    service: VideoService,
    prismaService: PrismaService

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
        slug: 'jesus/english',
        languageId: '529'
      }
    ]
  }

  beforeEach(async () => {
    const videoService = {
      provide: VideoService,
      useFactory: () => ({
        filterAll: jest.fn(() => [video, video])
      })
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoResolver, videoService, PrismaService]
    }).compile()
    resolver = module.get<VideoResolver>(VideoResolver)
    service = await module.resolve(VideoService)
    prismaService = await module.resolve(PrismaService)
    prismaService.videoVariant.count = jest.fn().mockResolvedValue(1)
    prismaService.video.findUnique = jest.fn().mockResolvedValue(video)
    prismaService.video.findFirst = jest.fn().mockResolvedValue(video)
    prismaService.videoTitle.findMany = jest
      .fn()
      .mockResolvedValue([{ value: '普通話' }])
    prismaService.videoVariant.findUnique = jest
      .fn()
      .mockResolvedValue(video.variant[0])
    prismaService.videoVariant.findMany = jest
      .fn()
      .mockResolvedValue(video.variant)
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
      expect(prismaService.video.findUnique).toHaveBeenCalledWith({
        where: { id: video.id }
      })
    })

    it('should return video with slug as idtype', async () => {
      expect(await resolver.video(info, 'jesus/english', IdType.slug)).toEqual(
        video
      )
      expect(prismaService.video.findFirst).toHaveBeenCalledWith({
        where: {
          variants: { some: { slug: 'jesus/english' } }
        }
      })
    })
  })

  describe('resolveReference', () => {
    it('returns video', async () => {
      expect(
        await resolver.resolveReference({
          __typename: 'Video',
          id: '20615'
        })
      ).toEqual(video)
      expect(prismaService.video.findUnique).toHaveBeenCalledWith({
        where: { id: video.id }
      })
    })

    it('returns children count', async () => {
      prismaService.video.count = jest.fn().mockResolvedValue(2)
      expect(await resolver.childrenCount(video)).toEqual(2)
      expect(prismaService.video.count).toHaveBeenCalledWith({
        where: { parent: { id: video.id } }
      })
    })
  })

  describe('children', () => {
    beforeEach(() => {
      prismaService.video.findMany = jest
        .fn()
        .mockResolvedValueOnce([video, video])
    })

    it('returns videos by childIds without languageId', async () => {
      expect(await resolver.children(video)).toEqual([video, video])
      expect(prismaService.video.findMany).toHaveBeenCalledWith({
        where: { parent: { id: video.id } }
      })
    })
  })

  describe('variantLanguagesCount', () => {
    it('returns variant languages count', async () => {
      expect(await resolver.variantLanguagesCount(video)).toEqual(1)
      expect(prismaService.videoVariant.count).toHaveBeenCalledWith({
        where: { videoId: video.id }
      })
    })
  })

  describe('title', () => {
    it('returns titles', async () => {
      expect(await resolver.title(video)).toEqual([{ value: '普通話' }])
      expect(prismaService.videoTitle.findMany).toHaveBeenCalledWith({
        where: { videoId: video.id }
      })
    })

    it('returns filtered titles', async () => {
      expect(await resolver.title(video, '529', true)).toEqual([
        { value: '普通話' }
      ])
      expect(prismaService.videoTitle.findMany).toHaveBeenCalledWith({
        where: { videoId: video.id, languageId: '529', primary: true }
      })
    })
  })

  describe('variant', () => {
    it('returns variant with languageId', async () => {
      expect(await resolver.variant(video, '529')).toEqual({
        slug: 'jesus/english',
        languageId: '529'
      })
      expect(prismaService.videoVariant.findUnique).toHaveBeenCalledWith({
        where: {
          languageId_videoId: {
            languageId: '529',
            videoId: video.id
          }
        }
      })
    })

    it('returns variant without languageId', async () => {
      expect(await resolver.variant(video)).toEqual({
        slug: 'jesus/english',
        languageId: '529'
      })
      expect(prismaService.videoVariant.findUnique).toHaveBeenCalledWith({
        where: {
          languageId_videoId: {
            languageId: '529',
            videoId: video.id
          }
        }
      })
    })
  })

  describe('variantLanguagesWithSlug', () => {
    it('returns variant languages with slug', async () => {
      expect(await resolver.variantLanguagesWithSlug(video)).toEqual([
        { slug: 'jesus/english', languageId: '529' }
      ])
      expect(prismaService.videoVariant.findMany).toHaveBeenCalledWith({
        where: { videoId: video.id },
        select: { languageId: true, slug: true }
      })
    })
  })

  describe('variantLanguages', () => {
    it('returns variant languages', async () => {
      expect(await resolver.variantLanguages(video)).toEqual([{ id: '529' }])
      expect(prismaService.videoVariant.findMany).toHaveBeenCalledWith({
        where: { videoId: video.id },
        select: { languageId: true }
      })
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
