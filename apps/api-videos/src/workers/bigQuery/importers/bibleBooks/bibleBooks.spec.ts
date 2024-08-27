import { BibleBook } from '.prisma/api-videos-client'

import { prismaMock } from '../../../../../test/prismaMock'
import { processTable } from '../../importer'

import { importMany, importOne, setBibleBookIds } from './bibleBooks'

import { getBibleBookIds, importBibleBooks } from '.'

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.requireActual('../../importer').parse,
  parseMany: jest.requireActual('../../importer').parseMany
}))

describe('bigQuery/importers/bibleBooks', () => {
  afterEach(() => {
    setBibleBookIds([])
  })

  describe('importBibleBooks', () => {
    it('should import bible books', async () => {
      prismaMock.bibleBook.findMany.mockResolvedValue([
        { id: '1' } as unknown as BibleBook
      ])
      expect(getBibleBookIds()).toEqual([])
      const cleanup = await importBibleBooks()
      expect(getBibleBookIds()).toEqual(['1'])
      cleanup()
      expect(getBibleBookIds()).toEqual([])
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_bibleBooks_arclight_data',
        importOne,
        importMany,
        false,
        undefined
      )
    })
  })

  describe('importOne', () => {
    it('should import one bible book', async () => {
      prismaMock.bibleBook.upsert.mockResolvedValue({} as unknown as BibleBook)
      await importOne({
        id: 1,
        name: 'Genesis',
        osisId: 'Gen',
        alternateName: null,
        paratextAbbreviation: 'GEN',
        isNewTestament: 0,
        order: 1,
        languageId: 529,
        extraStuff: 'randomData'
      })
      expect(prismaMock.bibleBook.upsert).toHaveBeenCalledWith({
        where: { id: '1' },
        update: {
          id: '1',
          osisId: 'Gen',
          alternateName: null,
          paratextAbbreviation: 'GEN',
          isNewTestament: false,
          order: 1,
          name: {
            upsert: {
              where: {
                bibleBookId_languageId: {
                  bibleBookId: '1',
                  languageId: '529'
                }
              },
              update: {
                value: 'Genesis',
                primary: true
              },
              create: {
                value: 'Genesis',
                languageId: '529',
                primary: true
              }
            }
          }
        },
        create: {
          id: '1',
          osisId: 'Gen',
          alternateName: null,
          paratextAbbreviation: 'GEN',
          isNewTestament: false,
          order: 1,
          name: {
            create: {
              value: 'Genesis',
              languageId: '529',
              primary: true
            }
          }
        }
      })
    })
  })

  describe('importMany', () => {
    it('should import many bible books', async () => {
      prismaMock.bibleBook.createMany.mockImplementation()
      await importMany([
        {
          id: 1,
          name: 'Genesis',
          osisId: 'Gen',
          alternateName: null,
          paratextAbbreviation: 'GEN',
          isNewTestament: 0,
          order: 1,
          languageId: 529,
          extraStuff: 'randomData'
        },
        {
          id: 21,
          name: 'Ecclesiastes',
          osisId: 'Eccl',
          alternateName: 'Qohelet',
          paratextAbbreviation: 'ECC',
          isNewTestament: 0,
          order: 21,
          languageId: 529,
          extraStuff: 'randomData'
        }
      ])
      expect(prismaMock.bibleBook.createMany).toHaveBeenCalledWith({
        data: [
          {
            id: '1',
            osisId: 'Gen',
            alternateName: null,
            paratextAbbreviation: 'GEN',
            isNewTestament: false,
            order: 1
          },
          {
            id: '21',
            osisId: 'Eccl',
            alternateName: 'Qohelet',
            paratextAbbreviation: 'ECC',
            isNewTestament: false,
            order: 21
          }
        ],
        skipDuplicates: true
      })
      expect(prismaMock.bibleBookName.createMany).toHaveBeenCalledWith({
        data: [
          {
            value: 'Genesis',
            languageId: '529',
            primary: true,
            bibleBookId: '1'
          },
          {
            value: 'Ecclesiastes',
            languageId: '529',
            primary: true,
            bibleBookId: '21'
          }
        ],
        skipDuplicates: true
      })
    })

    it('should throw error if some rows do not match schema', async () => {
      await expect(
        importMany([
          {
            id: 1,
            name: 'Genesis',
            osisId: 'Gen',
            alternateName: null,
            paratextAbbreviation: 'GEN',
            isNewTestament: 0,
            order: 1,
            languageId: 529,
            extraStuff: 'randomData'
          },
          {
            osisId: 'Eccl'
          }
        ])
      ).rejects.toThrow('some rows do not match schema: unknownId')
    })
  })
})
