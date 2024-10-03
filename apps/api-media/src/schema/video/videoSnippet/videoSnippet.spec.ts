import { graphql } from 'gql.tada'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

describe('videoSnippet', () => {
  const client = getClient()

  const authClient = getClient({
    headers: {
      authorization: 'token'
    },
    context: {
      currentRoles: ['publisher']
    }
  })

  describe('mutations', () => {
    describe('createVideoSnippet', () => {
      const CREATE_VIDEO_SNIPPET_MUTATION = graphql(`
        mutation CreateVideoSnippet($input: VideoTranslationCreateInput!) {
          createVideoSnippet(input: $input) {
            id
          }
        }
      `)

      it('should create video snippet', async () => {
        prismaMock.videoSnippet.create.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: '529'
        })
        const result = await authClient({
          document: CREATE_VIDEO_SNIPPET_MUTATION,
          variables: {
            input: {
              id: 'id',
              videoId: 'videoId',
              value: 'value',
              primary: true,
              languageId: '529'
            }
          }
        })
        expect(result).toHaveProperty('data', {
          createVideoSnippet: {
            id: 'id'
          }
        })
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: CREATE_VIDEO_SNIPPET_MUTATION,
          variables: {
            input: {
              id: 'id',
              videoId: 'videoId',
              value: 'value',
              primary: true,
              languageId: 'languageId'
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })
  })
})
