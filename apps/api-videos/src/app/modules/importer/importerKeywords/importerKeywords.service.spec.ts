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
        where: { value_languageId: { value: 'TestKeyword', languageId: '529' } },
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

    it('should save many keywords', async () => {
      await service.importMany([
        { value: 'Keyword1', languageId: '529', videoIds: ['video1'] },
        { value: 'Keyword2', languageId: '530', videoIds: ['video2', 'video3'] }
      ])
      expect(prismaService.keyword.createMany).toHaveBeenCalledWith({
        data: [
          { value: 'Keyword1', languageId: '529' },
          { value: 'Keyword2', languageId: '530' }
        ],
        skipDuplicates: true
      })
      // Note: You might need to test video connections separately
    })

    it('should throw error when keyword is invalid', async () => {
      await expect(
        service.import({
          value: '',  // Assuming empty string is invalid
          languageId: '529'
        })
      ).rejects.toThrow('row does not match schema')
    })
    
    it('should throw error when some keywords are invalid', async () => {
      await expect(
        service.importMany([
          { value: 'Valid', languageId: '529' },
          { value: '', languageId: '530' }  // Invalid
        ])
      ).rejects.toThrow('some rows do not match schema')
    })

  })
})
