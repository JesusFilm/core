import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

describe('videoSubtitle', () => {
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
    describe('videoSubtitleCreate', () => {
      const CREATE_VIDEO_SUBTITLE_MUTATION = graphql(`
        mutation CreateVideoSubtitle($input: VideoSubtitleCreateInput!) {
          videoSubtitleCreate(input: $input) {
            id
          }
        }
      `)

      it('should create video subtitle', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoSubtitle.create.mockResolvedValue({
          id: 'id',
          edition: 'edition',
          videoId: 'videoId',
          vttSrc: 'vttSrc',
          srtSrc: 'srtSrc',
          primary: true,
          languageId: 'languageId',
          vttAssetId: null,
          vttVersion: 1,
          srtAssetId: null,
          srtVersion: 1
        })
        const result = await authClient({
          document: CREATE_VIDEO_SUBTITLE_MUTATION,
          variables: {
            input: {
              id: 'id',
              edition: 'edition',
              videoId: 'videoId',
              vttSrc: 'vttSrc',
              srtSrc: 'srtSrc',
              primary: true,
              languageId: '529'
            }
          }
        })
        expect(result).toHaveProperty('data.videoSubtitleCreate', {
          id: 'id'
        })
      })

      it('should reject if not publisher', async () => {
        const result = await client({
          document: CREATE_VIDEO_SUBTITLE_MUTATION,
          variables: {
            input: {
              id: 'id',
              edition: 'edition',
              videoId: 'videoId',
              vttSrc: 'vttSrc',
              srtSrc: 'srtSrc',
              primary: true,
              languageId: 'languageId'
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })

    describe('videoSubtitleDelete', () => {
      const DELETE_VIDEO_SUBTITLE_MUTATION = graphql(`
        mutation DeleteVideoSubtitle($id: ID!) {
          videoSubtitleDelete(id: $id) {
            id
          }
        }
      `)

      it('should delete video subtitle', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoSubtitle.delete.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          edition: 'edition',
          vttSrc: 'vttSrc',
          srtSrc: 'srtSrc',
          primary: true,
          languageId: 'languageId',
          vttAssetId: null,
          vttVersion: 1,
          srtAssetId: null,
          srtVersion: 1
        })
        const result = await authClient({
          document: DELETE_VIDEO_SUBTITLE_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(prismaMock.videoSubtitle.delete).toHaveBeenCalledWith({
          where: { id: 'id' }
        })
        expect(result).toHaveProperty('data.videoSubtitleDelete', {
          id: 'id'
        })
      })

      it('should throw if not publisher', async () => {
        const result = await authClient({
          document: DELETE_VIDEO_SUBTITLE_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })

    describe('videoSubtitleUpdate', () => {
      const UPDATE_VIDEO_SUBTITLE_MUTATION = graphql(`
        mutation UpdateVideoSubtitle($input: VideoSubtitleUpdateInput!) {
          videoSubtitleUpdate(input: $input) {
            id
          }
        }
      `)

      it('should update video subtitle', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoSubtitle.update.mockResolvedValue({
          id: 'id',
          videoId: 'videoId',
          edition: 'edition',
          vttSrc: 'vttSrc',
          srtSrc: 'srtSrc',
          primary: true,
          languageId: 'languageId',
          vttAssetId: null,
          vttVersion: 1,
          srtAssetId: null,
          srtVersion: 1
        })
        const result = await authClient({
          document: UPDATE_VIDEO_SUBTITLE_MUTATION,
          variables: {
            input: {
              id: 'id',
              edition: 'edition',
              vttSrc: 'vttSrc',
              srtSrc: 'srtSrc',
              primary: true,
              languageId: 'languageId'
            }
          }
        })
        expect(prismaMock.videoSubtitle.update).toHaveBeenCalledWith({
          where: { id: 'id' },
          data: {
            edition: 'edition',
            vttSrc: 'vttSrc',
            srtSrc: 'srtSrc',
            primary: true,
            languageId: 'languageId'
          }
        })
        expect(result).toHaveProperty('data.videoSubtitleUpdate', {
          id: 'id'
        })
      })

      it('should throw if not publisher', async () => {
        const result = await authClient({
          document: UPDATE_VIDEO_SUBTITLE_MUTATION,
          variables: {
            input: {
              id: 'id',
              edition: 'edition',
              vttSrc: 'vttSrc',
              srtSrc: 'srtSrc',
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
