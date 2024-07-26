import { graphql } from 'gql.tada'
import omit from 'lodash/omit'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { cache } from '../../yoga'
import { language } from '../language/language.mock'
import { country, continent, continentName, countryName } from './country.mock'
import { Country } from '.prisma/api-languages-client'

const COUNTRY_QUERY = graphql(`
  query Country($languageId: ID, $primary: Boolean) {
    country(id: "AD") {
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
    prismaMock.country.findUnique.mockResolvedValue({
      ...country,
      languages: [language],
      continent: continent
    } as unknown as Country)
    prismaMock.countryName.findMany.mockResolvedValue([countryName])
    prismaMock.continentName.findMany.mockResolvedValue([continentName])
    const data = await client({
      document: COUNTRY_QUERY,
      variables: {
        languageId: '529',
        primary: true
      }
    })
    expect(prismaMock.country.findUnique).toHaveBeenCalledWith({
      include: {
        languages: true,
        continent: true
      },
      where: {
        id: 'AD'
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
    expect(data).toHaveProperty('data.country', {
      ...country,
      languages: [omit(language, ['createdAt', 'updatedAt', 'hasVideos'])],
      continent: {
        ...continent,
        name: [{ ...omit(continentName, ['id', 'continentId', 'languageId']) }]
      },
      name: [{ ...omit(countryName, ['id', 'countryId', 'languageId']) }]
    })
  })

  it('should return null when no country found', async () => {
    prismaMock.country.findUnique.mockResolvedValue(null)
    const data = await client({
      document: COUNTRY_QUERY
    })
    expect(data).toHaveProperty('data.country', null)
  })
})
