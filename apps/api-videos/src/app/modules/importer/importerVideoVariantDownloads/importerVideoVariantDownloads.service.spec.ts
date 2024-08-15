import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../../lib/prisma.service'

import { ImporterVideoVariantDownloadsService } from './importerVideoVariantDownloads.service'

describe('ImporterVideoVariantDownloadsService', () => {
  let service: ImporterVideoVariantDownloadsService,
    prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImporterVideoVariantDownloadsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<ImporterVideoVariantDownloadsService>(
      ImporterVideoVariantDownloadsService
    )
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('import', () => {
    it('should upsert video variant download', async () => {
      service.videoVariantIds = ['mockVariantId']
      await service.import({
        quality: 'low',
        size: 1111112,
        uri: 'www.example.com',
        videoVariantId: 'mockVariantId'
      })
      expect(prismaService.videoVariantDownload.upsert).toHaveBeenCalledWith({
        where: {
          quality_videoVariantId: {
            quality: 'low',
            videoVariantId: 'mockVariantId'
          }
        },
        create: {
          quality: 'low',
          size: 1111112,
          url: 'www.example.com',
          videoVariantId: 'mockVariantId'
        },
        update: {
          quality: 'low',
          size: 1111112,
          url: 'www.example.com',
          videoVariantId: 'mockVariantId'
        }
      })
    })

    it('should save many video variant downloads', async () => {
      service.videoVariantIds = ['mockVariantId', 'mockVariantId2']
      await service.importMany([
        {
          quality: 'low',
          size: 1111112,
          uri: 'www.example.com',
          videoVariantId: 'mockVariantId'
        },
        {
          quality: 'low',
          size: 1111112,
          uri: 'www.example.com',
          videoVariantId: 'mockVariantId2'
        }
      ])
      expect(
        prismaService.videoVariantDownload.createMany
      ).toHaveBeenCalledWith({
        data: [
          {
            quality: 'low',
            size: 1111112,
            url: 'www.example.com',
            videoVariantId: 'mockVariantId'
          },
          {
            quality: 'low',
            size: 1111112,
            url: 'www.example.com',
            videoVariantId: 'mockVariantId2'
          }
        ],
        skipDuplicates: true
      })
    })

    it('should throw error when row is invalid', async () => {
      service.videoVariantIds = ['mockVariantId']
      await expect(
        service.import({
          id: 'mockValue0',
          label: 'invalidLabel',
          primaryLanguageId: 529
        })
      ).rejects.toThrow('row does not match schema: mockValue0')
    })

    it('should throw error when row has no id', async () => {
      service.videoVariantIds = ['mockVariantId']
      await expect(
        service.import({
          label: 'short',
          primaryLanguageId: '529'
        })
      ).rejects.toThrow('row does not match schema: unknownId')
    })

    it('should throw error if video variant is not found', async () => {
      prismaService.videoVariant.findMany.mockResolvedValueOnce([])
      await expect(
        service.import({
          quality: 'low',
          size: 1111112,
          uri: 'www.example.com',
          videoVariantId: 'mockVariantId'
        })
      ).rejects.toThrow('Video variant with id mockVariantId not found')
    })
  })
})
