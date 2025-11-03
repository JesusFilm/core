import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

describe('videoTitle', () => {
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
    describe('videoTitleCreate', () => {
      const CREATE_VIDEO_TITLE_MUTATION = graphql(`
        mutation CreateVideoTitle($input: VideoTranslationCreateInput!) {
          videoTitleCreate(input: $input) {
            id
          }
        }
      `)

      it('should create video title', async () => {
        prismaMock.$transaction.mockImplementation(async (arg: any) => {
          if (typeof arg === 'function') return arg(prismaMock)
          return Promise.all(arg as any[])
        })
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoTitle.create.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId',
          crowdInId: null
        })
        prismaMock.videoTitle.update.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId',
          crowdInId: null
        })
        const result = await authClient({
          document: CREATE_VIDEO_TITLE_MUTATION,
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
        expect(prismaMock.videoTitle.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: {
              id: 'id',
              videoId: 'videoId',
              value: 'value',
              primary: true,
              languageId: 'languageId'
            }
          })
        )
        expect(result).toHaveProperty('data.videoTitleCreate', {
          id: 'id'
        })
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: CREATE_VIDEO_TITLE_MUTATION,
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

    describe('videoTitleUpdate', () => {
      const UPDATE_VIDEO_TITLE_MUTATION = graphql(`
        mutation UpdateVideoTitle($input: VideoTranslationUpdateInput!) {
          videoTitleUpdate(input: $input) {
            id
          }
        }
      `)

      it('should update video title', async () => {
        prismaMock.$transaction.mockImplementation(async (arg: any) => {
          if (typeof arg === 'function') return arg(prismaMock)
          return Promise.all(arg as any[])
        })
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoTitle.findUnique.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId',
          crowdInId: null
        } as any)
        prismaMock.videoTitle.update.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId',
          crowdInId: null
        })
        const result = await authClient({
          document: UPDATE_VIDEO_TITLE_MUTATION,
          variables: {
            input: {
              id: 'id',
              value: 'value',
              primary: true,
              languageId: 'languageId'
            }
          }
        })
        expect(prismaMock.videoTitle.update).toHaveBeenCalledWith({
          where: { id: 'id' },
          data: {
            value: 'value',
            primary: true,
            languageId: 'languageId'
          }
        })

        expect(result).toHaveProperty('data.videoTitleUpdate', {
          id: 'id'
        })
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: UPDATE_VIDEO_TITLE_MUTATION,
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

    describe('videoTitleDelete', () => {
      const DELETE_VIDEO_TITLE_MUTATION = graphql(`
        mutation DeleteVideoTitle($id: ID!) {
          videoTitleDelete(id: $id) {
            id
          }
        }
      `)

      it('should delete video title', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoTitle.delete.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId',
          crowdInId: null
        })
        const result = await authClient({
          document: DELETE_VIDEO_TITLE_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(prismaMock.videoTitle.delete).toHaveBeenCalledWith({
          where: { id: 'id' }
        })
        expect(result).toHaveProperty('data.videoTitleDelete', {
          id: 'id'
        })
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: DELETE_VIDEO_TITLE_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })
  })
})
