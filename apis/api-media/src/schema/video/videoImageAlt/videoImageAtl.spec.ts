import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

describe('videoImageAlt', () => {
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
    describe('videoImageAltCreate', () => {
      const CREATE_VIDEO_IMAGE_ALT_MUTATION = graphql(`
        mutation CreateVideoImageAlt($input: VideoTranslationCreateInput!) {
          videoImageAltCreate(input: $input) {
            id
          }
        }
      `)

      it('should create video image alt', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoImageAlt.create.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId'
        })
        const result = await authClient({
          document: CREATE_VIDEO_IMAGE_ALT_MUTATION,
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
        expect(result).toHaveProperty('data.videoImageAltCreate', {
          id: 'id'
        })
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: CREATE_VIDEO_IMAGE_ALT_MUTATION,
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

    describe('videoImageAltUpdate', () => {
      const UPDATE_VIDEO_IMAGE_ALT_MUTATION = graphql(`
        mutation UpdateVideoImageAlt($input: VideoTranslationUpdateInput!) {
          videoImageAltUpdate(input: $input) {
            id
          }
        }
      `)

      it('should update video image alt', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoImageAlt.update.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId'
        })
        const result = await authClient({
          document: UPDATE_VIDEO_IMAGE_ALT_MUTATION,
          variables: {
            input: {
              id: 'id',
              value: 'value',
              primary: true,
              languageId: 'languageId'
            }
          }
        })
        expect(result).toHaveProperty('data.videoImageAltUpdate', {
          id: 'id'
        })
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: UPDATE_VIDEO_IMAGE_ALT_MUTATION,
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

    describe('videoImageAltDelete', () => {
      const DELETE_VIDEO_IMAGE_ALT_MUTATION = graphql(`
        mutation DeleteVideoImageAlt($id: ID!) {
          videoImageAltDelete(id: $id) {
            id
          }
        }
      `)

      it('should delete video image alt', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoImageAlt.delete.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          value: 'value',
          primary: true,
          languageId: 'languageId'
        })
        const result = await authClient({
          document: DELETE_VIDEO_IMAGE_ALT_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(result).toHaveProperty('data.videoImageAltDelete', {
          id: 'id'
        })
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: DELETE_VIDEO_IMAGE_ALT_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })
  })
})
