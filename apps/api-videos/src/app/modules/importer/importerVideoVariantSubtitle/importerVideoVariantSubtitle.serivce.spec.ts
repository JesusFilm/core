import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterVideosService } from '../importerVideos/importerVideos.service'
import { ImporterVideoVariantsService } from '../importerVideoVariants/importerVideoVariants.service'

import { ImporterVideoVariantSubtitlesService } from './importerVideovariantSubtitle.service'

describe('ImporterVideoVariantSubtitlesService', () => {
  let service: ImporterVideoVariantSubtitlesService,
    prismaService: DeepMockProxy<PrismaService>,
    videoVariantsService: ImporterVideoVariantsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImporterVideoVariantSubtitlesService,
        ImporterVideoVariantsService,
        ImporterVideosService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<ImporterVideoVariantSubtitlesService>(
      ImporterVideoVariantSubtitlesService
    )
    videoVariantsService = module.get<ImporterVideoVariantsService>(
      ImporterVideoVariantsService
    )
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('import', () => {
    videoVariantsService.ids = ['mockVideoVariantId']

    it('should update video variant subtitle', async () => {
      await service.import({
        value: 'mockValue',
        primary: 1,
        languageId: 529,
        videoVariantId: 'mockVideoVariantId',
        format: 'VTT',
        extraStuff: 'randomData'
      })
      expect(prismaService.videoVariantSubtitle.upsert).toHaveBeenCalledWith({
        where: {
          videoVariantId_languageId: {
            languageId: '529',
            videoVariantId: 'mockVideoVariantId'
          }
        },
        create: {
          languageId: '529',
          primary: true,
          value: 'mockValue',
          videoVariantId: 'mockVideoVariantId'
        },
        update: {
          languageId: '529',
          primary: true,
          value: 'mockValue',
          videoVariantId: 'mockVideoVariantId'
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
  })
})
