import { importCountries, importMany, importOne } from './countries'

import { prismaMock } from '../../../../test/prismaMock'
import { parse, parseMany, processTable } from '../../importer'
import { Country } from '.prisma/api-languages-client'

const country = {
  id: 'AD',
  population: 20,
  latitude: 15.1,
  longitude: 16.2,
  flagPngSrc: 'flagPngSrc',
  flagWebpSrc: 'flagWebpSrc'
}

jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.fn().mockReturnValue({
    id: 'AD',
    population: 20,
    latitude: 15.1,
    longitude: 16.2,
    flagPngSrc: 'flagPngSrc',
    flagWebpSrc: 'flagWebpSrc'
  }),
  parseMany: jest.fn().mockReturnValue({
    data: [
      {
        id: 'AD',
        population: 20,
        latitude: 15.1,
        longitude: 16.2,
        flagPngSrc: 'flagPngSrc',
        flagWebpSrc: 'flagWebpSrc'
      },
      {
        id: 'AD',
        population: 20,
        latitude: 15.1,
        longitude: 16.2,
        flagPngSrc: 'flagPngSrc',
        flagWebpSrc: 'flagWebpSrc'
      }
    ]
  })
}))

describe('bigquery/importers/countries', () => {
  describe('importCountries', () => {
    it('should import countries', async () => {
      await importCountries()
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_mmdb_prod.core_countries_arclight_data',
        importOne,
        importMany,
        true
      )
    })
  })

  describe('importOne', () => {
    it('should import one language name', async () => {
      prismaMock.country.upsert.mockResolvedValue({} as unknown as Country)
      await importOne({
        shortName: country.id,
        country_population: country.population,
        latitude: country.latitude,
        longitude: country.longitude,
        flagPngSrc: country.flagPngSrc,
        flagWebpSrc: country.flagWebpSrc
      })
      expect(parse).toHaveBeenCalled()
      expect(prismaMock.languageName.upsert).toHaveBeenCalledWith({
        where: {
          id: country.id
        },
        create: country,
        update: country
      })
    })
  })

  describe('importMany', () => {
    it('should import many countries', async () => {
      prismaMock.country.createMany.mockImplementation()
      await importMany([
        {
          shortName: country.id,
          country_population: country.population,
          latitude: country.latitude,
          longitude: country.longitude,
          flagPngSrc: country.flagPngSrc,
          flagWebpSrc: country.flagWebpSrc
        },
        {
          shortName: country.id,
          country_population: country.population,
          latitude: country.latitude,
          longitude: country.longitude,
          flagPngSrc: country.flagPngSrc,
          flagWebpSrc: country.flagWebpSrc
        }
      ])
      expect(parseMany).toHaveBeenCalled()
      expect(prismaMock.languageName.createMany).toHaveBeenCalledWith({
        data: [country, country],
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
      ).rejects.toThrowError()
    })
  })
})
