import omit from 'lodash/omit'

import { Country, CountryLanguage } from '.prisma/api-languages-client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { cache } from '../../yoga'
import { language } from '../language/language.mock'

import { continent, continentName, country, countryName } from './country.mock'

const COUNTRIES_QUERY = graphql(`
  query Countries($languageId: ID, $primary: Boolean, $term: String) {
    countries(term: $term) {
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
        displaySpeakers
        language {
          id
          iso3
          bcp47
          slug
        }
        primary
        suggested
        order
      }
      latitude
      longitude
      name(languageId: $languageId, primary: $primary) {
        value
        primary
      }
      population
      languageCount
      languageHavingMediaCount
    }
  }
`)

describe('countries', () => {
  const client = getClient()

  afterEach(async () => {
    await cache.invalidate([{ typename: 'Language' }, { typename: 'Country' }])
  })

  it('should query countries', async () => {
    prismaMock.country.findMany.mockResolvedValue([
      {
        ...country,
        languages: [language],
        continent
      }
    ] as unknown as Country[])

    prismaMock.countryLanguage.findMany.mockResolvedValue([
      {
        id: '1',
        countryId: country.id,
        languageId: language.id,
        language,
        speakers: 100,
        displaySpeakers: 100,
        primary: true,
        suggested: false,
        order: 1
      }
    ] as unknown as CountryLanguage[])

    prismaMock.countryLanguage.count.mockResolvedValue(2)
    prismaMock.language.count.mockResolvedValue(1)

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
        continent: true
      },
      where: {}
    })
    expect(data).toHaveProperty('data.countries', [
      {
        ...country,
        continent: {
          ...continent,
          name: [
            { ...omit(continentName, ['id', 'continentId', 'languageId']) }
          ]
        },
        countryLanguages: [
          {
            language: omit(language, ['createdAt', 'updatedAt', 'hasVideos']),
            speakers: 100,
            displaySpeakers: 100,
            primary: true,
            suggested: false,
            order: 1
          }
        ],
        name: [{ ...omit(countryName, ['id', 'countryId', 'languageId']) }],
        languageCount: 2,
        languageHavingMediaCount: 1
      }
    ])
  })

  it('should query countries with term', async () => {
    prismaMock.country.findMany.mockResolvedValue([
      {
        ...country,
        languages: [language],
        continent
      }
    ] as unknown as Country[])

    prismaMock.countryLanguage.findMany.mockResolvedValue([
      {
        id: '1',
        countryId: country.id,
        languageId: language.id,
        language,
        speakers: 100,
        displaySpeakers: 100,
        primary: true,
        suggested: false,
        order: 1
      }
    ] as unknown as CountryLanguage[])

    prismaMock.countryLanguage.count.mockResolvedValue(2)
    prismaMock.language.count.mockResolvedValue(1)

    prismaMock.countryName.findMany.mockResolvedValue([countryName])
    prismaMock.continentName.findMany.mockResolvedValue([continentName])
    const data = await client({
      document: COUNTRIES_QUERY,
      variables: {
        languageId: '529',
        primary: true,
        term: 'test'
      }
    })
    expect(prismaMock.country.findMany).toHaveBeenCalledWith({
      include: {
        continent: true
      },
      where: {
        name: {
          some: {
            value: {
              contains: 'test',
              mode: 'insensitive'
            }
          }
        }
      }
    })
    expect(data).toHaveProperty('data.countries', [
      {
        ...country,
        continent: {
          ...continent,
          name: [
            { ...omit(continentName, ['id', 'continentId', 'languageId']) }
          ]
        },
        countryLanguages: [
          {
            language: omit(language, ['createdAt', 'updatedAt', 'hasVideos']),
            speakers: 100,
            displaySpeakers: 100,
            primary: true,
            suggested: false,
            order: 1
          }
        ],
        name: [{ ...omit(countryName, ['id', 'countryId', 'languageId']) }],
        languageCount: 2,
        languageHavingMediaCount: 1
      }
    ])
  })
})
