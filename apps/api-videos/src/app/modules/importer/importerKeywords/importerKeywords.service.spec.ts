import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterVideosService } from '../importerVideos/importerVideos.service'

import { ImporterKeywordsService } from './importerKeywords.service'

describe('ImporterKeywordsService', () => {
  let service: ImporterKeywordsService,
    prismaService: DeepMockProxy<PrismaService>,
    videosService: DeepMockProxy<ImporterVideosService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImporterKeywordsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        },
        {
          provide: ImporterVideosService,
          useValue: mockDeep<ImporterVideosService>()
        }
      ]
    }).compile()

    service = module.get<ImporterKeywordsService>(ImporterKeywordsService)
    videosService = module.get<DeepMockProxy<ImporterVideosService>>(
      ImporterVideosService
    )
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('import', () => {
    it('should upsert keyword', async () => {
      videosService.ids = ['video1', 'video2']
      await service.import({
        value: 'TestKeyword',
        languageId: 529,
        videoIds: 'video1,video2',
        datastream_metadata: {
          uuid: 'mockUuid'
        }
      })
      expect(prismaService.keyword.upsert).toHaveBeenCalledWith({
        where: {
          value_languageId: { value: 'TestKeyword', languageId: '529' }
        },
        update: {
          id: 'mockUuid',
          value: 'TestKeyword',
          languageId: '529',
          videos: { connect: [{ id: 'video1' }, { id: 'video2' }] }
        },
        create: {
          id: 'mockUuid',
          value: 'TestKeyword',
          languageId: '529',
          videos: { connect: [{ id: 'video1' }, { id: 'video2' }] }
        }
      })
    })

    it('should save many keywords', async () => {
      videosService.ids = ['video1', 'video2', 'video3']

      await service.importMany([
        {
          value: 'TestKeyword1',
          languageId: 529,
          videoIds: 'video1,video2',
          datastream_metadata: {
            uuid: 'mockUuid'
          }
        },
        {
          value: 'TestKeyword2',
          languageId: 529,
          videoIds: 'video3',
          datastream_metadata: {
            uuid: 'mockUuid1'
          }
        }
      ])

      expect(prismaService.keyword.createMany).toHaveBeenCalledWith({
        data: [
          {
            id: 'mockUuid',
            value: 'TestKeyword1',
            languageId: '529'
          },
          {
            id: 'mockUuid1',
            value: 'TestKeyword2',
            languageId: '529'
          }
        ],
        skipDuplicates: true
      })

      expect(prismaService.keyword.update).toHaveBeenCalledWith({
        where: { id: 'mockUuid' },
        data: {
          videos: {
            connect: [{ id: 'video1' }, { id: 'video2' }]
          }
        }
      })

      expect(prismaService.keyword.update).toHaveBeenCalledWith({
        where: { id: 'mockUuid1' },
        data: {
          videos: {
            connect: [{ id: 'video3' }]
          }
        }
      })
    })

    it('should throw error when row is invalid', async () => {
      await expect(
        service.import({
          id: 1,
          value: 'TestKeyword'
        })
      ).rejects.toThrow('row does not match schema: 1')
    })

    it('should throw error when some rows are invalid', async () => {
      await expect(
        service.importMany([
          {
            id: 1
          },
          {
            value: 'TestKeyword'
          }
        ])
      ).rejects.toThrow('some rows do not match schema: 1,unknownId')
    })
  })
})
