import { parse } from 'graphql'
import omit from 'lodash/omit'

import { Language, LanguageRole } from '@core/prisma/languages/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { cache } from '../../yoga'

import { audioPreview, language, languageName, languageSlug } from './language.mock'

const LANGUAGE_QUERY = graphql(`
  query Language($languageId: ID, $primary: Boolean) {
    language(id: "529") {
      id
      updatedAt
      bcp47
      iso3
      slug
      slugs {
        id
        value
        canonical
      }
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

const ADMIN_LANGUAGES_QUERY = graphql(`
  query AdminLanguages($where: AdminLanguagesFilter, $term: String) {
    adminLanguages(where: $where, term: $term) {
      id
      updatedAt
      bcp47
      iso3
      slug
    }
  }
`)

const ADMIN_LANGUAGES_COUNT_QUERY = graphql(`
  query AdminLanguagesCount($where: AdminLanguagesFilter, $term: String) {
    adminLanguagesCount(where: $where, term: $term)
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
      name: languageName,
      slugs: languageSlug
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
        },
        slugs: {
          orderBy: [{ canonical: 'desc' }, { value: 'asc' }]
        }
      }
    })
    expect(data).toHaveProperty('data.language', {
      ...omit(language, ['createdAt', 'hasVideos']),
      updatedAt: language.updatedAt.toISOString(),
      name: languageName.map((languageName) =>
        omit(languageName, ['id', 'languageId', 'parentLanguageId'])
      ),
      slugs: languageSlug.map((slug) =>
        omit(slug, ['languageId', 'createdAt', 'updatedAt'])
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
      name: languageName,
      slugs: languageSlug
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
        },
        slugs: {
          orderBy: [{ canonical: 'desc' }, { value: 'asc' }]
        }
      }
    })
    expect(data).toHaveProperty('data.language', {
      ...omit(language, ['createdAt', 'hasVideos']),
      updatedAt: language.updatedAt.toISOString(),
      name: languageName.map((languageName) =>
        omit(languageName, ['id', 'languageId', 'parentLanguageId'])
      ),
      slugs: languageSlug.map((slug) =>
        omit(slug, ['languageId', 'createdAt', 'updatedAt'])
      ),
      audioPreview: {
        ...omit(audioPreview, 'languageId', 'updatedAt'),
        language: { id: audioPreview.languageId }
      }
    })
  })

  it('should fall back to null slug when a language has no canonical slug', async () => {
    prismaMock.language.findUnique.mockResolvedValue({
      ...language,
      audioPreview: {
        ...audioPreview,
        language
      },
      name: languageName,
      slugs: []
    } as unknown as Language)

    const data = await client({
      document: LANGUAGE_QUERY
    })

    expect(data).toHaveProperty('data.language.slug', null)
    expect(data).toHaveProperty('data.language.slugs', [])
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

const LANGUAGE_SLUG_CREATE_MUTATION = parse(`
  mutation LanguageSlugCreate($input: LanguageSlugCreateInput!) {
    languageSlugCreate(input: $input) {
      id
    }
  }
`)

const LANGUAGE_SLUG_DELETE_MUTATION = parse(`
  mutation LanguageSlugDelete($input: LanguageSlugDeleteInput!) {
    languageSlugDelete(input: $input) {
      id
    }
  }
`)

const LANGUAGE_SLUG_SET_CANONICAL_MUTATION = parse(`
  mutation LanguageSlugSetCanonical($input: LanguageSlugSetCanonicalInput!) {
    languageSlugSetCanonical(input: $input) {
      id
    }
  }
`)

describe('languageSlugCreate', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  beforeEach(() => {
    prismaMock.userLanguageRole.findUnique.mockResolvedValue({
      id: 'roleId',
      userId: 'id',
      roles: [LanguageRole.publisher]
    })
    prismaMock.language.findUniqueOrThrow.mockResolvedValue(language)
  })

  it('should create a non-canonical slug when a canonical slug already exists', async () => {
    prismaMock.languageSlug.findUnique.mockResolvedValue(null)
    prismaMock.languageSlug.count.mockResolvedValue(1)

    await authClient({
      document: LANGUAGE_SLUG_CREATE_MUTATION,
      variables: {
        input: { languageId: language.id, value: ' chinese-mandarin ' }
      }
    })

    expect(prismaMock.languageSlug.findUnique).toHaveBeenCalledWith({
      where: { value: 'chinese-mandarin' }
    })
    expect(prismaMock.languageSlug.count).toHaveBeenCalledWith({
      where: { languageId: language.id, canonical: true }
    })
    expect(prismaMock.languageSlug.create).toHaveBeenCalledWith({
      data: {
        value: 'chinese-mandarin',
        languageId: language.id,
        canonical: false
      }
    })
  })

  it('should create the first slug for a language as canonical', async () => {
    prismaMock.languageSlug.findUnique.mockResolvedValue(null)
    prismaMock.languageSlug.count.mockResolvedValue(0)

    await authClient({
      document: LANGUAGE_SLUG_CREATE_MUTATION,
      variables: {
        input: { languageId: language.id, value: 'mandarin-china' }
      }
    })

    expect(prismaMock.languageSlug.create).toHaveBeenCalledWith({
      data: {
        value: 'mandarin-china',
        languageId: language.id,
        canonical: true
      }
    })
  })

  it('should reject a slug value already in use', async () => {
    prismaMock.languageSlug.findUnique.mockResolvedValue(languageSlug[0])

    const data = (await authClient({
      document: LANGUAGE_SLUG_CREATE_MUTATION,
      variables: {
        input: { languageId: language.id, value: 'mandarin-china' }
      }
    })) as { errors?: Array<{ message: string }> }

    expect(data.errors?.[0].message).toBe(
      'Language slug "mandarin-china" is already in use'
    )
    expect(prismaMock.languageSlug.create).not.toHaveBeenCalled()
  })

  it('should reject a slug value containing a slash', async () => {
    const data = (await authClient({
      document: LANGUAGE_SLUG_CREATE_MUTATION,
      variables: {
        input: { languageId: language.id, value: 'mandarin/china' }
      }
    })) as { errors?: Array<{ message: string }> }

    expect(data.errors?.[0].message).toBe(
      'Language slug must not contain a slash'
    )
    expect(prismaMock.languageSlug.create).not.toHaveBeenCalled()
  })
})

describe('languageSlugDelete', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  beforeEach(() => {
    prismaMock.userLanguageRole.findUnique.mockResolvedValue({
      id: 'roleId',
      userId: 'id',
      roles: [LanguageRole.publisher]
    })
    prismaMock.language.findUniqueOrThrow.mockResolvedValue(language)
  })

  it('should delete a non-canonical slug', async () => {
    prismaMock.languageSlug.findUnique.mockResolvedValue(languageSlug[1])

    await authClient({
      document: LANGUAGE_SLUG_DELETE_MUTATION,
      variables: { input: { id: languageSlug[1].id } }
    })

    expect(prismaMock.languageSlug.delete).toHaveBeenCalledWith({
      where: { id: languageSlug[1].id }
    })
  })

  it('should reject removing the canonical slug while other slugs exist', async () => {
    prismaMock.languageSlug.findUnique.mockResolvedValue(languageSlug[0])
    prismaMock.languageSlug.count.mockResolvedValue(1)

    const data = (await authClient({
      document: LANGUAGE_SLUG_DELETE_MUTATION,
      variables: { input: { id: languageSlug[0].id } }
    })) as { errors?: Array<{ message: string }> }

    expect(prismaMock.languageSlug.count).toHaveBeenCalledWith({
      where: {
        languageId: languageSlug[0].languageId,
        id: { not: languageSlug[0].id }
      }
    })
    expect(data.errors?.[0].message).toBe(
      'Cannot remove the canonical language slug while other slugs exist'
    )
    expect(prismaMock.languageSlug.delete).not.toHaveBeenCalled()
  })

  it('should allow removing the canonical slug when it is the only slug', async () => {
    prismaMock.languageSlug.findUnique.mockResolvedValue(languageSlug[0])
    prismaMock.languageSlug.count.mockResolvedValue(0)

    await authClient({
      document: LANGUAGE_SLUG_DELETE_MUTATION,
      variables: { input: { id: languageSlug[0].id } }
    })

    expect(prismaMock.languageSlug.delete).toHaveBeenCalledWith({
      where: { id: languageSlug[0].id }
    })
  })

  it('should reject an unknown slug id', async () => {
    prismaMock.languageSlug.findUnique.mockResolvedValue(null)

    const data = (await authClient({
      document: LANGUAGE_SLUG_DELETE_MUTATION,
      variables: { input: { id: 'missing' } }
    })) as { errors?: Array<{ message: string }> }

    expect(data.errors?.[0].message).toBe(
      'Language slug not found with id missing'
    )
    expect(prismaMock.languageSlug.delete).not.toHaveBeenCalled()
  })
})

