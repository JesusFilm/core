import { Language } from '.prisma/api-languages-client'

import { prismaMock } from '../../../../test/prismaMock'
import { parse, parseMany, processTable } from '../../importer'

import {
  clearExistingLanguageIds,
  getExistingPrismaLanguageIds,
  importLanguages,
  importMany,
  importOne
} from './languages'

const language = {
  id: '529',
  iso3: 'eng',
  bcp47: 'en',
  updatedAt: '2021-11-19T12:34:56.647Z'
}

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.fn().mockReturnValue({
    id: '529',
    iso3: 'eng',
    bcp47: 'en',
    updatedAt: '2021-11-19T12:34:56.647Z'
  }),
  parseMany: jest.fn().mockReturnValue({
    data: [
      {
        id: '529',
        iso3: 'eng',
        bcp47: 'en',
        updatedAt: '2021-11-19T12:34:56.647Z'
      },
      {
        id: '529',
        iso3: 'eng',
        bcp47: 'en',
        updatedAt: '2021-11-19T12:34:56.647Z'
      }
    ]
  })
}))

describe('importers/languages/languages', () => {
  afterEach(() => {
    clearExistingLanguageIds()
  })

  describe('getExistingPrismaLanguageIds', () => {
    it('should return existing language ids', async () => {
      prismaMock.language.findMany.mockResolvedValue([
        { id: '1' } as unknown as Language
      ])
      expect(await getExistingPrismaLanguageIds()).toEqual(['1'])
    })
  })

  describe('importLanguages', () => {
    it('should import languages', async () => {
      prismaMock.language.findMany.mockResolvedValue([])
      await importLanguages()
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_languages_arclight_data',
        importOne,
        importMany,
        true
      )
    })
  })

  describe('importOne', () => {
    it('should import one language', async () => {
      prismaMock.language.findMany.mockResolvedValue([])
      prismaMock.language.upsert.mockResolvedValue({} as unknown as Language)
      await importLanguages()
      await importOne({
        id: '529',
        iso3: 'eng',
        bcp47: 'en',
        updatedAt: '2021-11-19T12:34:56.647Z'
      })
      expect(parse).toHaveBeenCalled()
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
      prismaMock.language.findMany.mockResolvedValue([])
      prismaMock.language.createMany.mockImplementation()
      await importLanguages()
      await importMany([
        {
          id: '529',
          iso3: 'eng',
          bcp47: 'en',
          updatedAt: '2021-11-19T12:34:56.647Z'
        },
        {
          id: '529',
          iso3: 'eng',
          bcp47: 'en',
          updatedAt: '2021-11-19T12:34:56.647Z'
        }
      ])
      expect(parseMany).toHaveBeenCalled()
      expect(prismaMock.language.createMany).toHaveBeenCalledWith({
        data: [
          {
            id: '529',
            iso3: 'eng',
            bcp47: 'en',
            updatedAt: '2021-11-19T12:34:56.647Z'
          },
          {
            id: '529',
            iso3: 'eng',
            bcp47: 'en',
            updatedAt: '2021-11-19T12:34:56.647Z'
          }
        ],
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
      ).rejects.toThrow()
    })
  })
})
