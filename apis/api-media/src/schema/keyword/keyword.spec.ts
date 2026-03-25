import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

describe('Keyword', () => {
  const client = getClient()

  const authClient = getClient({
    headers: {
      authorization: 'token'
    },
    context: {
      currentRoles: ['publisher']
    }
  })

  describe('keywords', () => {
    const KEYWORDS_QUERY = graphql(`
      query Keywords {
        keywords {
          id
          value
          language {
            id
          }
        }
      }
    `)

    it('should query keywords', async () => {
      prismaMock.keyword.findMany.mockResolvedValue([
        {
          id: 'keywordId',
          value: 'value',
          languageId: 'languageId',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
      const data = await client({
        document: KEYWORDS_QUERY
      })
      expect(prismaMock.keyword.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { updatedAt: undefined }
        })
      )
      expect(data).toHaveProperty('data.keywords', [
        {
          id: 'keywordId',
          value: 'value',
          language: { id: 'languageId' }
        }
      ])
    })

    it('should query keywords with updatedAt filter', async () => {
      prismaMock.keyword.findMany.mockResolvedValue([
        {
          id: 'keywordId',
          value: 'value',
          languageId: 'languageId',
          createdAt: new Date(),
          updatedAt: new Date('2025-06-01T00:00:00.000Z')
        }
      ])

      const KEYWORDS_FILTER_QUERY = graphql(`
        query KeywordsWithFilter($where: KeywordsFilter) {
          keywords(where: $where) {
            id
            updatedAt
          }
        }
      `)

      const data = await client({
        document: KEYWORDS_FILTER_QUERY,
        variables: {
          where: { updatedAt: { gte: '2025-01-01T00:00:00.000Z' } }
        }
      })

      expect(prismaMock.keyword.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            updatedAt: { gte: new Date('2025-01-01T00:00:00.000Z') }
          }
        })
      )
      expect(data).toHaveProperty('data.keywords', [
        {
          id: 'keywordId',
          updatedAt: '2025-06-01T00:00:00.000Z'
        }
      ])
    })
  })

  describe('createKeyword', () => {
    const CREATE_KEYWORD_MUTATION = graphql(`
      mutation CreateKeyword($value: String!, $languageId: String!) {
        createKeyword(value: $value, languageId: $languageId) {
          id
          value
          language {
            id
          }
        }
      }
    `)

    it('should create a keyword', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher'],
        createdAt: new Date(),
        updatedAt: new Date()
      })

      prismaMock.keyword.upsert.mockResolvedValue({
        id: 'newKeywordId',
        value: 'newValue',
        languageId: 'languageId',
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const data = await authClient({
        document: CREATE_KEYWORD_MUTATION,
        variables: {
          value: 'newValue',
          languageId: 'languageId'
        }
      })

      expect(prismaMock.keyword.upsert).toHaveBeenCalledWith({
        where: {
          value_languageId: {
            value: 'newValue',
            languageId: 'languageId'
          }
        },
        update: {},
        create: {
          value: 'newValue',
          languageId: 'languageId'
        }
      })

      expect(data).toHaveProperty('data.createKeyword', {
        id: 'newKeywordId',
        value: 'newValue',
        language: { id: 'languageId' }
      })
    })

    it('should reject if not publisher', async () => {
      const result = await client({
        document: CREATE_KEYWORD_MUTATION,
        variables: {
          value: 'newValue',
          languageId: 'languageId'
        }
      })
      expect(result).toHaveProperty('data', null)
      expect(result).toHaveProperty('errors')
    })
  })
})
