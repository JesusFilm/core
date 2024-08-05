import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Video } from '.prisma/api-videos-client'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterVideosService } from '../importerVideos/importerVideos.service'

import { ImporterVideosChildrenService } from './importerVideosChildren.service'

describe('ImporterVideosChildrenService', () => {
  let service: ImporterVideosChildrenService,
    prismaService: DeepMockProxy<PrismaService>,
    importerVideosService: ImporterVideosService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImporterVideosChildrenService,
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

    service = module.get<ImporterVideosChildrenService>(
      ImporterVideosChildrenService
    )
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    importerVideosService = module.get<DeepMockProxy<ImporterVideosService>>(
      ImporterVideosService
    )
    prismaService.video.findMany.mockResolvedValue([])
    prismaService.video.update.mockImplementation()
  })

  describe('process', () => {
    it('should process children', async () => {
      importerVideosService.ids = ['videoId', 'childId']
      prismaService.video.findMany.mockResolvedValueOnce([
        { id: 'videoId', childIds: ['childId'] } as unknown as Video
      ])
      await service.process()
      expect(prismaService.video.update).toHaveBeenCalledWith({
        where: { id: 'videoId' },
        data: {
          children: {
            connect: [{ id: 'childId' }]
          }
        }
      })
    })

    it('should not process children if no children', async () => {
      prismaService.video.findMany.mockResolvedValueOnce([
        { id: 'videoId', childIds: [] } as unknown as Video
      ])
      await service.process()
      expect(prismaService.video.update).not.toHaveBeenCalled()
    })
  })
})
