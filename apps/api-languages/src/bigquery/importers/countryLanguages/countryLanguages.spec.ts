import { CountryLanguage } from '.prisma/api-languages-client'

import { prismaMock } from '../../../../test/prismaMock'
import { parse, parseMany, processTable } from '../../importer'

import {
  importCountryLanguages,
  importMany,
  importOne
} from './countryLanguages'

const countryLanguage = {
  countryId: 'AD',
  languageId: '529',
  speakers: 12,
  displaySpeakers: null
}

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.fn().mockReturnValue({
    speakers: 12,
    languageId: '529',
    countryId: 'AD',
    displaySpeakers: null
  }),
  parseMany: jest.fn().mockReturnValue({
    data: [
      {
        speakers: 12,
        languageId: '529',
        countryId: 'AD',
        displaySpeakers: null
      },
      {
        speakers: 12,
        languageId: '529',
        countryId: 'AD',
        displaySpeakers: null
      }
    ]
  })
}))

describe('bigquery/importers/countryLanguages', () => {
  describe('importCountryLanguages', () => {
    it('should import country names', async () => {
      await importCountryLanguages(['529'], ['AD'])
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_countryLanguages_arclight_data',
        importOne,
        importMany,
        true
      )
    })
  })

  describe('importOne', () => {
    it('should import one country language', async () => {
      prismaMock.countryLanguage.upsert.mockResolvedValue(
        {} as unknown as CountryLanguage
      )
      await importCountryLanguages(['529'], ['AD'])
      await importOne({
        speakers: 12,
        languageId: '529',
        countryId: 'AD',
        displaySpeakers: null
      })
      expect(parse).toHaveBeenCalled()
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
      await importCountryLanguages([], ['AD'])
      await expect(
        importOne({
          speakers: 12,
          languageId: '529',
          countryId: 'AD',
          displaySpeakers: null
        })
      ).rejects.toThrow()
    })

    it('should throw error if country not found', async () => {
      await importCountryLanguages(['529'], [])
      await expect(
        importOne({
          speakers: 12,
          languageId: '529',
          countryId: 'AD',
          displaySpeakers: null
        })
      ).rejects.toThrow()
    })
  })

  describe('importMany', () => {
    it('should import many country languages', async () => {
      prismaMock.countryLanguage.createMany.mockImplementation()
      await importCountryLanguages(['529'], ['AD'])
      await importMany([
        {
          speakers: 12,
          languageId: '529',
          countryId: 'AD',
          displaySpeakers: null
        },
        {
          speakers: 12,
          languageId: '529',
          countryId: 'AD',
          displaySpeakers: null
        }
      ])
      expect(parseMany).toHaveBeenCalled()
      expect(prismaMock.countryLanguage.createMany).toHaveBeenCalledWith({
        data: [countryLanguage, countryLanguage],
        skipDuplicates: true
      })
    })

    it('should throw error if some rows do not match schema', async () => {
      prismaMock.countryLanguage.createMany.mockImplementation()
      await importCountryLanguages(['529'], ['AD'])
      await expect(
        importMany([
          {
            speakers: 12,
            languageId: '529',
            countryId: 'AD',
            displaySpeakers: null
          },
          {
            speakers: 12,
            languageId: '529',
            countryId: 'AD',
            displaySpeakers: null
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
