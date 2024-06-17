import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterVideosService } from '../importerVideos/importerVideos.service'

import { ImporterVideoStudyQuestionsService } from './importerVideoStudyQuestions.service'

describe('ImporterVideoStudyQuestionsService', () => {
  let service: ImporterVideoStudyQuestionsService,
    prismaService: DeepMockProxy<PrismaService>,
    videosService: ImporterVideosService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImporterVideoStudyQuestionsService,
        ImporterVideosService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<ImporterVideoStudyQuestionsService>(
      ImporterVideoStudyQuestionsService
    )
    videosService = module.get<ImporterVideosService>(ImporterVideosService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('import', () => {
    it('should upsert video study questions', async () => {
      videosService.ids = ['mockVideoId']
      await service.import({
        value: 'mockValue0',
        videoId: 'mockVideoId',
        languageId: 529,
        primary: 1,
        order: 3,
        crowdInId: 'mockCrowdinId'
      })
      expect(prismaService.videoStudyQuestion.upsert).toHaveBeenCalledWith({
        where: {
          videoId_languageId_order: {
            languageId: '529',
            videoId: 'mockVideoId',
            order: 3
          }
        },
        create: {
          crowdInId: 'mockCrowdinId',
          languageId: '529',
          order: 3,
          primary: true,
          value: 'mockValue0',
          videoId: 'mockVideoId'
        },
        update: {
          crowdInId: 'mockCrowdinId',
          languageId: '529',
          order: 3,
          primary: true,
          value: 'mockValue0',
          videoId: 'mockVideoId'
        }
      })
    })

    it('should save many video study questions', async () => {
      videosService.ids = ['mockVideoId', 'mockVideoId1']
      await service.importMany([
        {
          value: 'mockValue',
          videoId: 'mockVideoId',
          languageId: 529,
          primary: 1,
          order: 3,
          crowdInId: 'mockCrowdinId'
        },
        {
          value: 'mockValue1',
          videoId: 'mockVideoId1',
          languageId: 529,
          primary: 1,
          order: 3,
          crowdInId: 'mockCrowdinId1'
        }
      ])
      expect(prismaService.videoStudyQuestion.createMany).toHaveBeenCalledWith({
        data: [
          {
            value: 'mockValue',
            videoId: 'mockVideoId',
            languageId: '529',
            primary: true,
            order: 3,
            crowdInId: 'mockCrowdinId'
          },
          {
            value: 'mockValue1',
            videoId: 'mockVideoId1',
            languageId: '529',
            primary: true,
            order: 3,
            crowdInId: 'mockCrowdinId1'
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
          videoId: 'mockVideoId2',
          languageId: 529,
          primary: 1,
          order: 3,
          crowdInId: 'mockCrowdinId'
        })
      ).rejects.toThrow('Video with id mockVideoId2 not found')
    })
  })
})
