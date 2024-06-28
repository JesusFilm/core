import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { PrismaService } from '../../../lib/prisma.service'
import { ImporterVideoVariantsService } from '../importerVideoVariants/importerVideoVariants.service'
import { ImporterVideosService } from '../importerVideos/importerVideos.service'
import { ImporterVideoSubtitlesService } from './importerVideoSubtitle.service'
describe('ImporterVideoSubtitlesService', () => {
  let service: ImporterVideoSubtitlesService,
    prismaService: DeepMockProxy<PrismaService>,
    videoVariantsService: ImporterVideoVariantsService
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImporterVideoSubtitlesService,
        ImporterVideoVariantsService,
        ImporterVideosService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    service = module.get<ImporterVideoSubtitlesService>(
      ImporterVideoSubtitlesService
    )
    videoVariantsService = module.get<ImporterVideoVariantsService>(
      ImporterVideoVariantsService
    )
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })
  describe('import', () => {
    it('should update video variant subtitle', async () => {
      videoVariantsService.ids = ['mockVideoVariantId']
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
    it('should save many video variant subtitles', async () => {
      videoVariantsService.ids = ['mockVideoVariantId', 'mockVideoVariantId1']
      await service.importMany([
        {
          value: 'mockValue',
          primary: 1,
          languageId: 529,
          videoVariantId: 'mockVideoVariantId',
          format: 'VTT',
          extraStuff: 'randomData'
        },
        {
          value: 'mockValue1',
          primary: 1,
          languageId: 529,
          videoVariantId: 'mockVideoVariantId1',
          format: 'VTT',
          extraStuff: 'randomData'
        }
      ])
      expect(
        prismaService.videoVariantSubtitle.createMany
      ).toHaveBeenCalledWith({
        data: [
          {
            value: 'mockValue',
            primary: true,
            languageId: '529',
            videoVariantId: 'mockVideoVariantId'
          },
          {
            value: 'mockValue1',
            primary: true,
            languageId: '529',
            videoVariantId: 'mockVideoVariantId1'
          }
        ],
        skipDuplicates: true
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
    it('should throw error if video variant is not found', async () => {
      videoVariantsService.ids = []
      await expect(
        service.import({
          value: 'mockValue',
          primary: 1,
          languageId: 529,
          videoVariantId: 'mockVideoVariantId',
          format: 'VTT',
          extraStuff: 'randomData'
        })
      ).rejects.toThrow('Video variant with id mockVideoVariantId not found')
    })
  })
})