describe('languageSlugSetCanonical', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  beforeEach(() => {
    prismaMock.userLanguageRole.findUnique.mockResolvedValue({
      id: 'roleId',
      userId: 'id',
      roles: [LanguageRole.publisher]
    })
    prismaMock.language.findUniqueOrThrow.mockResolvedValue(language)
  })

  it('should clear the previous canonical slug and set the new one', async () => {
    prismaMock.languageSlug.findUnique.mockResolvedValue(languageSlug[1])

    await authClient({
      document: LANGUAGE_SLUG_SET_CANONICAL_MUTATION,
      variables: { input: { id: languageSlug[1].id } }
    })

    expect(prismaMock.languageSlug.updateMany).toHaveBeenCalledWith({
      where: { languageId: languageSlug[1].languageId, canonical: true },
      data: { canonical: false }
    })
    expect(prismaMock.languageSlug.update).toHaveBeenCalledWith({
      where: { id: languageSlug[1].id },
      data: { canonical: true }
    })
    expect(prismaMock.$transaction).toHaveBeenCalled()
  })

  it('should reject an unknown slug id', async () => {
    prismaMock.languageSlug.findUnique.mockResolvedValue(null)

    const data = (await authClient({
      document: LANGUAGE_SLUG_SET_CANONICAL_MUTATION,
      variables: { input: { id: 'missing' } }
    })) as { errors?: Array<{ message: string }> }

    expect(data.errors?.[0].message).toBe(
      'Language slug not found with id missing'
    )
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })
})

