import { graphql } from 'gql.tada'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

describe('Keyword', () => {
  const client = getClient()

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
})
