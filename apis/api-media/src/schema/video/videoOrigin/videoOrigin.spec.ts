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

  describe('queries', () => {
    describe('videoOrigins', () => {
      const VIDEO_ORIGINS_QUERY = graphql(`
        query VideoOriginsQuery {
          videoOrigins {
            id
            name
            description
          }
        }
      `)

      it('should fetch video origins', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoOrigin.findMany.mockResolvedValue([
          {
            id: 'origin1',
            name: 'Origin A',
            description: 'First origin'
          },
          {
            id: 'origin2',
            name: 'Origin B',
            description: 'Second origin'
          }
        ])
        const result = await authClient({
          document: VIDEO_ORIGINS_QUERY
        })
        expect(prismaMock.videoOrigin.findMany).toHaveBeenCalledWith({
          orderBy: { name: 'asc' }
        })
        expect(result).toHaveProperty('data.videoOrigins', [
          {
            id: 'origin1',
            name: 'Origin A',
            description: 'First origin'
          },
          {
            id: 'origin2',
            name: 'Origin B',
            description: 'Second origin'
          }
        ])
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: VIDEO_ORIGINS_QUERY
        })
        expect(result).toHaveProperty('data', null)
      })
    })
  })

  describe('mutations', () => {
    describe('videoOriginCreate', () => {
      const VIDEO_ORIGIN_CREATE_MUTATION = graphql(`
        mutation VideoOriginCreateMutation(
          $input: MutationVideoOriginCreateInput!
        ) {
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
          document: VIDEO_ORIGIN_CREATE_MUTATION,
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
          document: VIDEO_ORIGIN_CREATE_MUTATION,
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
      const VIDEO_ORIGIN_UPDATE_MUTATION = graphql(`
        mutation VideoOriginUpdateMutation(
          $input: MutationVideoOriginUpdateInput!
        ) {
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
          document: VIDEO_ORIGIN_UPDATE_MUTATION,
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
          document: VIDEO_ORIGIN_UPDATE_MUTATION,
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
      const VIDEO_ORIGIN_DELETE_MUTATION = graphql(`
        mutation VideoOriginDeleteMutation($id: ID!) {
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
          document: VIDEO_ORIGIN_DELETE_MUTATION,
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

      it('should reject if not publisher', async () => {
        const result = await client({
          document: VIDEO_ORIGIN_DELETE_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })
  })
})