describe('languages', () => {
  const client = getClient()

  afterEach(async () => {
    await cache.invalidate([{ typename: 'Language' }])
  })

  const slugsInclude = {
    slugs: {
      orderBy: [{ canonical: 'desc' }, { value: 'asc' }]
    }
  }

  it('should query languages with default hasVideos filter', async () => {
    prismaMock.language.findMany.mockResolvedValue([language])

    await client({
      document: LANGUAGES_QUERY
    })

    expect(prismaMock.language.findMany).toHaveBeenCalledWith({
      include: slugsInclude,
      where: {
        hasVideos: true,
        updatedAt: undefined
      }
    })
  })

  it('should query languages with updatedAt filter', async () => {
    prismaMock.language.findMany.mockResolvedValue([
      { ...language, slugs: languageSlug }
    ])

    const updatedSince = '2021-01-01T00:00:00.000Z'
    const data = await client({
      document: LANGUAGES_QUERY,
      variables: {
        where: { updatedAt: { gte: updatedSince } }
      }
    })

    expect(prismaMock.language.findMany).toHaveBeenCalledWith({
      include: slugsInclude,
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

  it('should query languages with ids, bcp47, and iso3 filters while preserving default hasVideos filter', async () => {
    prismaMock.language.findMany.mockResolvedValue([language])

    await client({
      document: LANGUAGES_QUERY,
      variables: {
        where: {
          ids: ['529'],
          bcp47: ['en'],
          iso3: ['eng']
        }
      }
    })

    expect(prismaMock.language.findMany).toHaveBeenCalledWith({
      include: slugsInclude,
      where: {
        id: { in: ['529'] },
        bcp47: { in: ['en'] },
        iso3: { in: ['eng'] },
        hasVideos: true,
        updatedAt: undefined
      }
    })
  })

  it('should query languages by language name search term', async () => {
    prismaMock.language.findMany.mockResolvedValue([language])

    await client({
      document: LANGUAGES_QUERY,
      variables: { term: 'eng' }
    })

    expect(prismaMock.language.findMany).toHaveBeenCalledWith({
      include: slugsInclude,
      where: {
        hasVideos: true,
        updatedAt: undefined,
        name: {
          some: {
            value: { contains: 'eng', mode: 'insensitive' }
          }
        }
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
        hasVideos: true,
        updatedAt: { gte: new Date(updatedSince) }
      }
    })
    expect(data).toHaveProperty('data.languagesCount', 5)
  })

  it('should count languages by language name search term', async () => {
    prismaMock.language.count.mockResolvedValue(5)

    await client({
      document: LANGUAGES_COUNT_QUERY,
      variables: { term: '123' }
    })

    expect(prismaMock.language.count).toHaveBeenCalledWith({
      where: {
        hasVideos: true,
        updatedAt: undefined,
        name: {
          some: {
            value: { contains: '123', mode: 'insensitive' }
          }
        }
      }
    })
  })
})

describe('adminLanguages', () => {
  const authClient = getClient({
    headers: {
      authorization: 'token'
    }
  })

  beforeEach(() => {
    prismaMock.userLanguageRole.findUnique.mockResolvedValue({
      id: 'roleId',
      userId: 'id',
      roles: [LanguageRole.publisher]
    })
  })

  afterEach(async () => {
    await cache.invalidate([{ typename: 'Language' }])
  })

  const slugsInclude = {
    slugs: {
      orderBy: [{ canonical: 'desc' }, { value: 'asc' }]
    }
  }

  it('should query admin languages without default hasVideos filter', async () => {
    prismaMock.language.findMany.mockResolvedValue([language])

    await authClient({
      document: ADMIN_LANGUAGES_QUERY
    })

    expect(prismaMock.language.findMany).toHaveBeenCalledWith({
      include: slugsInclude,
      orderBy: { id: 'asc' },
      where: {
        updatedAt: undefined
      }
    })
  })

  it('should query admin languages with hasVideos filter', async () => {
    prismaMock.language.findMany.mockResolvedValue([language])

    await authClient({
      document: ADMIN_LANGUAGES_QUERY,
      variables: { where: { hasVideos: false } }
    })

    expect(prismaMock.language.findMany).toHaveBeenCalledWith({
      include: slugsInclude,
      orderBy: { id: 'asc' },
      where: {
        hasVideos: false,
        updatedAt: undefined
      }
    })
  })

  it('should query admin languages by language name or id prefix search term', async () => {
    prismaMock.language.findMany.mockResolvedValue([language])

    await authClient({
      document: ADMIN_LANGUAGES_QUERY,
      variables: { term: 'eng' }
    })

    expect(prismaMock.language.findMany).toHaveBeenCalledWith({
      include: slugsInclude,
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

  it('should count admin languages without default hasVideos filter', async () => {
    prismaMock.language.count.mockResolvedValue(5)

    await authClient({
      document: ADMIN_LANGUAGES_COUNT_QUERY
    })

    expect(prismaMock.language.count).toHaveBeenCalledWith({
      where: {
        updatedAt: undefined
      }
    })
  })

  it('should count admin languages with hasVideos filter', async () => {
    prismaMock.language.count.mockResolvedValue(3)

    await authClient({
      document: ADMIN_LANGUAGES_COUNT_QUERY,
      variables: { where: { hasVideos: true } }
    })

    expect(prismaMock.language.count).toHaveBeenCalledWith({
      where: {
        hasVideos: true,
        updatedAt: undefined
      }
    })
  })

  it('should reject unauthenticated admin language query', async () => {
    const client = getClient()
    const data = (await client({
      document: ADMIN_LANGUAGES_QUERY
    })) as { data: null; errors?: Array<{ message: string }> }

    expect(data).toHaveProperty('data', null)
    expect(data.errors?.[0].message).toBe(
      'Not authorized to resolve Query.adminLanguages'
    )
  })
})
