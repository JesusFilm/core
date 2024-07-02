import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../../lib/prisma.service'

import { ImporterVideoDescriptionService } from './importerVideoDescriptions.service'

describe('ImporterVideoDescriptionService', () => {
  let service: ImporterVideoDescriptionService,
    prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImporterVideoDescriptionService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<ImporterVideoDescriptionService>(
      ImporterVideoDescriptionService
    )
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('import', () => {
    it('should update video description', async () => {
      await service.import({
        value: 'mockValue0',
        videoId: 'mockVideoId',
        languageId: 529,
        primary: 1
      })
      expect(prismaService.videoDescription.upsert).toHaveBeenCalledWith({
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
