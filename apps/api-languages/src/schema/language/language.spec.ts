import { graphql } from 'gql.tada'
import omit from 'lodash/omit'

import { Language } from '.prisma/api-languages-client'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { cache } from '../../yoga'

import { audioPreview, language, languageName } from './language.mock'

const LANGUAGE_QUERY = graphql(`
  query Language($languageId: ID, $primary: Boolean) {
    language(id: "529") {
      id
      bcp47
      iso3
      slug
      name(languageId: $languageId, primary: $primary) {
        value
        primary
      }
      audioPreview {
        value
        duration
        size
        bitrate
        codec
        language {
          id
        }
      }
      primaryCountryId
      speakerCount
      countriesCount
    }
  }
`)

describe('language', () => {
  const client = getClient()

  afterEach(async () => {
    await cache.invalidate([{ typename: 'Language' }])
  })

  it('should query language with defaults', async () => {
    prismaMock.language.findUnique.mockResolvedValue({
      ...language,
      audioPreview: {
        ...audioPreview,
        language
      },
      name: languageName
    } as unknown as Language)
    prismaMock.countryLanguage.findFirst.mockResolvedValue({
      id: 'cl1',
      languageId: 'en',
      countryId: 'US',
      speakers: 1000000,
      displaySpeakers: 1000000,
      primary: true,
      suggested: false,
      order: 1
    })
    prismaMock.countryLanguage.aggregate.mockResolvedValue({
      _count: {},
      _min: {},
      _max: {},
      _avg: {},
      _sum: { speakers: 1000000 }
    })
    prismaMock.countryLanguage.count.mockResolvedValue(10)

    const data = await client({
      document: LANGUAGE_QUERY
    })

    expect(prismaMock.language.findUnique).toHaveBeenCalledWith({
      where: {
        id: '529'
      },
      include: {
        audioPreview: {
          include: {
            language: true
          }
        },
        name: {
          where: {
            OR: [{ languageId: '529' }, { primary: true }]
          },
          orderBy: { primary: 'desc' }
        }
      }
    })
    expect(data).toHaveProperty('data.language', {
      ...omit(language, ['createdAt', 'updatedAt', 'hasVideos']),
      name: languageName.map((languageName) =>
        omit(languageName, ['id', 'languageId', 'parentLanguageId'])
      ),
      audioPreview: {
        ...omit(audioPreview, 'languageId', 'updatedAt'),
        language: { id: audioPreview.languageId }
      },
      primaryCountryId: 'US',
      speakerCount: '1000000',
      countriesCount: 10
    })
  })

  it('should query language', async () => {
    prismaMock.language.findUnique.mockResolvedValue({
      ...language,
      audioPreview: {
        ...audioPreview,
        language: { id: audioPreview.languageId }
      },
      name: languageName
    } as unknown as Language)
    prismaMock.countryLanguage.findFirst.mockResolvedValue({
      id: 'cl1',
      languageId: 'en',
      countryId: 'US',
      speakers: 1000000,
      displaySpeakers: 1000000,
      primary: true,
      suggested: false,
      order: 1
    })
    prismaMock.countryLanguage.aggregate.mockResolvedValue({
      _count: {},
      _min: {},
      _max: {},
      _avg: {},
      _sum: { speakers: 1000000 }
    })
    prismaMock.countryLanguage.count.mockResolvedValue(10)

    const data = await client({
      document: LANGUAGE_QUERY,
      variables: {
        languageId: '529',
        primary: true
      }
    })

    expect(prismaMock.language.findUnique).toHaveBeenCalledWith({
      where: {
        id: '529'
      },
      include: {
        audioPreview: {
          include: {
            language: true
          }
        },
        name: {
          where: {
            OR: [{ languageId: '529' }, { primary: true }]
          },
          orderBy: { primary: 'desc' }
        }
      }
    })
    expect(data).toHaveProperty('data.language', {
      ...omit(language, ['createdAt', 'updatedAt', 'hasVideos']),
      name: languageName.map((languageName) =>
        omit(languageName, ['id', 'languageId', 'parentLanguageId'])
      ),
      audioPreview: {
        ...omit(audioPreview, 'languageId', 'updatedAt'),
        language: { id: audioPreview.languageId }
      },
      primaryCountryId: 'US',
      speakerCount: '1000000',
      countriesCount: 10
    })
  })

  it('should return null when no country found', async () => {
    prismaMock.language.findUnique.mockResolvedValue(null)
    const data = await client({
      document: LANGUAGE_QUERY
    })
    expect(data).toHaveProperty('data.language', null)
  })
})
