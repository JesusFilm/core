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

    describe('updateVideoSnippet', () => {
      const UPDATE_VIDEO_SNIPPET_MUTATION = graphql(`
        mutation UpdateVideoSnippet($input: VideoTranslationUpdateInput!) {
          updateVideoSnippet(input: $input) {
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
        expect(result).toHaveProperty('data.updateVideoSnippet', {
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

    describe('deleteVideoSnippet', () => {
      const DELETE_VIDEO_SNIPPET_MUTATION = graphql(`
        mutation DeleteVideoSnippet($id: ID!) {
          deleteVideoSnippet(id: $id) {
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
        expect(result).toHaveProperty('data.deleteVideoSnippet', {
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
