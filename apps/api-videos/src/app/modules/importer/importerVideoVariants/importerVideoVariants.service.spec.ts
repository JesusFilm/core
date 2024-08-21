import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterLanguageSlugsService } from '../importerLanguageSlugs/importerLanguageSlugs.service'
import { ImporterVideosService } from '../importerVideos/importerVideos.service'

import { ImporterVideoVariantsService } from './importerVideoVariants.service'

describe('ImporterVideoVariantsService', () => {
  let service: ImporterVideoVariantsService,
    prismaService: DeepMockProxy<PrismaService>,
    videosService: ImporterVideosService,
    languageSlugsService: ImporterLanguageSlugsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImporterVideoVariantsService,
        ImporterLanguageSlugsService,
        ImporterVideosService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<ImporterVideoVariantsService>(
      ImporterVideoVariantsService
    )
    videosService = module.get<ImporterVideosService>(ImporterVideosService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    languageSlugsService = module.get<ImporterLanguageSlugsService>(
      ImporterLanguageSlugsService
    )

    prismaService.videoVariant.findMany.mockResolvedValue([])
    await service.getExistingIds()
  })

  describe('import', () => {
    it('should update video variant', async () => {
      videosService.usedSlugs = { videoId: 'Variant-Title' }
      languageSlugsService.slugs = { '529': 'english' }

      await service.import({
        id: 'mockId',
        hls: 'www.example.com',
        duration: 123.123,
        languageId: 529,
        videoId: 'videoId',
        slug: 'variant-title',
        languageName: 'english',
        otherValues: 'some otherValue',
        someValue: 'otherValue',
        edition: 'mockEdition'
      })

      expect(prismaService.videoVariant.upsert).toHaveBeenCalledWith({
        where: { id: 'mockId' },
        create: {
          duration: 123,
          hls: 'www.example.com',
          id: 'mockId',
          languageId: '529',
          slug: 'Variant-Title/english',
          videoId: 'videoId',
          edition: 'mockEdition'
        },
        update: {
          duration: 123,
          hls: 'www.example.com',
          id: 'mockId',
          languageId: '529',
          slug: 'Variant-Title/english',
          videoId: 'videoId',
          edition: 'mockEdition'
        }
      })
    })

    it('should save many video variants', async () => {
      videosService.usedSlugs = { videoId: 'Variant-Title' }
      languageSlugsService.slugs = { '529': 'english', '3804': 'korean' }

      await service.importMany([
        {
          id: 'mockId',
          hls: 'www.example.com',
          duration: 123.123,
          languageId: 529,
          videoId: 'videoId',
          slug: 'variant-title',
          languageName: 'english',
          otherValues: 'some otherValue',
          someValue: 'otherValue',
          edition: 'mockEdition'
        },
        {
          id: 'mockId',
          hls: 'www.example.com',
          duration: 123.123,
          languageId: 3804,
          videoId: 'videoId',
          slug: 'variant-title',
          languageName: 'korean',
          otherValues: 'some otherValue',
          someValue: 'otherValue',
          edition: 'mockEdition'
        }
      ])

      expect(prismaService.videoVariant.createMany).toHaveBeenCalledWith({
        data: [
          {
            id: 'mockId',
            hls: 'www.example.com',
            duration: 123,
            languageId: '529',
            slug: 'Variant-Title/english',
            videoId: 'videoId',
            edition: 'mockEdition'
          },
          {
            id: 'mockId',
            hls: 'www.example.com',
            duration: 123,
            languageId: '3804',
            slug: 'Variant-Title/korean',
            videoId: 'videoId',
            edition: 'mockEdition'
          }
        ],
        skipDuplicates: true
      })
    })

    it('should throw error if cannot find video for the video variant', async () => {
      videosService.usedSlugs = {}

      expect(
        await service.import({
          id: 'mockId',
          hls: 'www.example.com',
          duration: 123.123,
          languageId: 529,
          videoId: 'videoId',
          slug: 'Variant-Title',
          languageName: 'english',
          otherValues: 'some otherValue',
          someValue: 'otherValue',
          edition: 'mockEdition'
        })
      ).toBeUndefined()
    })

    it('should throw error when row is invalid', async () => {
      await expect(
        service.import({
          id: 'mockId',
          hls: 'www.example.com',
          languageId: 529,
          videoId: 'videoId'
        })
      ).rejects.toThrow('row does not match schema: mockId')
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
