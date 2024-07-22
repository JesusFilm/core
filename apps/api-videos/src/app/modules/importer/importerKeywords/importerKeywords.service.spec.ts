import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Keyword } from '.prisma/api-videos-client'

import { PrismaService } from '../../../lib/prisma.service'

import { ImporterKeywordsService } from './importerKeywords.service'

describe('ImporterKeywordsService', () => {
  let service: ImporterKeywordsService,
    prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImporterKeywordsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<ImporterKeywordsService>(ImporterKeywordsService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('import', () => {
    it('should upsert keyword', async () => {
      await service.import({
        value: 'TestKeyword',
        languageId: '529',
        videoIds: ['video1', 'video2']
      })
      expect(prismaService.keyword.upsert).toHaveBeenCalledWith({
        where: {
          value_languageId: { value: 'TestKeyword', languageId: '529' }
        },
        create: {
          value: 'TestKeyword',
          languageId: '529',
          videos: { connect: [{ id: 'video1' }, { id: 'video2' }] }
        },
        update: {
          value: 'TestKeyword',
          languageId: '529',
          videos: { connect: [{ id: 'video1' }, { id: 'video2' }] }
        }
      })
    })
  })
})

// 2_Acts7305-0-0
// 3
// 11167
// 722
// 2024-06-18 18:35:58 UTC

// 2_Acts7305-0-0
// 3
// 11167
// 722
// 2024-06-18 18:35:58 UTC

// 2_Acts7305-0-0
// 3
// 11167
// 722
// 2024-06-18 18:35:58 UTC
