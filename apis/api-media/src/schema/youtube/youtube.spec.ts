import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'

describe('youtube', () => {
  const client = getClient()

  describe('entity', () => {
    const YOUTUBE = graphql(`
      query Youtube {
        _entities(
          representations: [
            { __typename: "Youtube", id: "testId", primaryLanguageId: null }
          ]
        ) {
          ... on Youtube {
            id
          }
        }
      }
    `)

    it('should return youtube video', async () => {
      const data = await client({
        document: YOUTUBE
      })
      expect(data).toHaveProperty('data._entities[0]', {
        id: 'testId'
      })
    })
  })
})
