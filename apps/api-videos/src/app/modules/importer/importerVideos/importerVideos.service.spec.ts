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
      await service.getUsedSlugs()
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
          childIds: [],
          image: null,
          noIndex: false
        },
        update: {
          id: 'mockValue0',
          label: 'shortFilm',
          primaryLanguageId: '529',
          slug: 'some-title',
          childIds: [],
          image: null,
          noIndex: false
        }
      })
    })

    it('should save many videos', async () => {
      prismaService.video.findMany.mockResolvedValueOnce([])
      await service.getUsedSlugs()
      await service.importMany([
        {
          id: 'mockValue0',
          label: 'short',
          primaryLanguageId: 529,
          slug: 'Some Title',
          extraStuff: 'randomData',
          childIds: null,
          image: null
        },
        {
          id: 'mockValue1',
          label: 'segments',
          primaryLanguageId: 529,
          slug: 'Some Title1',
          extraStuff: 'randomData',
          childIds: null,
          image: null
        }
      ])
      expect(prismaService.video.createMany).toHaveBeenCalledWith({
        data: [
          {
            id: 'mockValue0',
            label: 'shortFilm',
            primaryLanguageId: '529',
            slug: 'some-title',
            childIds: [],
            image: null,
            noIndex: false
          },
          {
            id: 'mockValue1',
            label: 'segment',
            primaryLanguageId: '529',
            slug: 'some-title1',
            childIds: [],
            image: null,
            noIndex: false
          }
        ],
        skipDuplicates: true
      })
    })

    it('should transform childId string to array', async () => {
      prismaService.video.findMany.mockResolvedValueOnce([])
      await service.getUsedSlugs()
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
          childIds: ['6_GOMattFrench5101', '6_GOMattFrench5102'],
          image: null,
          noIndex: false
        },
        update: {
          id: 'mockValue0',
          label: 'shortFilm',
          primaryLanguageId: '529',
          slug: 'some-title',
          childIds: ['6_GOMattFrench5101', '6_GOMattFrench5102'],
          image: null,
          noIndex: false
        }
      })
    })

    it('should update feature', async () => {
      prismaService.video.findMany.mockResolvedValueOnce([])
      await service.getUsedSlugs()
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
          childIds: [],
          image: null,
          noIndex: false
        },
        update: {
          id: 'mockValue0',
          label: 'featureFilm',
          primaryLanguageId: '529',
          slug: 'some-title',
          childIds: [],
          image: null,
          noIndex: false
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
      await service.getUsedSlugs()
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
          childIds: [],
          image: null,
          noIndex: false
        },
        update: {
          id: 'mockValue0',
          label: 'behindTheScenes',
          primaryLanguageId: '529',
          slug: 'some-title',
          childIds: [],
          image: null,
          noIndex: false
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

    it('should throw error when some rows are invalid', async () => {
      prismaService.video.findMany.mockResolvedValueOnce([])
      await service.getUsedSlugs()
      await expect(
        service.importMany([
          {
            id: 'mockValue0',
            label: 'short',
            primaryLanguageId: 529,
            slug: 'Some Title',
            extraStuff: 'randomData',
            childIds: null,
            image: null
          },
          {
            id: 'mockValue1',
            label: 'invalidLabel',
            primaryLanguageId: 529
          }
        ])
      ).rejects.toThrow('some rows do not match schema: mockValue1')
    })

    it('should throw error when some rows have no id', async () => {
      prismaService.video.findMany.mockResolvedValueOnce([])
      await service.getUsedSlugs()
      await expect(
        service.importMany([
          {
            id: 'mockValue0',
            label: 'short',
            primaryLanguageId: 529,
            slug: 'Some Title',
            extraStuff: 'randomData',
            childIds: null,
            image: null
          },
          {
            label: 'invalidLabel',
            primaryLanguageId: 529
          }
        ])
      ).rejects.toThrow('some rows do not match schema: unknownId')
    })
  })
})
