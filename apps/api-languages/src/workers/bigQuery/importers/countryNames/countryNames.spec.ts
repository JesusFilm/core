import { CountryName } from '.prisma/api-languages-client'

import { prismaMock } from '../../../../../test/prismaMock'
import { parse, parseMany, processTable } from '../../importer'

import { importCountryNames, importMany, importOne } from './countryNames'

const countryName = {
  countryId: 'AD',
  languageId: '529',
  value: 'English',
  primary: true
}

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.fn().mockReturnValue({
    value: 'English',
    languageId: '529',
    countryId: 'AD',
    primary: true
  }),
  parseMany: jest.fn().mockReturnValue({
    data: [
      {
        value: 'English',
        languageId: '529',
        countryId: 'AD',
        primary: true
      },
      {
        value: 'English',
        languageId: '529',
        countryId: 'AD',
        primary: true
      }
    ]
  })
}))

describe('bigquery/importers/countryNames', () => {
  describe('importLanguageNames', () => {
    it('should import country names', async () => {
      await importCountryNames(['529'], ['AD'])
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_countryNames_arclight_data',
        importOne,
        importMany,
        true
      )
    })
  })

  describe('importOne', () => {
    it('should import one country name', async () => {
      prismaMock.countryName.upsert.mockResolvedValue(
        {} as unknown as CountryName
      )
      await importCountryNames(['529'], ['AD'])
      await importOne({
        value: 'English',
        languageId: '529',
        countryId: 'AD'
      })
      expect(parse).toHaveBeenCalled()
      expect(prismaMock.countryName.upsert).toHaveBeenCalledWith({
        where: {
          languageId_countryId: {
            languageId: '529',
            countryId: 'AD'
          }
        },
        create: countryName,
        update: countryName
      })
    })

    it('should throw error if language not found', async () => {
      await importCountryNames([], ['AD'])
      await expect(
        importOne({
          value: 'English',
          languageId: '529',
          countryId: 'Ad'
        })
      ).rejects.toThrow()
    })

    it('should throw error if country not found', async () => {
      await importCountryNames(['529'], [])
      await expect(
        importOne({
          value: 'English',
          languageId: '529',
          countryId: 'AD'
        })
      ).rejects.toThrow()
    })
  })

  describe('importMany', () => {
    it('should import many country names', async () => {
      prismaMock.countryName.createMany.mockImplementation()
      await importCountryNames(['529'], ['AD'])
      await importMany([
        {
          value: 'English',
          languageId: '529',
          countryId: 'AD'
        },
        {
          value: 'English',
          languageId: '529',
          countryId: 'AD'
        }
      ])
      expect(parseMany).toHaveBeenCalled()
      expect(prismaMock.countryName.createMany).toHaveBeenCalledWith({
        data: [countryName, countryName],
        skipDuplicates: true
      })
    })

    it('should throw error if some rows do not match schema', async () => {
      prismaMock.countryName.createMany.mockImplementation()
      await importCountryNames(['529'], ['AD'])
      await expect(
        importMany([
          {
            value: 'English',
            languageId: '529',
            countryId: 'AD'
          },
          {
            value: 'English',
            languageId: '529',
            countryId: 'AD'
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
