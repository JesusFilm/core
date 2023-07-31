import { Test, TestingModule } from '@nestjs/testing'
import { GraphQLResolveInfo, Kind } from 'graphql'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { Video, VideoVariant, VideoTitle } from '.prisma/api-videos-client'
import { IdType } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { LanguageWithSlugResolver, VideoResolver } from './video.resolver'
import { VideoService } from './video.service'

describe('VideoResolver', () => {
  let resolver: VideoResolver,
    service: VideoService,
    prismaService: DeepMockProxy<PrismaService>

  const video: Video = {
    id: '20615',
    slug: 'video-slug',
    label: 'featureFilm',
    primaryLanguageId: '529',
    seoTitle: [],
    snippet: [],
    description: [],
    studyQuestions: [],
    image: '',
    imageAlt: [],
    noIndex: false
  }

  const videoVariant: VideoVariant[] = [
    {
      id: '1',
      videoId: video.id,
      hls: '',
      slug: 'jesus/english',
      languageId: '529',
      duration: 0,
      subtitle: []
    }
  ]

  const videoTitle: VideoTitle = {
    value: '普通話',
    primary: false,
    languageId: '529',
    id: '1',
    videoId: '20615'
  }

  beforeEach(async () => {
    const videoService = {
      provide: VideoService,
      useFactory: () => ({
        filterAll: jest.fn(() => [video, video])
      })
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoResolver,
        videoService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<VideoResolver>(VideoResolver)
    service = await module.resolve(VideoService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    prismaService.videoVariant.count.mockResolvedValue(1)
    prismaService.video.findUnique.mockResolvedValue(video)
    prismaService.video.findFirst.mockResolvedValue(video)
    prismaService.videoTitle.findMany.mockResolvedValue([videoTitle])
    prismaService.videoVariant.findUnique.mockResolvedValue(videoVariant[0])
    prismaService.videoVariant.findMany.mockResolvedValue(videoVariant)
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

    it('should error on not found', async () => {
      prismaService.video.findUnique.mockResolvedValue(null)
      await expect(resolver.video(info, '20615')).rejects.toThrowError(
        'Video not found'
      )
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
      prismaService.video.count.mockResolvedValue(2)
      expect(await resolver.childrenCount(video)).toEqual(2)
      expect(prismaService.video.count).toHaveBeenCalledWith({
        where: { parent: { some: { id: video.id } } }
      })
    })
  })

  describe('children', () => {
    beforeEach(() => {
      prismaService.video.findMany.mockResolvedValueOnce([video, video])
    })

    it('returns videos by childIds without languageId', async () => {
      expect(await resolver.children(video)).toEqual([video, video])
      expect(prismaService.video.findMany).toHaveBeenCalledWith({
        where: { parent: { some: { id: video.id } } }
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
      expect(await resolver.title(video)).toEqual([videoTitle])
      expect(prismaService.videoTitle.findMany).toHaveBeenCalledWith({
        where: {
          videoId: video.id,
          OR: [{ languageId: '529' }]
        }
      })
    })

    it('returns filtered titles', async () => {
      expect(await resolver.title(video, '529', true)).toEqual([videoTitle])
      expect(prismaService.videoTitle.findMany).toHaveBeenCalledWith({
        where: {
          videoId: video.id,
          OR: [{ primary: true }, { languageId: '529' }]
        }
      })
    })
  })

  describe('variant', () => {
    it('returns variant with languageId', async () => {
      expect(await resolver.variant(video, '529')).toEqual(videoVariant[0])
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
      expect(await resolver.variant(video)).toEqual(videoVariant[0])
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
