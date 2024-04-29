import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Video } from '.prisma/api-videos-client'

import { PrismaService } from '../../../lib/prisma.service'

import { VideosService } from './videos.service'

describe('VideosService', () => {
  let service: VideosService, prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideosService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<VideosService>(VideosService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('import', () => {
    it('should update video', async () => {
      prismaService.video.findUnique.mockResolvedValueOnce({
        id: 'mockValue0'
      } as unknown as Video)
      prismaService.video.findMany.mockResolvedValueOnce([])
      await service.import({
        id: 'mockValue0',
        label: 'short',
        primaryLanguageId: 529,
        title: 'Some Title',
        extraStuff: 'randomData'
      })
      expect(prismaService.video.findUnique).toHaveBeenCalledWith({
        where: { id: 'mockValue0' }
      })
      expect(prismaService.video.update).toHaveBeenCalledWith({
        where: { id: 'mockValue0' },
        data: {
          id: 'mockValue0',
          label: 'shortFilm',
          primaryLanguageId: '529',
          slug: 'some-title'
        }
      })
    })

    it('should update feature', async () => {
      prismaService.video.findUnique.mockResolvedValueOnce({
        id: 'mockValue0'
      } as unknown as Video)
      prismaService.video.findMany.mockResolvedValueOnce([
        {
          slug: 'someslug',
          id: 'mockValue0'
        } as unknown as Video
      ])
      await service.import({
        id: 'mockValue0',
        label: 'feature',
        primaryLanguageId: 529,
        title: 'Some Title',
        extraStuff: 'randomData'
      })
      expect(prismaService.video.findUnique).toHaveBeenCalledWith({
        where: { id: 'mockValue0' }
      })
      expect(prismaService.video.update).toHaveBeenCalledWith({
        where: { id: 'mockValue0' },
        data: {
          id: 'mockValue0',
          label: 'featureFilm',
          primaryLanguageId: '529',
          slug: 'some-title'
        }
      })
    })

    it('should update behind_the_scenes', async () => {
      prismaService.video.findUnique.mockResolvedValueOnce({
        id: 'mockValue0'
      } as unknown as Video)
      prismaService.video.findMany.mockResolvedValueOnce([
        {
          slug: 'someslug',
          id: 'mockValue0'
        } as unknown as Video
      ])
      await service.import({
        id: 'mockValue0',
        label: 'behind_the_scenes',
        primaryLanguageId: 529,
        title: 'Some Title',
        extraStuff: 'randomData'
      })
      expect(prismaService.video.findUnique).toHaveBeenCalledWith({
        where: { id: 'mockValue0' }
      })
      expect(prismaService.video.update).toHaveBeenCalledWith({
        where: { id: 'mockValue0' },
        data: {
          id: 'mockValue0',
          label: 'behindTheScenes',
          primaryLanguageId: '529',
          slug: 'some-title'
        }
      })
    })

    it('should not update video when not found', async () => {
      await service.import({
        id: 'mockValue0',
        label: 'shortFilm',
        primaryLanguageId: 529,
        title: 'Some Title',
        extraStuff: 'randomData'
      })
      expect(prismaService.video.findUnique).toHaveBeenCalledWith({
        where: { id: 'mockValue0' }
      })

      expect(prismaService.video.update).not.toHaveBeenCalled()
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
