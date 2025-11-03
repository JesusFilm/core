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
          languageId: 'languageId'
        }
      ])
      const data = await client({
        document: KEYWORDS_QUERY
      })
      expect(prismaMock.keyword.findMany).toHaveBeenCalledWith({})
      expect(data).toHaveProperty('data.keywords', [
        {
          id: 'keywordId',
          value: 'value',
          language: { id: 'languageId' }
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
        roles: ['publisher']
      })

      prismaMock.keyword.upsert.mockResolvedValue({
        id: 'newKeywordId',
        value: 'newValue',
        languageId: 'languageId'
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
