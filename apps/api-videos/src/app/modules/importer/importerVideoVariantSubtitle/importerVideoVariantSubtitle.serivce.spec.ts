import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { VideoVariantSubtitle } from '.prisma/api-videos-client'

import { PrismaService } from '../../../lib/prisma.service'

import { ImporterVideoVariantSubtitlesService } from './importerVideovariantSubtitile.service'

describe('ImporterVideoVariantSubtitlesService', () => {
  let service: ImporterVideoVariantSubtitlesService,
    prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImporterVideoVariantSubtitlesService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<ImporterVideoVariantSubtitlesService>(
      ImporterVideoVariantSubtitlesService
    )
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('import', () => {
    it('should update video variant subtitle', async () => {
      prismaService.videoVariantSubtitle.findUnique.mockResolvedValueOnce({
        id: 'mockValue0'
      } as unknown as VideoVariantSubtitle)
      await service.import({
        value: 'mockValue',
        primary: 1,
        languageId: 529,
        videoVariantId: 'mockVideoVariantId',
        extraStuff: 'randomData'
      })
      expect(
        prismaService.videoVariantSubtitle.findUnique
      ).toHaveBeenCalledWith({
        where: {
          videoVariantId_languageId: {
            languageId: '529',
            videoVariantId: 'mockVideoVariantId'
          }
        }
      })
      expect(prismaService.videoVariantSubtitle.update).toHaveBeenCalledWith({
        where: {
          videoVariantId_languageId: {
            languageId: '529',
            videoVariantId: 'mockVideoVariantId'
          }
        },
        data: {
          languageId: '529',
          primary: true,
          value: 'mockValue',
          videoVariantId: 'mockVideoVariantId'
        }
      })
    })

    it('should not update video variant subtitle when not found', async () => {
      await service.import({
        value: 'mockValue',
        primary: 1,
        languageId: 529,
        videoVariantId: 'mockVideoVariantId',
        extraStuff: 'randomData'
      })
      expect(
        prismaService.videoVariantSubtitle.findUnique
      ).toHaveBeenCalledWith({
        where: {
          videoVariantId_languageId: {
            languageId: '529',
            videoVariantId: 'mockVideoVariantId'
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
  })
})
