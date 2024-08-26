import { Language } from '.prisma/api-languages-client'

import { prismaMock } from '../../../../../test/prismaMock'
import { processTable } from '../../importer'

import { importMany, importOne, setLanguageIds } from './languages'

import { getLanguageIds, importLanguages } from '.'

const bigQueryLanguage = {
  id: 529,
  bcp47: 'en',
  iso3: 'eng',
  hasVideos: 1,
  updatedAt: { value: '2021-11-19T12:34:56.647Z' }
}

const language = {
  id: '529',
  iso3: 'eng',
  bcp47: 'en',
  updatedAt: '2021-11-19T12:34:56.647Z',
  hasVideos: true
}

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.requireActual('../../importer').parse,
  parseMany: jest.requireActual('../../importer').parseMany
}))

describe('bigQuery/importers/languages', () => {
  afterEach(() => {
    setLanguageIds([])
  })

  describe('importLanguages', () => {
    it('should import languages', async () => {
      prismaMock.language.findMany.mockResolvedValue([
        {
          id: 'languageId'
        } as unknown as Language
      ])
      expect(getLanguageIds()).toEqual([])
      const cleanup = await importLanguages()
      expect(getLanguageIds()).toEqual(['languageId'])
      cleanup()
      expect(getLanguageIds()).toEqual([])
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_languages_arclight_data',
        importOne,
        importMany,
        true,
        undefined
      )
    })
  })

  describe('importOne', () => {
    it('should import one language', async () => {
      await importOne(bigQueryLanguage)
      expect(prismaMock.language.upsert).toHaveBeenCalledWith({
        where: {
          id: '529'
        },
        create: language,
        update: language
      })
    })
  })

  describe('importMany', () => {
    it('should import many languages', async () => {
      await importMany([bigQueryLanguage, bigQueryLanguage])
      expect(prismaMock.language.createMany).toHaveBeenCalledWith({
        data: [language, language],
        skipDuplicates: true
      })
    })

    it('should throw error if some rows are invalid', async () => {
      prismaMock.language.findMany.mockResolvedValue([])
      await importLanguages()
      await expect(
        importMany([
          {
            id: '529',
            bcp47: 'en',
            updatedAt: '2021-11-19T12:34:56.647Z'
          },
          {
            id: '529',
            bcp47: 'en',
            updatedAt: '2021-11-19T12:34:56.647Z'
          },
          {
            id: '529'
          }
        ])
      ).rejects.toThrow('some rows do not match schema: 529,529,529')
    })
  })
})
