import omit from 'lodash/omit'

import { Country, CountryLanguage } from '@core/prisma-languages/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { cache } from '../../yoga'
import { language } from '../language/language.mock'

import { continent, continentName, country, countryName } from './country.mock'

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

describe('country', () => {
  const client = getClient()

  afterEach(async () => {
    await cache.invalidate([{ typename: 'Language' }, { typename: 'Country' }])
  })

  it('should query country', async () => {
    prismaMock.country.findUnique.mockResolvedValue({
      ...country,
      languages: [language],
      continent
    } as unknown as Country)

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
      document: COUNTRY_QUERY,
      variables: {
        languageId: '529',
        primary: true
      }
    })
    expect(prismaMock.country.findUnique).toHaveBeenCalledWith({
      include: {
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
      languageCount: 2,
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
