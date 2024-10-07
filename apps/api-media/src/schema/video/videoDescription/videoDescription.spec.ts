import { graphql } from 'gql.tada'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

describe('videoDescription', () => {
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
    describe('createVideoDescription', () => {
      const CREATE_VIDEO_DESCRIPTION_MUTATION = graphql(`
        mutation CreateVideoDescription($input: VideoTranslationCreateInput!) {
          createVideoDescription(input: $input) {
            id
          }
        }
      `)

      it('should create video description', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoDescription.create.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId'
        })
        const result = await authClient({
          document: CREATE_VIDEO_DESCRIPTION_MUTATION,
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
        expect(result).toHaveProperty('data.createVideoDescription', {
          id: 'id'
        })
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: CREATE_VIDEO_DESCRIPTION_MUTATION,
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

    describe('updateVideoDescription', () => {
      const UPDATE_VIDEO_DESCRIPTION_MUTATION = graphql(`
        mutation UpdateVideoDescription($input: VideoTranslationUpdateInput!) {
          updateVideoDescription(input: $input) {
            id
          }
        }
      `)

      it('should update video description', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoDescription.update.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId'
        })
        const result = await authClient({
          document: UPDATE_VIDEO_DESCRIPTION_MUTATION,
          variables: {
            input: {
              id: 'id',
              value: 'value',
              primary: true,
              languageId: 'languageId'
            }
          }
        })
        expect(result).toHaveProperty('data.updateVideoDescription', {
          id: 'id'
        })
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: UPDATE_VIDEO_DESCRIPTION_MUTATION,
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

    describe('deleteVideoDescription', () => {
      const DELETE_VIDEO_DESCRIPTION_MUTATION = graphql(`
        mutation DeleteVideoDescription($id: ID!) {
          deleteVideoDescription(id: $id) {
            id
          }
        }
      `)

      it('should delete video description', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoDescription.delete.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId'
        })
        const result = await authClient({
          document: DELETE_VIDEO_DESCRIPTION_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(result).toHaveProperty('data.deleteVideoDescription', {
          id: 'id'
        })
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: DELETE_VIDEO_DESCRIPTION_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })
  })
})
