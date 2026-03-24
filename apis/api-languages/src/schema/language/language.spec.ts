import omit from 'lodash/omit'

import { Language } from '@core/prisma/languages/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { cache } from '../../yoga'

import { audioPreview, language, languageName } from './language.mock'

const LANGUAGE_QUERY = graphql(`
  query Language($languageId: ID, $primary: Boolean) {
    language(id: "529") {
      id
      updatedAt
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
    }
  }
`)

const LANGUAGES_QUERY = graphql(`
  query Languages($where: LanguagesFilter) {
    languages(where: $where) {
      id
      updatedAt
      bcp47
      iso3
      slug
    }
  }
`)

const LANGUAGES_COUNT_QUERY = graphql(`
  query LanguagesCount($where: LanguagesFilter) {
    languagesCount(where: $where)
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
      ...omit(language, ['createdAt', 'hasVideos']),
      updatedAt: language.updatedAt.toISOString(),
      name: languageName.map((languageName) =>
        omit(languageName, ['id', 'languageId', 'parentLanguageId'])
      ),
      audioPreview: {
        ...omit(audioPreview, 'languageId', 'updatedAt'),
        language: { id: audioPreview.languageId }
      }
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
      ...omit(language, ['createdAt', 'hasVideos']),
      updatedAt: language.updatedAt.toISOString(),
      name: languageName.map((languageName) =>
        omit(languageName, ['id', 'languageId', 'parentLanguageId'])
      ),
      audioPreview: {
        ...omit(audioPreview, 'languageId', 'updatedAt'),
        language: { id: audioPreview.languageId }
      }
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

describe('languages', () => {
  const client = getClient()

  afterEach(async () => {
    await cache.invalidate([{ typename: 'Language' }])
  })

  it('should query languages with updatedSince filter', async () => {
    prismaMock.language.findMany.mockResolvedValue([language])

    const updatedSince = '2021-01-01T00:00:00.000Z'
    const data = await client({
      document: LANGUAGES_QUERY,
      variables: {
        where: { updatedSince }
      }
    })

    expect(prismaMock.language.findMany).toHaveBeenCalledWith({
      where: {
        hasVideos: true,
        updatedAt: { gte: new Date(updatedSince) }
      }
    })
    expect(data).toHaveProperty('data.languages', [
      {
        ...omit(language, ['createdAt', 'hasVideos']),
        updatedAt: language.updatedAt.toISOString()
      }
    ])
  })
})

describe('languagesCount', () => {
  const client = getClient()

  afterEach(async () => {
    await cache.invalidate([{ typename: 'Language' }])
  })

  it('should query languagesCount with updatedSince filter', async () => {
    prismaMock.language.count.mockResolvedValue(5)

    const updatedSince = '2021-01-01T00:00:00.000Z'
    const data = await client({
      document: LANGUAGES_COUNT_QUERY,
      variables: {
        where: { updatedSince }
      }
    })

    expect(prismaMock.language.count).toHaveBeenCalledWith({
      where: {
        hasVideos: true,
        updatedAt: { gte: new Date(updatedSince) }
      }
    })
    expect(data).toHaveProperty('data.languagesCount', 5)
  })
})
