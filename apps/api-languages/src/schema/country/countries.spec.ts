import { graphql } from 'gql.tada'
import omit from 'lodash/omit'

import { Country } from '.prisma/api-languages-client'
import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { cache } from '../../yoga'
import { language } from '../language/language.mock'
import { country, countryContinent, countryName } from './country.mock'

const COUNTRIES_QUERY = graphql(`
  query Countries($languageId: ID, $primary: Boolean) {
    countries {
      continent(languageId: $languageId, primary: $primary) {
        value
        primary
      }
      flagPngSrc
      flagWebpSrc
      id
      languages {
        id
        iso3
        bcp47
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

  afterEach(() => {
    cache.invalidate([{ typename: 'Language' }, { typename: 'Country' }])
  })

  it('should query country', async () => {
    prismaMock.country.findMany.mockResolvedValue([
      {
        ...country,
        languages: [language]
      } as unknown as Country
    ])
    prismaMock.countryName.findMany.mockResolvedValue([countryName])
    prismaMock.countryContinent.findMany.mockResolvedValue([countryContinent])
    const data = await client({
      document: COUNTRIES_QUERY,
      variables: {
        languageId: '529',
        primary: true
      }
    })
    expect(prismaMock.country.findMany).toHaveBeenCalledWith({
      include: {
        languages: true
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
        languages: [omit(language, ['createdAt', 'updatedAt'])],
        continent: [
          { ...omit(countryContinent, ['id', 'countryId', 'languageId']) }
        ],
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
