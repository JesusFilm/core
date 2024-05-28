import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Video } from '.prisma/api-videos-client'

import { PrismaService } from '../../../lib/prisma.service'

import { ImporterVideosService } from './importerVideos.service'

describe('ImporterVideosService', () => {
  let service: ImporterVideosService,
    prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImporterVideosService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<ImporterVideosService>(ImporterVideosService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('import', () => {
    it('should upsert video', async () => {
      prismaService.video.findMany.mockResolvedValueOnce([])
      await service.import({
        id: 'mockValue0',
        label: 'short',
        primaryLanguageId: 529,
        slug: 'Some Title',
        extraStuff: 'randomData',
        childIds: null,
        image: null
      })
      expect(prismaService.video.upsert).toHaveBeenCalledWith({
        where: { id: 'mockValue0' },
        create: {
          id: 'mockValue0',
          label: 'shortFilm',
          primaryLanguageId: '529',
          slug: 'some-title',
          childIds: []
        },
        update: {
          id: 'mockValue0',
          label: 'shortFilm',
          primaryLanguageId: '529',
          slug: 'some-title',
          childIds: []
        }
      })
    })

    it('should transform childId string to array', async () => {
      prismaService.video.findMany.mockResolvedValueOnce([])
      await service.import({
        id: 'mockValue0',
        label: 'short',
        primaryLanguageId: 529,
        slug: 'Some Title',
        extraStuff: 'randomData',
        childIds: '{6_GOMattFrench5101,6_GOMattFrench5102}',
        image: null
      })
      expect(prismaService.video.upsert).toHaveBeenCalledWith({
        where: { id: 'mockValue0' },
        create: {
          id: 'mockValue0',
          label: 'shortFilm',
          primaryLanguageId: '529',
          slug: 'some-title',
          childIds: ['6_GOMattFrench5101', '6_GOMattFrench5102']
        },
        update: {
          id: 'mockValue0',
          label: 'shortFilm',
          primaryLanguageId: '529',
          slug: 'some-title',
          childIds: ['6_GOMattFrench5101', '6_GOMattFrench5102']
        }
      })
    })

    it('should update feature', async () => {
      prismaService.video.findMany.mockResolvedValueOnce([])
      await service.import({
        id: 'mockValue0',
        label: 'feature',
        primaryLanguageId: 529,
        slug: 'Some Title',
        extraStuff: 'randomData',
        image: null,
        childIds: null
      })
      expect(prismaService.video.upsert).toHaveBeenCalledWith({
        where: { id: 'mockValue0' },
        create: {
          id: 'mockValue0',
          label: 'featureFilm',
          primaryLanguageId: '529',
          slug: 'some-title',
          childIds: []
        },
        update: {
          id: 'mockValue0',
          label: 'featureFilm',
          primaryLanguageId: '529',
          slug: 'some-title',
          childIds: []
        }
      })
    })

    it('should update behind_the_scenes', async () => {
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
        slug: 'Some Title',
        extraStuff: 'randomData',
        image: null,
        childIds: null
      })
      expect(prismaService.video.upsert).toHaveBeenCalledWith({
        where: { id: 'mockValue0' },
        create: {
          id: 'mockValue0',
          label: 'behindTheScenes',
          primaryLanguageId: '529',
          slug: 'some-title',
          childIds: []
        },
        update: {
          id: 'mockValue0',
          label: 'behindTheScenes',
          primaryLanguageId: '529',
          slug: 'some-title',
          childIds: []
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
