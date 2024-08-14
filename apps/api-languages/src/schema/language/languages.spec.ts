import { graphql } from 'gql.tada'
import omit from 'lodash/omit'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { cache } from '../../yoga'

import { language, languageName } from './language.mock'

const LANGUAGES_QUERY = graphql(`
  query Languages($languageId: ID, $primary: Boolean) {
    languages {
      id
      bcp47
      iso3
      slug
      name(languageId: $languageId, primary: $primary) {
        value
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
    prismaMock.language.findMany.mockResolvedValue([language])
    prismaMock.languageName.findMany.mockResolvedValue(languageName)
    const data = await client({
      document: LANGUAGES_QUERY
    })
    expect(prismaMock.language.findMany).toHaveBeenCalledWith({
      where: {
        hasVideos: true
      }
    })
    expect(prismaMock.languageName.findMany).toHaveBeenCalledWith({
      where: {
        parentLanguageId: '20615',
        OR: [{ languageId: '529' }, { primary: true }]
      },
      include: { language: true },
      orderBy: { primary: 'desc' }
    })
    expect(data).toHaveProperty('data.languages', [
      {
        ...omit(language, ['createdAt', 'updatedAt', 'hasVideos']),
        name: languageName.map((languageName) =>
          omit(languageName, ['id', 'languageId', 'parentLanguageId'])
        )
      }
    ])
  })

  it('should query language', async () => {
    prismaMock.language.findMany.mockResolvedValue([language])
    prismaMock.languageName.findMany.mockResolvedValue(languageName)
    const data = await client({
      document: LANGUAGES_QUERY,
      variables: {
        languageId: '529',
        primary: true
      }
    })
    expect(prismaMock.language.findMany).toHaveBeenCalledWith({
      where: {
        hasVideos: true
      }
    })
    expect(prismaMock.languageName.findMany).toHaveBeenCalledWith({
      where: {
        parentLanguageId: '20615',
        OR: [{ languageId: '529' }, { primary: true }]
      },
      include: { language: true },
      orderBy: { primary: 'desc' }
    })
    expect(data).toHaveProperty('data.languages', [
      {
        ...omit(language, ['createdAt', 'updatedAt', 'hasVideos']),
        name: languageName.map((languageName) =>
          omit(languageName, ['id', 'languageId', 'parentLanguageId'])
        )
      }
    ])
  })

  it('should return null when no country found', async () => {
    prismaMock.language.findMany.mockResolvedValue([])
    const data = await client({
      document: LANGUAGES_QUERY
    })
    expect(data).toHaveProperty('data.languages', [])
  })
})
