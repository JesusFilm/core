import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

describe('videoEdition', () => {
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
    describe('videoEditions', () => {
      const VIDEO_EDITIONS_QUERY = graphql(`
        query VideoEditions {
          videoEditions {
            id
            name
          }
        }
      `)

      it('should query video editions', async () => {
        prismaMock.videoEdition.findMany.mockResolvedValueOnce([
          {
            id: 'id',
            name: 'name',
            videoId: 'videoId'
          }
        ])
        const data = await client({
          document: VIDEO_EDITIONS_QUERY
        })
        expect(prismaMock.videoEdition.findMany).toHaveBeenCalledWith({})
        expect(data).toHaveProperty('data.videoEditions', [
          {
            id: 'id',
            name: 'name'
          }
        ])
      })
    })

    describe('videoEdition', () => {
      const VIDEO_EDITION_QUERY = graphql(`
        query VideoEdition($id: ID!) {
          videoEdition(id: $id) {
            id
            name
          }
        }
      `)

      it('should get videoEdition', async () => {
        prismaMock.videoEdition.findUnique.mockResolvedValue({
          id: 'id',
          name: 'name',
          videoId: 'videoId'
        })
        const data = await client({
          document: VIDEO_EDITION_QUERY,
          variables: {
            id: 'id'
          }
        })
        expect(prismaMock.videoEdition.findUnique).toHaveBeenCalledWith({
          where: {
            id: 'id'
          }
        })
        expect(data).toHaveProperty('data.videoEdition', {
          id: 'id',
          name: 'name'
        })
      })
    })
  })

  describe('mutations', () => {
    describe('videoEditionCreate', () => {
      const CREATE_VIDEO_EDITION_MUTATION = graphql(`
        mutation VideoEditionCreate($input: VideoEditionCreateInput!) {
          videoEditionCreate(input: $input) {
            id
          }
        }
      `)

      it('should create a new video edition', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoEdition.create.mockResolvedValue({
          id: 'id',
          name: 'name',
          videoId: 'videoId'
        })
        const result = await authClient({
          document: CREATE_VIDEO_EDITION_MUTATION,
          variables: {
            input: {
              id: 'id',
              name: 'name',
              videoId: 'videoId'
            }
          }
        })
        expect(prismaMock.videoEdition.create).toHaveBeenCalledWith({
          data: {
            id: 'id',
            name: 'name',
            videoId: 'videoId'
          }
        })
        expect(result).toHaveProperty('data.videoEditionCreate', {
          id: 'id'
        })
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: CREATE_VIDEO_EDITION_MUTATION,
          variables: {
            input: {
              id: 'id',
              name: 'name',
              videoId: 'videoId'
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })

    describe('videoEditionUpdate', () => {
      const UPDATE_VIDEO_EDITION_MUTATION = graphql(`
        mutation VideoEditionUpdate($input: VideoEditionUpdateInput!) {
          videoEditionUpdate(input: $input) {
            id
          }
        }
      `)

      it('should update a video edition', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoEdition.update.mockResolvedValue({
          id: 'id',
          name: 'name',
          videoId: 'videoId'
        })
        const result = await authClient({
          document: UPDATE_VIDEO_EDITION_MUTATION,
          variables: {
            input: {
              id: 'id',
              name: 'name'
            }
          }
        })
        expect(prismaMock.videoEdition.update).toHaveBeenCalledWith({
          where: { id: 'id' },
          data: {
            name: 'name'
          }
        })
        expect(result).toHaveProperty('data.videoEditionUpdate', {
          id: 'id'
        })
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: UPDATE_VIDEO_EDITION_MUTATION,
          variables: {
            input: {
              id: 'id',
              name: 'name'
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })

    describe('videoEditionDelete', () => {
      const DELETE_VIDEO_EDITION_MUTATION = graphql(`
        mutation VideoEditionDelete($id: ID!) {
          videoEditionDelete(id: $id) {
            id
          }
        }
      `)

      it('should delete a video edition', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoEdition.delete.mockResolvedValue({
          id: 'id',
          name: 'name',
          videoId: 'videoId'
        })
        const result = await authClient({
          document: DELETE_VIDEO_EDITION_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(prismaMock.videoEdition.delete).toHaveBeenCalledWith({
          where: { id: 'id' }
        })
        expect(result).toHaveProperty('data.videoEditionDelete', {
          id: 'id'
        })
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: DELETE_VIDEO_EDITION_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })
  })
})
