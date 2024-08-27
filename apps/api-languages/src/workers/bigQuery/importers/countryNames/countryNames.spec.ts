import { prismaMock } from '../../../../../test/prismaMock'
import { processTable } from '../../importer'

import { importMany, importOne } from './countryNames'

import { importCountryNames } from '.'

const bigQueryCountryName = {
  languageId: 529,
  shortName: 'AD',
  value: 'English'
}

const countryName = {
  countryId: 'AD',
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

jest.mock('../countries', () => ({
  getCountryIds: jest.fn().mockReturnValue(['AD'])
}))

describe('bigQuery/importers/countryNames', () => {
  describe('importLanguageNames', () => {
    it('should import country names', async () => {
      await importCountryNames()
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_countryNames_arclight_data',
        importOne,
        importMany,
        true,
        undefined
      )
    })
  })

  describe('importOne', () => {
    it('should import one country name', async () => {
      await importOne(bigQueryCountryName)
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

    it('should import when value is null', async () => {
      await importOne({ ...bigQueryCountryName, value: null })
      expect(prismaMock.countryName.upsert).toHaveBeenCalledWith({
        where: {
          languageId_countryId: {
            languageId: '529',
            countryId: 'AD'
          }
        },
        create: { ...countryName, value: '' },
        update: { ...countryName, value: '' }
      })
    })

    it('should throw error if language not found', async () => {
      await expect(
        importOne({
          ...bigQueryCountryName,
          languageId: 789
        })
      ).rejects.toThrow('Language with id 789 not found')
    })

    it('should throw error if country not found', async () => {
      await expect(
        importOne({
          ...bigQueryCountryName,
          shortName: 'ZZ'
        })
      ).rejects.toThrow('Country with id ZZ not found')
    })
  })

  describe('importMany', () => {
    it('should import many country names', async () => {
      await importMany([bigQueryCountryName, bigQueryCountryName])
      expect(prismaMock.countryName.createMany).toHaveBeenCalledWith({
        data: [countryName, countryName],
        skipDuplicates: true
      })
    })

    it('should throw error if some rows do not match schema', async () => {
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
      ).rejects.toThrow(
        'some rows do not match schema: unknownId,unknownId,unknownId'
      )
    })
  })
})
