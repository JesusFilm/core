import { graphql } from 'gql.tada'
import omit from 'lodash/omit'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { cache } from '../../yoga'
import { language } from '../language/language.mock'
import { country, countryContinent, countryName } from './country.mock'
import { Country } from '.prisma/api-languages-client'

const COUNTRY_QUERY = graphql(`
  query Country($languageId: ID, $primary: Boolean) {
    country(id: "AD") {
      continent(languageId: $languageId, primary: $primary) {
        value
        primary
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

  afterEach(() => {
    cache.invalidate([{ typename: 'Language' }, { typename: 'Country' }])
  })

  it('should query country', async () => {
    prismaMock.country.findUnique.mockResolvedValue({
      ...country,
      countryLanguages: [{ id: '1', language, speakers: 100 }]
    } as unknown as Country)
    prismaMock.countryName.findMany.mockResolvedValue([countryName])
    prismaMock.countryContinent.findMany.mockResolvedValue([countryContinent])
    const data = await client({
      document: COUNTRY_QUERY,
      variables: {
        languageId: '529',
        primary: true
      }
    })
    expect(prismaMock.country.findUnique).toHaveBeenCalledWith({
      include: {
        countryLanguages: {
          include: {
            language: true
          }
        }
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
      countryLanguages: [
        { language: omit(language, ['createdAt', 'updatedAt']), speakers: 100 }
      ],
      continent: [
        { ...omit(countryContinent, ['id', 'countryId', 'languageId']) }
      ],
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
