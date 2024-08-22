import { graphql } from 'gql.tada'
import omit from 'lodash/omit'

import { Language } from '.prisma/api-languages-client'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { cache } from '../../yoga'

import { audioPreview, language, languageName } from './user.mock'

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
      audioPreview {
        value
        duration
        size
        language {
          id
        }
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
      }
    } as unknown as Language)
    prismaMock.languageName.findMany.mockResolvedValue(languageName)
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
        }
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
      ...omit(language, ['createdAt', 'updatedAt', 'hasVideos']),
      name: languageName.map((languageName) =>
        omit(languageName, ['id', 'languageId', 'parentLanguageId'])
      ),
      audioPreview: {
        ...omit(audioPreview, 'languageId'),
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
      }
    } as unknown as Language)
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
      },
      include: {
        audioPreview: {
          include: {
            language: true
          }
        }
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
      ...omit(language, ['createdAt', 'updatedAt', 'hasVideos']),
      name: languageName.map((languageName) =>
        omit(languageName, ['id', 'languageId', 'parentLanguageId'])
      ),
      audioPreview: {
        ...omit(audioPreview, 'languageId'),
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
