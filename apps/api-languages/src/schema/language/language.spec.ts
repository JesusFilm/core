import { graphql } from 'gql.tada'
import omit from 'lodash/omit'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { cache } from '../../yoga'
import { language } from './language.mock'
import { languageName } from './language.mock'

const LANGUAGE_QUERY = graphql(`
  query Language($languageId: ID, $primary: Boolean) {
    language(id: "529") {
      id
      bcp47
      iso3
      name(languageId: $languageId, primary: $primary) {
        value
        primary
      }
    }
  }
`)

describe('language', () => {
  const client = getClient()

  afterEach(() => {
    cache.invalidate([{ typename: 'Language' }])
  })

  it('should query language with defaults', async () => {
    prismaMock.language.findUnique.mockResolvedValue(language)
    prismaMock.languageName.findMany.mockResolvedValue(languageName)
    const data = await client({
      document: LANGUAGE_QUERY
    })
    expect(prismaMock.language.findUnique).toHaveBeenCalledWith({
      where: {
        id: '529'
      }
    })
    expect(prismaMock.languageName.findMany).toHaveBeenCalledWith({
      where: {
        parentLanguageId: '20615'
      },
      include: { language: true },
      orderBy: { primary: 'desc' }
    })
    expect(data).toHaveProperty('data.language', {
      ...omit(language, ['createdAt', 'updatedAt']),
      name: languageName.map((languageName) =>
        omit(languageName, ['id', 'languageId', 'parentLanguageId'])
      )
    })
  })

  it('should query language', async () => {
    prismaMock.language.findUnique.mockResolvedValue(language)
    prismaMock.languageName.findMany.mockResolvedValue(languageName)
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
    expect(data).toHaveProperty('data.language', {
      ...omit(language, ['createdAt', 'updatedAt']),
      name: languageName.map((languageName) =>
        omit(languageName, ['id', 'languageId', 'parentLanguageId'])
      )
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
