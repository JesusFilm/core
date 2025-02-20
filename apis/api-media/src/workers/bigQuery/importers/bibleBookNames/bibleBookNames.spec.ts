import { BibleBookName } from '.prisma/api-media-client'

import { prismaMock } from '../../../../../test/prismaMock'
import { processTable } from '../../importer'

import { importMany, importOne } from './bibleBookNames'

import { importBibleBookNames } from '.'

const bigQueryBibleBookName = {
  bibleBook: 1,
  translatedName: 'Genesis',
  languageId: 529
}
const prismaBibleBookName: Omit<BibleBookName, 'id'> = {
  bibleBookId: '1',
  languageId: '529',
  primary: true,
  value: 'Genesis'
}

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.requireActual('../../importer').parse,
  parseMany: jest.requireActual('../../importer').parseMany
}))

jest.mock('../bibleBooks', () => ({
  getBibleBookIds: jest.fn().mockReturnValue(['1'])
}))

describe('bigQuery/importers/bibleBookNames', () => {
  describe('importBibleBookNames', () => {
    it('should import bible book names', async () => {
      await importBibleBookNames()
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_bibleBookDescriptors_arclight_data',
        importOne,
        importMany,
        false,
        undefined
      )
    })
  })

  describe('importOne', () => {
    it('should import one bible book name', async () => {
      prismaMock.bibleBookName.upsert.mockImplementation()
      await importOne(bigQueryBibleBookName)
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
      await expect(
        importOne({ ...bigQueryBibleBookName, bibleBook: 0 })
      ).rejects.toThrow()
    })
  })

  describe('importMany', () => {
    it('should import many bible book names', async () => {
      prismaMock.bibleBookName.createMany.mockImplementation()
      await importMany([bigQueryBibleBookName, bigQueryBibleBookName])
      expect(prismaMock.bibleBookName.createMany).toHaveBeenCalledWith({
        data: [prismaBibleBookName, prismaBibleBookName],
        skipDuplicates: true
      })
    })

    it('should throw error if some rows do not match schema', async () => {
      prismaMock.bibleBookName.createMany.mockImplementation()
      await expect(
        importMany([
          bigQueryBibleBookName,
          { ...bigQueryBibleBookName, languageId: undefined }
        ])
      ).rejects.toThrow()
    })
  })
})
