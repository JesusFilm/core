import { LanguageName } from '.prisma/api-languages-client'

import { prismaMock } from '../../../../../test/prismaMock'
import { parse, parseMany, processTable } from '../../importer'

import { importLanguageNames, importMany, importOne } from './languageNames'

const languageName = {
  parentLanguageId: '529',
  languageId: '529',
  value: 'English',
  primary: true
}

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.fn().mockReturnValue({
    value: 'English',
    languageId: '529',
    parentLanguageId: '529',
    primary: true
  }),
  parseMany: jest.fn().mockReturnValue({
    data: [
      {
        value: 'English',
        languageId: '529',
        parentLanguageId: '529',
        primary: true
      },
      {
        value: 'English',
        languageId: '529',
        parentLanguageId: '529',
        primary: true
      }
    ]
  })
}))

describe('bigquery/importers/languageNames', () => {
  describe('importLanguageNames', () => {
    it('should import language names', async () => {
      await importLanguageNames(['529'])
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_languageNames_arclight_data',
        importOne,
        importMany,
        true
      )
    })
  })

  describe('importOne', () => {
    it('should import one language name', async () => {
      prismaMock.languageName.upsert.mockResolvedValue(
        {} as unknown as LanguageName
      )
      await importLanguageNames(['529'])
      await importOne({
        value: 'English',
        languageId: '529',
        parentLanguageId: '529'
      })
      expect(parse).toHaveBeenCalled()
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

    it('should throw error if language not found', async () => {
      await importLanguageNames([])
      await expect(
        importOne({
          value: 'English',
          languageId: '529',
          parentLanguageId: '529'
        })
      ).rejects.toThrow()
    })
  })

  describe('importMany', () => {
    it('should import many language names', async () => {
      prismaMock.languageName.createMany.mockImplementation()
      await importLanguageNames(['529'])
      await importMany([
        {
          value: 'English',
          languageId: '529',
          parentLanguageId: '529'
        },
        {
          value: 'English',
          languageId: '529',
          parentLanguageId: '529'
        }
      ])
      expect(parseMany).toHaveBeenCalled()
      expect(prismaMock.languageName.createMany).toHaveBeenCalledWith({
        data: [languageName, languageName],
        skipDuplicates: true
      })
    })

    it('should throw error if some rows do not match schema', async () => {
      prismaMock.languageName.createMany.mockImplementation()
      await importLanguageNames(['529'])
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
      ).rejects.toThrow()
    })
  })
})
