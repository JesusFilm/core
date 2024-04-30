import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { VideoVariant } from '.prisma/api-videos-client'

import { PrismaService } from '../../../lib/prisma.service'

import { ImporterVideoVariantsService } from './importerVideoVariants.service'

describe('ImporterVideoVariantsService', () => {
  let service: ImporterVideoVariantsService,
    prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImporterVideoVariantsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<ImporterVideoVariantsService>(
      ImporterVideoVariantsService
    )
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('import', () => {
    it('should update video variant', async () => {
      prismaService.videoVariant.findUnique.mockResolvedValueOnce({
        id: 'mockValue0'
      } as unknown as VideoVariant)
      prismaService.videoVariant.findMany.mockResolvedValueOnce([])
      await service.import({
        id: 'mockId',
        hls: 'www.example.com',
        duration: 123.123,
        languageId: 529,
        videoId: 'videoId',
        otherValues: 'some otherValue',
        someValue: 'otherValue'
      })
      expect(prismaService.videoVariant.findUnique).toHaveBeenCalledWith({
        where: { id: 'mockId' }
      })
      expect(prismaService.videoVariant.update).toHaveBeenCalledWith({
        where: { id: 'mockId' },
        data: {
          duration: 123,
          hls: 'www.example.com',
          id: 'mockId',
          languageId: '529',
          videoId: 'videoId'
        }
      })
    })

    it('should not update video variant when not found', async () => {
      await service.import({
        id: 'mockId',
        hls: 'www.example.com',
        duration: 123.123,
        languageId: 529,
        videoId: 'videoId',
        otherValues: 'some otherValue',
        someValue: 'otherValue'
      })
      expect(prismaService.videoVariant.findUnique).toHaveBeenCalledWith({
        where: { id: 'mockId' }
      })

      expect(prismaService.videoVariant.update).not.toHaveBeenCalled()
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
