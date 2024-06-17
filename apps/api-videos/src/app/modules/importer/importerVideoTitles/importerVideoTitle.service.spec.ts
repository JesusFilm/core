import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterVideosService } from '../importerVideos/importerVideos.service'

import { ImporterVideoTitleService } from './importerVideoTitle.service'

describe('ImporterVideoTitleService', () => {
  let service: ImporterVideoTitleService,
    prismaService: DeepMockProxy<PrismaService>,
    videosService: ImporterVideosService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImporterVideoTitleService,
        ImporterVideosService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<ImporterVideoTitleService>(ImporterVideoTitleService)
    videosService = module.get<ImporterVideosService>(ImporterVideosService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('import', () => {
    it('should upsert videoTitle', async () => {
      videosService.ids = ['mockVideoId']
      await service.import({
        value: 'mockValue0',
        videoId: 'mockVideoId',
        languageId: 529,
        primary: 1
      })
      expect(prismaService.videoTitle.upsert).toHaveBeenCalledWith({
        where: {
          videoId_languageId: {
            languageId: '529',
            videoId: 'mockVideoId'
          }
        },
        create: {
          languageId: '529',
          primary: true,
          value: 'mockValue0',
          videoId: 'mockVideoId'
        },
        update: {
          languageId: '529',
          primary: true,
          value: 'mockValue0',
          videoId: 'mockVideoId'
        }
      })
    })

    it('should save many video titles', async () => {
      videosService.ids = ['mockVideoId', 'mockVideoId2']
      await service.importMany([
        {
          value: 'mockValue0',
          videoId: 'mockVideoId',
          languageId: 529,
          primary: 1
        },
        {
          value: 'mockValue0',
          videoId: 'mockVideoId2',
          languageId: 529,
          primary: 1
        }
      ])
      expect(prismaService.videoTitle.createMany).toHaveBeenCalledWith({
        data: [
          {
            value: 'mockValue0',
            videoId: 'mockVideoId',
            languageId: '529',
            primary: true
          },
          {
            value: 'mockValue0',
            videoId: 'mockVideoId2',
            languageId: '529',
            primary: true
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

    it('should throw error if video is not found', async () => {
      videosService.ids = []
      await expect(
        service.import({
          value: 'mockValue0',
          videoId: 'mockVideoId',
          languageId: 529,
          primary: 1
        })
      ).rejects.toThrow('Video with id mockVideoId not found')
    })
  })
})
