import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { VideoStudyQuestion } from '.prisma/api-videos-client'

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
    it('should update video study questions', async () => {
      prismaService.videoStudyQuestion.findUnique.mockResolvedValueOnce({
        id: 'mockValue0',
        videoId: 'mockVideoId',
        languageId: '529'
      } as unknown as VideoStudyQuestion)
      await service.import({
        value: 'mockValue0',
        videoId: 'mockVideoId',
        languageId: 529,
        primary: 1,
        order: 3,
        crowdinId: 'mockCrowdinId'
      })
      expect(prismaService.videoStudyQuestion.findUnique).toHaveBeenCalledWith({
        where: {
          videoId_languageId_order: {
            languageId: '529',
            videoId: 'mockVideoId',
            order: 3
          }
        }
      })
      expect(prismaService.videoStudyQuestion.update).toHaveBeenCalledWith({
        data: {
          languageId: '529',
          primary: true,
          value: 'mockValue0',
          videoId: 'mockVideoId',
          crowdinId: 'mockCrowdinId',
          order: 3
        },
        where: {
          videoId_languageId_order: {
            languageId: '529',
            videoId: 'mockVideoId',
            order: 3
          }
        }
      })
    })

    it('should not update video study questions when not found', async () => {
      await service.import({
        value: 'mockValue0',
        videoId: 'mockVideoId',
        languageId: 529,
        primary: 1,
        order: 3,
        crowdinId: 'mockCrowdinId'
      })
      expect(prismaService.videoStudyQuestion.findUnique).toHaveBeenCalledWith({
        where: {
          videoId_languageId_order: {
            languageId: '529',
            videoId: 'mockVideoId',
            order: 3
          }
        }
      })
      expect(prismaService.videoTitle.update).not.toHaveBeenCalled()
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
