import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../lib/prisma.service'

import { VideoVariantResolver } from './videoVariant.resolver'

describe('VideoVariantResolver', () => {
  let resolver: VideoVariantResolver,
    prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoVariantResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<VideoVariantResolver>(VideoVariantResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    prismaService.videoVariantSubtitle.findMany.mockResolvedValue([])
  })

  describe('language', () => {
    it('returns object for federation', async () => {
      expect(await resolver.language({ languageId: 'languageId' })).toEqual({
        __typename: 'Language',
        id: 'languageId'
      })
    })
  })

  it('returns subtitle count', async () => {
    prismaService.videoVariantSubtitle.count.mockResolvedValue(2)
    expect(
      await resolver.subtitleCount({
        subtitle: [
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

  describe('subtitle', () => {
    it('returns subtitle', async () => {
      expect(
        await resolver.subtitle(
          {
            id: 'id'
          },
          'languageId',
          true
        )
      ).toEqual([])
    })

    it('returns subtitle without languageId', async () => {
      expect(
        await resolver.subtitle(
          {
            id: 'id'
          },
          undefined,
          true
        )
      ).toEqual([])
      expect(prismaService.videoVariantSubtitle.findMany).toHaveBeenCalledWith({
        where: {
          videoVariantId: 'id',
          OR: [{ languageId: undefined }, { primary: true }]
        }
      })
    })

    it('returns subtitle without primary', async () => {
      expect(
        await resolver.subtitle(
          {
            id: 'id'
          },
          'languageId',
          undefined
        )
      ).toEqual([])
      expect(prismaService.videoVariantSubtitle.findMany).toHaveBeenCalledWith({
        where: {
          videoVariantId: 'id',
          OR: [{ languageId: 'languageId' }, { primary: undefined }]
        }
      })
    })

    it('returns subtitle without languageId and primary', async () => {
      expect(
        await resolver.subtitle(
          {
            id: 'id'
          },
          undefined,
          undefined
        )
      ).toEqual([])
      expect(prismaService.videoVariantSubtitle.findMany).toHaveBeenCalledWith({
        where: {
          videoVariantId: 'id'
        }
      })
    })
  })
})
