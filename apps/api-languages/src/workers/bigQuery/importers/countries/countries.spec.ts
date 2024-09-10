import { Continent, Country } from '.prisma/api-languages-client'

import { prismaMock } from '../../../../../test/prismaMock'
import { processTable } from '../../importer'

import {
  getContinentIds,
  importMany,
  importOne,
  setContinentIds,
  setCountryIds
} from './countries'

import { getCountryIds, importCountries } from '.'

const bigQueryCountry = {
  shortName: 'AD',
  country_population: 20,
  latitude: 15.1,
  longitude: 16.2,
  flagPngSrc: 'flagPngSrc',
  flagWebpSrc: 'flagWebpSrc',
  continentName: 'Europe'
}

const prismaCountry = {
  id: 'AD',
  population: 20,
  latitude: 15.1,
  longitude: 16.2,
  flagPngSrc: 'flagPngSrc',
  flagWebpSrc: 'flagWebpSrc',
  continentId: 'Europe'
}

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.requireActual('../../importer').parse,
  parseMany: jest.requireActual('../../importer').parseMany
}))

describe('bigQuery/importers/countries', () => {
  afterEach(() => {
    setCountryIds([])
    setContinentIds([])
  })

  describe('importCountries', () => {
    it('should import countries', async () => {
      prismaMock.country.findMany.mockResolvedValue([
        { id: 'countryId' } as unknown as Country
      ])
      prismaMock.continent.findMany.mockResolvedValue([
        { id: 'continentId' } as unknown as Continent
      ])
      expect(getCountryIds()).toEqual([])
      expect(getContinentIds()).toEqual([])
      const cleanup = await importCountries()
      expect(getCountryIds()).toEqual(['countryId'])
      expect(getContinentIds()).toEqual(['continentId'])
      cleanup()
      expect(getCountryIds()).toEqual([])
      expect(getContinentIds()).toEqual([])
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_countries_arclight_data',
        importOne,
        importMany,
        true,
        undefined
      )
    })
  })

  describe('importOne', () => {
    it('should import one language name', async () => {
      prismaMock.country.upsert.mockResolvedValue({} as unknown as Country)
      prismaMock.country.findMany.mockResolvedValue([])
      prismaMock.continent.findMany.mockResolvedValue([])
      await importCountries()
      await importOne(bigQueryCountry)
      expect(prismaMock.country.upsert).toHaveBeenCalledWith({
        where: {
          id: prismaCountry.id
        },
        create: prismaCountry,
        update: prismaCountry
      })
    })
  })

  describe('importMany', () => {
    it('should import many countries', async () => {
      prismaMock.country.createMany.mockImplementation()
      prismaMock.country.findMany.mockResolvedValue([])
      prismaMock.continent.findMany.mockResolvedValue([])
      prismaMock.continent.create.mockResolvedValue({
        id: 'Europe'
      } as unknown as Continent)
      await importCountries()
      await importMany([bigQueryCountry, bigQueryCountry])
      expect(prismaMock.continent.create).toHaveBeenCalledWith({
        data: {
          id: 'Europe',
          name: {
            create: {
              value: 'Europe',
              languageId: '529',
              primary: true
            }
          }
        }
      })
      expect(prismaMock.country.createMany).toHaveBeenCalledWith({
        data: [prismaCountry, prismaCountry],
        skipDuplicates: true
      })
    })

    it('should throw error if some rows do not match schema', async () => {
      prismaMock.country.createMany.mockImplementation()
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
