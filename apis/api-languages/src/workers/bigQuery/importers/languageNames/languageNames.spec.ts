import { prismaMock } from '../../../../../test/prismaMock'
import { processTable } from '../../importer'

import { importLanguageNames, importMany, importOne } from './languageNames'

const bigQueryLanguageName = {
  value: 'English',
  languageId: 529,
  parentLanguageId: 529
}

const languageName = {
  parentLanguageId: '529',
  languageId: '529',
  value: 'English',
  primary: true
}

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.requireActual('../../importer').parse,
  parseMany: jest.requireActual('../../importer').parseMany
}))

jest.mock('../languages', () => ({
  getLanguageIds: jest.fn().mockReturnValue(['529'])
}))

describe('bigQuery/importers/languageNames', () => {
  describe('importLanguageNames', () => {
    it('should import language names', async () => {
      await importLanguageNames()
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_languageNames_arclight_data',
        importOne,
        importMany,
        true,
        undefined
      )
    })
  })

  describe('importOne', () => {
    it('should import one language name', async () => {
      await importOne(bigQueryLanguageName)
      expect(prismaMock.languageName.upsert).toHaveBeenCalledWith({
        where: {
          parentLanguageId_languageId: {
            languageId: '529',
            parentLanguageId: '529'
          }
        },
        create: languageName,
        update: languageName
      })
    })

    it('should throw error if parent language not found', async () => {
      await expect(
        importOne({ ...bigQueryLanguageName, parentLanguageId: 530 })
      ).rejects.toThrow('Parent Language with id 530 not found')
    })

    it('should throw error if language not found', async () => {
      await expect(
        importOne({ ...bigQueryLanguageName, languageId: 530 })
      ).rejects.toThrow('Language with id 530 not found')
    })
  })

  describe('importMany', () => {
    it('should import many language names', async () => {
      await importMany([bigQueryLanguageName, bigQueryLanguageName])
      expect(prismaMock.languageName.createMany).toHaveBeenCalledWith({
        data: [languageName, languageName],
        skipDuplicates: true
      })
    })

    it('should throw error if some rows do not match schema', async () => {
      await expect(
        importMany([
          {
            value: 'English',
            languageId: '529',
            parentLanguageId: '529'
          },
          {
            value: 'English',
            languageId: '529',
            parentLanguageId: '529'
          },
          {
            value: 'English',
            languageId: '529'
          }
        ])
      ).rejects.toThrow(
        'some rows do not match schema: unknownId,unknownId,unknownId'
      )
    })
  })
})
