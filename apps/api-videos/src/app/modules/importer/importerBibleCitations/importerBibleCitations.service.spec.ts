import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterBibleBooksService } from '../importerBibleBooks/importerBibleBooks.service'
import { ImporterVideosService } from '../importerVideos/importerVideos.service'

import { ImporterBibleCitationsService } from './importerBibleCitations.service'

describe('ImporterBibleCitationsService', () => {
  let service: ImporterBibleCitationsService,
    prismaService: DeepMockProxy<PrismaService>,
    videosService: DeepMockProxy<ImporterVideosService>,
    bibleBooksService: DeepMockProxy<ImporterBibleBooksService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImporterBibleCitationsService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        },
        {
          provide: ImporterBibleBooksService,
          useValue: mockDeep<ImporterBibleBooksService>()
        },
        {
          provide: ImporterVideosService,
          useValue: mockDeep<ImporterVideosService>()
        }
      ]
    }).compile()

    service = module.get<ImporterBibleCitationsService>(
      ImporterBibleCitationsService
    )
    videosService = module.get<DeepMockProxy<ImporterVideosService>>(
      ImporterVideosService
    )
    bibleBooksService = module.get<DeepMockProxy<ImporterBibleBooksService>>(
      ImporterBibleBooksService
    )
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('import', () => {
    it('should upsert bible citation', async () => {
      videosService.ids = ['mockVideoId']
      bibleBooksService.ids = ['1']
      await service.import({
        videoId: 'mockVideoId',
        osisId: 'Gen',
        bibleBookId: 1,
        order: 1,
        chapterStart: 1,
        chapterEnd: null,
        verseStart: 1,
        verseEnd: null,
        position: 1,
        datastream_metadata: {
          uuid: 'mockUuid'
        }
      })
      expect(prismaService.bibleCitation.upsert).toHaveBeenCalledWith({
        where: { id: 'mockUuid' },
        update: {
          id: 'mockUuid',
          videoId: 'mockVideoId',
          osisId: 'Gen',
          bibleBookId: '1',
          order: 1,
          chapterStart: 1,
          chapterEnd: null,
          verseStart: 1,
          verseEnd: null
        },
        create: {
          id: 'mockUuid',
          videoId: 'mockVideoId',
          osisId: 'Gen',
          bibleBookId: '1',
          order: 1,
          chapterStart: 1,
          chapterEnd: null,
          verseStart: 1,
          verseEnd: null
        }
      })
    })

    it('should save many bible citations', async () => {
      videosService.ids = ['mockVideoId']
      bibleBooksService.ids = ['1']
      await service.importMany([
        {
          videoId: 'mockVideoId',
          osisId: 'Gen',
          bibleBookId: 1,
          order: 1,
          chapterStart: 1,
          chapterEnd: null,
          verseStart: 1,
          verseEnd: null,
          position: 1,
          datastream_metadata: {
            uuid: 'mockUuid'
          }
        },
        {
          videoId: 'mockVideoId',
          osisId: 'Gen',
          bibleBookId: 1,
          order: 1,
          chapterStart: 1,
          chapterEnd: null,
          verseStart: 1,
          verseEnd: null,
          position: 1,
          datastream_metadata: {
            uuid: 'mockUuid1'
          }
        }
      ])
      expect(prismaService.bibleCitation.createMany).toHaveBeenCalledWith({
        data: [
          {
            id: 'mockUuid',
            videoId: 'mockVideoId',
            osisId: 'Gen',
            bibleBookId: '1',
            order: 1,
            chapterStart: 1,
            chapterEnd: null,
            verseStart: 1,
            verseEnd: null
          },
          {
            id: 'mockUuid1',
            videoId: 'mockVideoId',
            osisId: 'Gen',
            bibleBookId: '1',
            order: 1,
            chapterStart: 1,
            chapterEnd: null,
            verseStart: 1,
            verseEnd: null
          }
        ],
        skipDuplicates: true
      })
    })

    it('should throw error when row is invalid', async () => {
      await expect(
        service.import({
          id: 1,
          osisId: 'Gen'
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
            osisId: 'Eccl'
          }
        ])
      ).rejects.toThrow('some rows do not match schema: 1,unknownId')
    })
  })
})
