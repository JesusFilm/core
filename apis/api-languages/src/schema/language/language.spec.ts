import { parse } from 'graphql'
import omit from 'lodash/omit'

import { Language, LanguageRole } from '@core/prisma/languages/client'
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
  query Languages($where: LanguagesFilter, $term: String) {
    languages(where: $where, term: $term) {
      id
      updatedAt
      bcp47
      iso3
      slug
    }
  }
`)

const LANGUAGES_COUNT_QUERY = graphql(`
  query LanguagesCount($where: LanguagesFilter, $term: String) {
    languagesCount(where: $where, term: $term)
  }
`)

const LANGUAGE_UPDATE_MUTATION = parse(`
  mutation LanguageUpdate($input: LanguageUpdateInput!) {
    languageUpdate(input: $input) {
      id
      bcp47
      iso3
    }
  }
`)

const LANGUAGE_NAME_UPDATE_MUTATION = parse(`
  mutation LanguageNameUpdate($input: LanguageNameUpdateInput!) {
    languageNameUpdate(input: $input) {
      id
      name {
        id
        value
        languageId
        primary
      }
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

describe('languageUpdate', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  it('should update language codes', async () => {
    prismaMock.userLanguageRole.findUnique.mockResolvedValue({
      id: 'roleId',
      userId: 'id',
      roles: [LanguageRole.publisher]
    })
    prismaMock.language.update.mockResolvedValue({
      ...language,
      bcp47: 'zh-Hans',
      iso3: 'zho'
    })

    const data = await authClient({
      document: LANGUAGE_UPDATE_MUTATION,
      variables: {
        input: {
          id: language.id,
          bcp47: ' zh-Hans ',
          iso3: ' zho '
        }
      }
    })

    expect(prismaMock.language.update).toHaveBeenCalledWith({
      where: { id: language.id },
      data: { bcp47: 'zh-Hans', iso3: 'zho' }
    })
    expect(data).toHaveProperty('data.languageUpdate', {
      id: language.id,
      bcp47: 'zh-Hans',
      iso3: 'zho'
    })
  })
})

describe('languageNameUpdate', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  it('should update the selected language name', async () => {
    prismaMock.userLanguageRole.findUnique.mockResolvedValue({
      id: 'roleId',
      userId: 'id',
      roles: [LanguageRole.publisher]
    })
    prismaMock.languageName.findFirst.mockResolvedValue(languageName[1])
    prismaMock.languageName.update.mockResolvedValue({
      ...languageName[1],
      value: 'Mandarin Chinese'
    })
    prismaMock.language.findUniqueOrThrow.mockResolvedValue({
      ...language,
      name: [languageName[0], { ...languageName[1], value: 'Mandarin Chinese' }]
    } as unknown as Language)

    const data = await authClient({
      document: LANGUAGE_NAME_UPDATE_MUTATION,
      variables: {
        input: {
          languageId: language.id,
          nameLanguageId: '529',
          value: ' Mandarin Chinese '
        }
      }
    })

    expect(prismaMock.languageName.findFirst).toHaveBeenCalledWith({
      where: {
        parentLanguageId: language.id,
        languageId: '529',
        primary: false
      },
      select: { id: true }
    })
    expect(prismaMock.languageName.update).toHaveBeenCalledWith({
      where: { id: languageName[1].id },
      data: { value: 'Mandarin Chinese' }
    })
    expect(prismaMock.language.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: language.id },
      include: {
        name: {
          where: { OR: [{ languageId: '529' }, { primary: true }] },
          orderBy: { primary: 'desc' }
        }
      }
    })
    expect(data).toHaveProperty('data.languageNameUpdate', {
      id: language.id,
      name: [
        omit(languageName[0], ['parentLanguageId']),
        omit({ ...languageName[1], value: 'Mandarin Chinese' }, [
          'parentLanguageId'
        ])
      ]
    })
  })

  it('should create a missing selected language name', async () => {
    prismaMock.userLanguageRole.findUnique.mockResolvedValue({
      id: 'roleId',
      userId: 'id',
      roles: [LanguageRole.publisher]
    })
    prismaMock.languageName.findFirst.mockResolvedValue(null)
    prismaMock.languageName.create.mockResolvedValue({
      ...languageName[1],
      value: 'Mandarin Chinese'
    })
    prismaMock.language.findUniqueOrThrow.mockResolvedValue({
      ...language,
      name: [languageName[0], { ...languageName[1], value: 'Mandarin Chinese' }]
    } as unknown as Language)

    await authClient({
      document: LANGUAGE_NAME_UPDATE_MUTATION,
      variables: {
        input: {
          languageId: language.id,
          nameLanguageId: '529',
          value: ' Mandarin Chinese '
        }
      }
    })

    expect(prismaMock.languageName.create).toHaveBeenCalledWith({
      data: {
        parentLanguageId: language.id,
        languageId: '529',
        primary: false,
        value: 'Mandarin Chinese'
      }
    })
  })

  it('should create a missing native language name', async () => {
    prismaMock.userLanguageRole.findUnique.mockResolvedValue({
      id: 'roleId',
      userId: 'id',
      roles: [LanguageRole.publisher]
    })
    prismaMock.languageName.findFirst.mockResolvedValue(null)
    prismaMock.languageName.create.mockResolvedValue({
      ...languageName[0],
      value: '普通話'
    })
    prismaMock.language.findUniqueOrThrow.mockResolvedValue({
      ...language,
      name: [{ ...languageName[0], value: '普通話' }]
    } as unknown as Language)

    await authClient({
      document: LANGUAGE_NAME_UPDATE_MUTATION,
      variables: {
        input: {
          languageId: language.id,
          value: ' 普通話 '
        }
      }
    })

    expect(prismaMock.languageName.create).toHaveBeenCalledWith({
      data: {
        parentLanguageId: language.id,
        languageId: language.id,
        primary: true,
        value: '普通話'
      }
    })
  })
})

