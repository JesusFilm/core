import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../../lib/prisma.service'
import { ImporterBibleBooksService } from '../importerBibleBooks/importerBibleBooks.service'

import { ImporterBibleBookNamesService } from './importerBibleBookNames.service'

describe('ImporterBibleBooksService', () => {
  let service: ImporterBibleBookNamesService,
    prismaService: DeepMockProxy<PrismaService>,
    bookService: DeepMockProxy<ImporterBibleBooksService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImporterBibleBookNamesService,
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

    service = module.get<ImporterBibleBookNamesService>(
      ImporterBibleBookNamesService
    )
    bookService = module.get<DeepMockProxy<ImporterBibleBooksService>>(
      ImporterBibleBooksService
    )
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('import', () => {
    it('should upsert bible book name', async () => {
      bookService.ids = ['1']
      await service.import({
        bibleBook: 1,
        translatedName: 'Genesis',
        languageId: 529
      })
      expect(prismaService.bibleBookName.upsert).toHaveBeenCalledWith({
        where: {
          bibleBookId_languageId: { bibleBookId: '1', languageId: '529' }
        },
        update: {
          bibleBookId: '1',
          languageId: '529',
          primary: true,
          value: 'Genesis'
        },
        create: {
          bibleBookId: '1',
          languageId: '529',
          primary: true,
          value: 'Genesis'
        }
      })
    })

    it('should save many bible book names', async () => {
      bookService.ids = ['1']
      await service.importMany([
        {
          bibleBook: 1,
          translatedName: 'Genesis',
          languageId: 529
        },
        {
          bibleBook: 1,
          translatedName: 'Genesis',
          languageId: 629
        }
      ])
      expect(prismaService.bibleBookName.createMany).toHaveBeenCalledWith({
        data: [
          {
            bibleBookId: '1',
            languageId: '529',
            primary: true,
            value: 'Genesis'
          },
          {
            bibleBookId: '1',
            languageId: '629',
            primary: false,
            value: 'Genesis'
          }
        ],
        skipDuplicates: true
      })
    })

    it('should throw error when row is invalid', async () => {
      await expect(
        service.import({
          bibleBook: 1,
          traslatedName: 'Genesis'
        })
      ).rejects.toThrow('row does not match schema: unknownId')
    })

    it('should throw error when some rows are invalid', async () => {
      await expect(
        service.importMany([
          {
            traslatedName: 'Genesis'
          }
        ])
      ).rejects.toThrow('some rows do not match schema: unknownId')
    })
  })
})
