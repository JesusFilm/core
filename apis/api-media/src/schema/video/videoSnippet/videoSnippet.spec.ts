import { graphql } from '@core/shared/gql'

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
    describe('videoSnippetCreate', () => {
      const CREATE_VIDEO_SNIPPET_MUTATION = graphql(`
        mutation CreateVideoSnippet($input: VideoTranslationCreateInput!) {
          videoSnippetCreate(input: $input) {
            id
          }
        }
      `)

      it('should create video snippet', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
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
          videoSnippetCreate: {
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

    describe('videoSnippetUpdate', () => {
      const UPDATE_VIDEO_SNIPPET_MUTATION = graphql(`
        mutation UpdateVideoSnippet($input: VideoTranslationUpdateInput!) {
          videoSnippetUpdate(input: $input) {
            id
          }
        }
      `)

      it('should update video snippet', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoSnippet.update.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId'
        })
        const result = await authClient({
          document: UPDATE_VIDEO_SNIPPET_MUTATION,
          variables: {
            input: {
              id: 'id',
              value: 'value',
              primary: true,
              languageId: 'languageId'
            }
          }
        })
        expect(result).toHaveProperty('data.videoSnippetUpdate', {
          id: 'id'
        })
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: UPDATE_VIDEO_SNIPPET_MUTATION,
          variables: {
            input: {
              id: 'id',
              value: 'value',
              primary: true,
              languageId: 'languageId'
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })

    describe('videoSnippetDelete', () => {
      const DELETE_VIDEO_SNIPPET_MUTATION = graphql(`
        mutation DeleteVideoSnippet($id: ID!) {
          videoSnippetDelete(id: $id) {
            id
          }
        }
      `)

      it('should delete video snippet', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoSnippet.delete.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId'
        })
        const result = await authClient({
          document: DELETE_VIDEO_SNIPPET_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(result).toHaveProperty('data.videoSnippetDelete', {
          id: 'id'
        })
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: DELETE_VIDEO_SNIPPET_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })
  })
})