describe('languages', () => {
  const client = getClient()

  afterEach(async () => {
    await cache.invalidate([{ typename: 'Language' }])
  })

  it('should query languages with updatedAt filter', async () => {
    prismaMock.language.findMany.mockResolvedValue([language])

    const updatedSince = '2021-01-01T00:00:00.000Z'
    const data = await client({
      document: LANGUAGES_QUERY,
      variables: {
        where: { updatedAt: { gte: updatedSince } }
      }
    })

    expect(prismaMock.language.findMany).toHaveBeenCalledWith({
      orderBy: { id: 'asc' },
      where: {
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

  it('should query languages with hasVideos filter', async () => {
    prismaMock.language.findMany.mockResolvedValue([language])

    await client({
      document: LANGUAGES_QUERY,
      variables: { where: { hasVideos: true } }
    })

    expect(prismaMock.language.findMany).toHaveBeenCalledWith({
      orderBy: { id: 'asc' },
      where: {
        hasVideos: true,
        updatedAt: undefined
      }
    })
  })

  it('should query languages by language name or id prefix search term', async () => {
    prismaMock.language.findMany.mockResolvedValue([language])

    await client({
      document: LANGUAGES_QUERY,
      variables: { term: 'eng' }
    })

    expect(prismaMock.language.findMany).toHaveBeenCalledWith({
      orderBy: { id: 'asc' },
      where: {
        updatedAt: undefined,
        OR: [
          { id: { startsWith: 'eng' } },
          {
            name: {
              some: {
                value: { contains: 'eng', mode: 'insensitive' }
              }
            }
          }
        ]
      }
    })
  })
})

describe('languagesCount', () => {
  const client = getClient()

  afterEach(async () => {
    await cache.invalidate([{ typename: 'Language' }])
  })

  it('should query languagesCount with updatedAt filter', async () => {
    prismaMock.language.count.mockResolvedValue(5)

    const updatedSince = '2021-01-01T00:00:00.000Z'
    const data = await client({
      document: LANGUAGES_COUNT_QUERY,
      variables: {
        where: { updatedAt: { gte: updatedSince } }
      }
    })

    expect(prismaMock.language.count).toHaveBeenCalledWith({
      where: {
        updatedAt: { gte: new Date(updatedSince) }
      }
    })
    expect(data).toHaveProperty('data.languagesCount', 5)
  })

  it('should count languages with hasVideos filter', async () => {
    prismaMock.language.count.mockResolvedValue(3)

    await client({
      document: LANGUAGES_COUNT_QUERY,
      variables: { where: { hasVideos: false } }
    })

    expect(prismaMock.language.count).toHaveBeenCalledWith({
      where: {
        hasVideos: false,
        updatedAt: undefined
      }
    })
  })

  it('should count languages by numeric id prefix search term', async () => {
    prismaMock.language.count.mockResolvedValue(5)

    await client({
      document: LANGUAGES_COUNT_QUERY,
      variables: { term: '123' }
    })

    expect(prismaMock.language.count).toHaveBeenCalledWith({
      where: {
        updatedAt: undefined,
        OR: [
          { id: { startsWith: '123' } },
          {
            name: {
              some: {
                value: { contains: '123', mode: 'insensitive' }
              }
            }
          }
        ]
      }
    })
  })
})
