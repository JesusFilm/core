import { Test, TestingModule } from '@nestjs/testing'
import { CacheModule } from '@nestjs/common'
import { VideoLabel } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

import { VideoService } from './video.service'

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

describe('VideoService', () => {
  let service: VideoService, prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [VideoService, PrismaService]
    }).compile()

    service = module.get<VideoService>(VideoService)
    prismaService = await module.resolve(PrismaService)
    prismaService.video.findFirst = jest.fn().mockResolvedValue(video)
    prismaService.video.findUnique = jest.fn().mockResolvedValue(video)
    prismaService.video.findMany = jest.fn().mockResolvedValue([video, video])
  })

  describe('videoFilter', () => {
    it('should search with title', () => {
      expect(
        service.videoFilter({
          title: 'abc'
        })
      ).toEqual({
        id: undefined,
        label: undefined,
        title: { some: { value: { search: 'abc' } } },
        variants: undefined
      })
    })

    it('should filter with availableVariantLanguageIds', () => {
      expect(
        service.videoFilter({
          availableVariantLanguageIds: ['en']
        })
      ).toEqual({
        id: undefined,
        label: undefined,
        title: undefined,
        variants: {
          some: {
            languageId: { in: ['en'] },
            subtitle: undefined
          }
        }
      })
    })

    it('should filter by label', () => {
      expect(
        service.videoFilter({
          labels: [VideoLabel.collection]
        })
      ).toEqual({
        id: undefined,
        label: { in: ['collection'] },
        title: undefined,
        variants: undefined
      })
    })

    it('should filter by id', () => {
      expect(
        service.videoFilter({
          ids: ['videoId']
        })
      ).toEqual({
        id: { in: ['videoId'] },
        label: undefined,
        title: undefined,
        variants: undefined
      })
    })

    it('should filter and search by all', () => {
      expect(
        service.videoFilter({
          title: 'abc',
          availableVariantLanguageIds: ['en'],
          labels: [VideoLabel.collection],
          ids: ['videoId']
        })
      ).toEqual({
        id: { in: ['videoId'] },
        label: { in: ['collection'] },
        title: { some: { value: { search: 'abc' } } },
        variants: {
          some: {
            languageId: { in: ['en'] },
            subtitle: undefined
          }
        }
      })
    })
  })

  it('should filter with subtitleLanguageIds', async () => {
    expect(
      service.videoFilter({
        subtitleLanguageIds: ['529']
      })
    ).toEqual({
      id: undefined,
      label: undefined,
      title: undefined,
      variants: {
        some: {
          languageId: undefined,
          subtitle: { has: { in: ['529'], path: ['languageId'] } }
        }
      }
    })
  })

  describe('filterAll', () => {
    it('should query', async () => {
      expect(await service.filterAll()).toEqual([video, video])
      // should cache
      expect(await service.filterAll()).toEqual([video, video])
      expect(prismaService.video.findMany).toHaveBeenCalledTimes(1)
      expect(prismaService.video.findMany).toHaveBeenCalledWith({
        where: {
          id: undefined,
          variants: undefined,
          label: undefined,
          title: undefined
        },
        skip: 0,
        take: 100
      })
    })

    it('should query with offset', async () => {
      expect(await service.filterAll({ offset: 200 })).toEqual([video, video])
      // should cache
      expect(await service.filterAll({ offset: 200 })).toEqual([video, video])
      expect(prismaService.video.findMany).toHaveBeenCalledTimes(1)
      expect(prismaService.video.findMany).toHaveBeenCalledWith({
        where: {
          id: undefined,
          variants: undefined,
          label: undefined,
          title: undefined
        },
        skip: 200,
        take: 100
      })
    })

    it('should query with limit', async () => {
      expect(await service.filterAll({ limit: 200 })).toEqual([video, video])
      // should cache
      expect(await service.filterAll({ limit: 200 })).toEqual([video, video])
      expect(prismaService.video.findMany).toHaveBeenCalledTimes(1)
      expect(prismaService.video.findMany).toHaveBeenCalledWith({
        where: {
          id: undefined,
          variants: undefined,
          label: undefined,
          title: undefined
        },
        skip: 0,
        take: 200
      })
    })
  })
})
