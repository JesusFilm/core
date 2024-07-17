import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { PrismaService } from '../../../lib/prisma.service'
import { ImporterBibleBooksService } from '../importerBibleBooks/importerBibleBooks.service'
import { ImporterBibleCitationsService } from './importerBibleCitations.service'

describe('ImporterBibleCitationsService', () => {
  let service: ImporterBibleCitationsService,
    prismaService: DeepMockProxy<PrismaService>

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
        }
      ]
    }).compile()

    service = module.get<ImporterBibleCitationsService>(
      ImporterBibleCitationsService
    )
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('import', () => {
    it('should upsert bible citation', async () => {
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
      expect(prismaService.bibleCitation.createMany).toBeCalledWith({
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
