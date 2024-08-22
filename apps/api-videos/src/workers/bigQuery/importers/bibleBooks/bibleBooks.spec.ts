import { BibleBookName } from '.prisma/api-videos-client'

import { prismaMock } from '../../../../../test/prismaMock'
import { parse, parseMany, processTable } from '../../importer'

import {
  importBibleBookName,
  importMany,
  importOne
} from './importerBibleBooks'

const bigQueryBibleBookName = {
  id: 'bibleBookNameId',
  bibleBook: 1,
  translatedName: 'Genesis',
  languageId: 529
}
const prismaBibleBookName: BibleBookName = {
  id: 'bibleBookNameId',
  bibleBookId: '1',
  languageId: '529',
  primary: true,
  value: 'Genesis'
}

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.fn().mockReturnValue({
    id: 'bibleBookNameId',
    bibleBookId: '1',
    languageId: '529',
    primary: true,
    value: 'Genesis'
  }),
  parseMany: jest.fn().mockReturnValue({
    data: [
      {
        id: 'bibleBookNameId',
        bibleBookId: '1',
        languageId: '529',
        primary: true,
        value: 'Genesis'
      },
      {
        id: 'bibleBookNameId',
        bibleBookId: '1',
        languageId: '529',
        primary: true,
        value: 'Genesis'
      }
    ]
  })
}))

describe('bigquery/importers/bibleBookNames', () => {
  describe('importBibleBookName', () => {
    it('should import bible book names', async () => {
      await importBibleBookName(['20615'])
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_bibleBookDescriptors_arclight_data',
        importOne,
        importMany,
        true
      )
    })
  })

  describe('importOne', () => {
    it('should import one bible book name', async () => {
      prismaMock.bibleBookName.upsert.mockResolvedValue(
        {} as unknown as BibleBookName
      )
      await importBibleBookName(['1'])
      await importOne(bigQueryBibleBookName)
      expect(parse).toHaveBeenCalled()
      expect(prismaMock.bibleBookName.upsert).toHaveBeenCalledWith({
        where: {
          bibleBookId_languageId: {
            bibleBookId: '1',
            languageId: '529'
          }
        },
        create: prismaBibleBookName,
        update: prismaBibleBookName
      })
    })

    it('should throw error if bible book not found', async () => {
      await importBibleBookName([])
      await expect(importOne(bigQueryBibleBookName)).rejects.toThrow()
    })
  })

  describe('importMany', () => {
    it('should import many bible book names', async () => {
      prismaMock.bibleBookName.createMany.mockImplementation()
      await importBibleBookName(['1'])
      await importMany([bigQueryBibleBookName, bigQueryBibleBookName])
      expect(parseMany).toHaveBeenCalled()
      expect(prismaMock.bibleBookName.createMany).toHaveBeenCalledWith({
        data: [prismaBibleBookName, prismaBibleBookName],
        skipDuplicates: true
      })
    })

    it('should throw error if some rows do not match schema', async () => {
      prismaMock.bibleBookName.createMany.mockImplementation()
      await importBibleBookName(['1'])
      await expect(
        importMany([
          bigQueryBibleBookName,
          bigQueryBibleBookName,
          bigQueryBibleBookName
        ])
      ).rejects.toThrow()
    })
  })
})
