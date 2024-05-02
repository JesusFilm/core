import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../../lib/prisma.service'

import { ImporterVideoStudyQuestionsService } from './importerVideoStudyQuestions.service'

describe('ImporterVideoStudyQuestionsService', () => {
  let service: ImporterVideoStudyQuestionsService,
    prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImporterVideoStudyQuestionsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<ImporterVideoStudyQuestionsService>(
      ImporterVideoStudyQuestionsService
    )
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('import', () => {
    it('should upsert video study questions', async () => {
      await service.import({
        value: 'mockValue0',
        videoId: 'mockVideoId',
        languageId: 529,
        primary: 1,
        order: 3,
        crowdinId: 'mockCrowdinId'
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
          crowdinId: 'mockCrowdinId',
          languageId: '529',
          order: 3,
          primary: true,
          value: 'mockValue0',
          videoId: 'mockVideoId'
        },
        update: {
          crowdinId: 'mockCrowdinId',
          languageId: '529',
          order: 3,
          primary: true,
          value: 'mockValue0',
          videoId: 'mockVideoId'
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
