import omit from 'lodash/omit'

import { Country, CountryLanguage } from '.prisma/api-languages-client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { cache } from '../../yoga'
import { language } from '../language/language.mock'

import {
  continent,
  continentName,
  country,
  countryLanguage,
  countryName
} from './country.mock'

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

const result = {
  ...country,
  languages: [language],
  countryLanguages: [{ ...countryLanguage, language }],
  name: [countryName],
  continentNames: [continentName],
  continent: {
    ...continent,
    name: [continentName]
  },
  _count: {
    countryLanguages: 1,
    languages: 1
  }
} as unknown as Country

describe('country', () => {
  const client = getClient()

  afterEach(async () => {
    await cache.invalidate([{ typename: 'Language' }, { typename: 'Country' }])
  })

  it('should query country', async () => {
    prismaMock.country.findUnique.mockResolvedValue(result)
    prismaMock.country.findUniqueOrThrow.mockResolvedValue(result)

    const data = await client({
      document: COUNTRY_QUERY,
      variables: {
        languageId: '529',
        primary: true
      }
    })
    expect(prismaMock.country.findUnique).toHaveBeenCalledWith({
      include: {
        continent: {
          include: {
            name: {
              where: {
                OR: [{ languageId: '529' }, { primary: true }]
              },
              orderBy: {
                primary: 'desc'
              },
              include: {
                language: true
              }
            }
          }
        },
        countryLanguages: {
          include: { language: true },
          where: { language: { hasVideos: true } }
        },
        name: {
          include: {
            language: true
          },
          where: {
            OR: [{ languageId: '529' }, { primary: true }]
          },
          orderBy: {
            primary: 'desc'
          }
        },
        _count: {
          select: {
            countryLanguages: {
              where: {
                suggested: false
              }
            }
          }
        }
      },
      where: {
        id: 'AD'
      }
    })
    expect(data).toHaveProperty('data.country', {
      ...country,
      continent: {
        ...continent,
        name: [{ ...omit(continentName, ['id', 'continentId', 'languageId']) }]
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
      languageCount: 1,
      languageHavingMediaCount: 1
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
