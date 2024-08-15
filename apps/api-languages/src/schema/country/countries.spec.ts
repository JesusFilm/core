import { graphql } from 'gql.tada'
import omit from 'lodash/omit'

import { Country } from '.prisma/api-languages-client'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { cache } from '../../yoga'
import { language } from '../language/language.mock'

import { continent, continentName, country, countryName } from './country.mock'

const COUNTRIES_QUERY = graphql(`
  query Countries($languageId: ID, $primary: Boolean) {
    countries {
      continent {
        id
        name(languageId: $languageId, primary: $primary) {
          value
          primary
        }
      }
      flagPngSrc
      flagWebpSrc
      id
      countryLanguages {
        speakers
        language {
          id
          iso3
          bcp47
          slug
        }
      }
      latitude
      longitude
      name(languageId: $languageId, primary: $primary) {
        value
        primary
      }
      population
    }
  }
`)

describe('country', () => {
  const client = getClient()

  afterEach(async () => {
    await cache.invalidate([{ typename: 'Language' }, { typename: 'Country' }])
  })

  it('should query country', async () => {
    prismaMock.country.findMany.mockResolvedValue([
      {
        ...country,
        countryLanguages: [{ id: '1', language, speakers: 100 }],
        continent
      } as unknown as Country
    ])
    prismaMock.countryName.findMany.mockResolvedValue([countryName])
    prismaMock.continentName.findMany.mockResolvedValue([continentName])
    const data = await client({
      document: COUNTRIES_QUERY,
      variables: {
        languageId: '529',
        primary: true
      }
    })
    expect(prismaMock.country.findMany).toHaveBeenCalledWith({
      include: {
        continent: true,
        countryLanguages: {
          include: {
            language: true
          }
        }
      }
    })
    expect(prismaMock.countryName.findMany).toHaveBeenCalledWith({
      include: {
        language: true
      },
      where: {
        OR: [{ languageId: '529' }, { primary: true }],
        countryId: 'US'
      },
      orderBy: {
        primary: 'desc'
      }
    })
    expect(data).toHaveProperty('data.countries', [
      {
        ...country,
        countryLanguages: [
          {
            language: omit(language, ['createdAt', 'updatedAt', 'hasVideos']),
            speakers: 100
          }
        ],
        continent: {
          ...continent,
          name: [
            { ...omit(continentName, ['id', 'continentId', 'languageId']) }
          ]
        },
        name: [{ ...omit(countryName, ['id', 'countryId', 'languageId']) }]
      }
    ])
  })

  it('should return empty when no country found', async () => {
    prismaMock.country.findMany.mockResolvedValue([])
    const data = await client({
      document: COUNTRIES_QUERY
    })
    expect(data).toHaveProperty('data.countries', [])
  })
})
