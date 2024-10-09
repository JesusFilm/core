import { prismaMock } from '../../../../../test/prismaMock'
import { processTable } from '../../importer'

import {
  importCountryLanguages,
  importMany,
  importOne
} from './countryLanguages'

const bigQueryCountryLanguage = {
  languageId: 529,
  countryCode: 'AD',
  speakers: 12,
  display_speakers: null,
  primary: 1
}

const countryLanguage = {
  countryId: 'AD',
  languageId: '529',
  speakers: 12,
  displaySpeakers: null,
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

jest.mock('../countries', () => ({
  getCountryIds: jest.fn().mockReturnValue(['AD'])
}))

describe('bigQuery/importers/countryLanguages', () => {
  describe('importCountryLanguages', () => {
    it('should import country names', async () => {
      await importCountryLanguages()
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_countryLanguages_arclight_data',
        importOne,
        importMany,
        true,
        undefined
      )
    })
  })

  describe('importOne', () => {
    it('should import one country language', async () => {
      await importOne(bigQueryCountryLanguage)
      expect(prismaMock.countryLanguage.upsert).toHaveBeenCalledWith({
        where: {
          languageId_countryId: {
            languageId: '529',
            countryId: 'AD'
          }
        },
        create: countryLanguage,
        update: countryLanguage
      })
    })

    it('should throw error if language not found', async () => {
      await expect(
        importOne({
          ...bigQueryCountryLanguage,
          languageId: 789
        })
      ).rejects.toThrow('Language with id 789 not found')
    })

    it('should throw error if country not found', async () => {
      await expect(
        importOne({
          ...bigQueryCountryLanguage,
          countryCode: 'ZZ'
        })
      ).rejects.toThrow('Country with id ZZ not found')
    })
  })

  describe('importMany', () => {
    it('should import many country languages', async () => {
      prismaMock.countryLanguage.createMany.mockImplementation()
      await importMany([bigQueryCountryLanguage, bigQueryCountryLanguage])
      expect(prismaMock.countryLanguage.createMany).toHaveBeenCalledWith({
        data: [countryLanguage, countryLanguage],
        skipDuplicates: true
      })
    })

    it('should throw error if some rows do not match schema', async () => {
      prismaMock.countryLanguage.createMany.mockImplementation()
      await expect(
        importMany([
          {
            value: 'English',
            languageId: '529'
          }
        ])
      ).rejects.toThrow('some rows do not match schema: unknownId')
    })
  })
})
