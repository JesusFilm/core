import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterVideosService } from '../importerVideos/importerVideos.service'
import { ImporterVideoVariantsService } from '../importerVideoVariants/importerVideoVariants.service'

import { ImporterVideoVariantDownloadsService } from './importerVideoVariantDownloads.service'

describe('ImporterVideoVariantDownloadsService', () => {
  let service: ImporterVideoVariantDownloadsService,
    prismaService: DeepMockProxy<PrismaService>,
    videoVariantsService: ImporterVideoVariantsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImporterVideoVariantDownloadsService,
        ImporterVideoVariantsService,
        ImporterVideosService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<ImporterVideoVariantDownloadsService>(
      ImporterVideoVariantDownloadsService
    )
    videoVariantsService = module.get<ImporterVideoVariantsService>(
      ImporterVideoVariantsService
    )
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('import', () => {
    it('should upsert video variant download', async () => {
      videoVariantsService.ids = ['mockVariantId']
      await service.import({
        quality: 'low',
        size: 1111112,
        url: 'www.example.com',
        videoVariantId: 'mockVariantId',
        extraStuff: 'randomData'
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

    it('should throw error when row is invalid', async () => {
      await expect(
        service.import({
          id: 'mockValue0',
          label: 'invalidLabel',
          primaryLanguageId: 529
        })
      ).rejects.toThrow('row does not match schema: mockValue0')
    })

    it('should throw error when row has no id', async () => {
      await expect(
        service.import({
          label: 'short',
          primaryLanguageId: '529'
        })
      ).rejects.toThrow('row does not match schema: unknownId')
    })
  })
})
