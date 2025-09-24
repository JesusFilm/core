import { graphql } from '@core/shared/gql'

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
    describe('videoDescriptionCreate', () => {
      const CREATE_VIDEO_DESCRIPTION_MUTATION = graphql(`
        mutation CreateVideoDescription($input: VideoTranslationCreateInput!) {
          videoDescriptionCreate(input: $input) {
            id
          }
        }
      `)

      it('should create video description', async () => {
        prismaMock.$transaction.mockImplementation(async (arg: any) => {
          if (typeof arg === 'function') return arg(prismaMock)
          return Promise.all(arg as any[])
        })
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
          languageId: 'languageId',
          crowdInId: null
        })
        prismaMock.videoDescription.update.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId',
          crowdInId: null
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
        expect(result).toHaveProperty('data.videoDescriptionCreate', {
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

    describe('videoDescriptionUpdate', () => {
      const UPDATE_VIDEO_DESCRIPTION_MUTATION = graphql(`
        mutation UpdateVideoDescription($input: VideoTranslationUpdateInput!) {
          videoDescriptionUpdate(input: $input) {
            id
          }
        }
      `)

      it('should update video description', async () => {
        prismaMock.$transaction.mockImplementation(async (arg: any) => {
          if (typeof arg === 'function') return arg(prismaMock)
          return Promise.all(arg as any[])
        })
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoDescription.findUnique.mockResolvedValue({
          videoId: 'videoId',
          crowdInId: null
        } as any)
        prismaMock.videoDescription.update.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId',
          crowdInId: null
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
        expect(result).toHaveProperty('data.videoDescriptionUpdate', {
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

    describe('videoDescriptionDelete', () => {
      const DELETE_VIDEO_DESCRIPTION_MUTATION = graphql(`
        mutation DeleteVideoDescription($id: ID!) {
          videoDescriptionDelete(id: $id) {
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
          languageId: 'languageId',
          crowdInId: null
        })
        const result = await authClient({
          document: DELETE_VIDEO_DESCRIPTION_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(result).toHaveProperty('data.videoDescriptionDelete', {
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
