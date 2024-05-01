import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { VideoVariantDownload } from '.prisma/api-videos-client'

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
    it('should update video variant download', async () => {
      prismaService.videoVariantDownload.findUnique.mockResolvedValueOnce({
        id: 'mockValue0'
      } as unknown as VideoVariantDownload)
      await service.import({
        quality: 'low',
        size: 1111112,
        url: 'www.example.com',
        videoVariantId: 'mockVariantId',
        extraStuff: 'randomData'
      })
      expect(
        prismaService.videoVariantDownload.findUnique
      ).toHaveBeenCalledWith({
        where: {
          quality_videoVariantId: {
            quality: 'low',
            videoVariantId: 'mockVariantId'
          }
        }
      })
      expect(prismaService.videoVariantDownload.update).toHaveBeenCalledWith({
        where: {
          quality_videoVariantId: {
            quality: 'low',
            videoVariantId: 'mockVariantId'
          }
        },
        data: {
          quality: 'low',
          size: 1111112,
          url: 'www.example.com',
          videoVariantId: 'mockVariantId'
        }
      })
    })

    it('should not update video variant download when not found', async () => {
      await service.import({
        quality: 'low',
        size: 1111112,
        url: 'www.example.com',
        videoVariantId: 'mockVariantId',
        extraStuff: 'randomData'
      })
      expect(
        prismaService.videoVariantDownload.findUnique
      ).toHaveBeenCalledWith({
        where: {
          quality_videoVariantId: {
            quality: 'low',
            videoVariantId: 'mockVariantId'
          }
        }
      })

      expect(prismaService.videoVariantDownload.update).not.toHaveBeenCalled()
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
