import { graphql } from 'gql.tada'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

describe('videoOrigin', () => {
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
    describe('videoOriginCreate', () => {
      const CREATE_VIDEO_ORIGIN_MUTATION = graphql(`
        mutation CreateVideoOrigin($input: VideoOriginCreateInput!) {
          videoOriginCreate(input: $input) {
            id
          }
        }
      `)

      it('should create video origin', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoOrigin.create.mockResolvedValue({
          id: 'id',
          name: 'Test Origin',
          description: 'A test origin.'
        })
        const result = await authClient({
          document: CREATE_VIDEO_ORIGIN_MUTATION,
          variables: {
            input: {
              name: 'Test Origin',
              description: 'A test origin.'
            }
          }
        })
        expect(result).toHaveProperty('data.videoOriginCreate', {
          id: 'id'
        })
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: CREATE_VIDEO_ORIGIN_MUTATION,
          variables: {
            input: {
              name: 'Test Origin',
              description: 'A test origin.'
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })

    describe('videoOriginUpdate', () => {
      const UPDATE_VIDEO_ORIGIN_MUTATION = graphql(`
        mutation UpdateVideoOrigin($input: VideoOriginUpdateInput!) {
          videoOriginUpdate(input: $input) {
            id
          }
        }
      `)

      it('should update video origin', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoOrigin.update.mockResolvedValue({
          id: 'id',
          name: 'Updated Origin',
          description: 'Updated description.'
        })
        const result = await authClient({
          document: UPDATE_VIDEO_ORIGIN_MUTATION,
          variables: {
            input: {
              id: 'id',
              name: 'Updated Origin',
              description: 'Updated description.'
            }
          }
        })
        expect(result).toHaveProperty('data.videoOriginUpdate', {
          id: 'id'
        })
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: UPDATE_VIDEO_ORIGIN_MUTATION,
          variables: {
            input: {
              id: 'id',
              name: 'Updated Origin',
              description: 'Updated description.'
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })

    describe('videoOriginDelete', () => {
      const DELETE_VIDEO_ORIGIN_MUTATION = graphql(`
        mutation DeleteVideoOrigin($id: ID!) {
          videoOriginDelete(id: $id) {
            id
          }
        }
      `)

      it('should delete video origin', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoOrigin.delete.mockResolvedValue({
          id: 'id',
          name: 'Test Origin',
          description: 'A test origin.'
        })
        const result = await authClient({
          document: DELETE_VIDEO_ORIGIN_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(prismaMock.videoOrigin.delete).toHaveBeenCalledWith({
          where: { id: 'id' }
        })
        expect(result).toHaveProperty('data.videoOriginDelete', {
          id: 'id'
        })
      })

      it('should throw if not publisher', async () => {
        const result = await authClient({
          document: DELETE_VIDEO_ORIGIN_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })
  })
})
