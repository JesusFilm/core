import { VideoVariantDownloadQuality } from '@core/prisma-media/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

describe('videoVariantDownload', () => {
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
    describe('videoVariantDownloadCreate', () => {
      const VIDEO_VARIANT_DOWNLOAD_CREATE_MUTATION = graphql(`
        mutation VideoVariantDownloadCreate(
          $input: VideoVariantDownloadCreateInput!
        ) {
          videoVariantDownloadCreate(input: $input) {
            id
          }
        }
      `)

      it('should create video variant download', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoVariantDownload.create.mockResolvedValue({
          id: 'id',
          videoVariantId: 'videoVariantId',
          quality: VideoVariantDownloadQuality.high,
          size: 1024,
          height: 1024,
          width: 1024,
          bitrate: 1024,
          url: 'url',
          assetId: null,
          version: 1
        })
        const result = await authClient({
          document: VIDEO_VARIANT_DOWNLOAD_CREATE_MUTATION,
          variables: {
            input: {
              id: 'id',
              videoVariantId: 'videoVariantId',
              quality: VideoVariantDownloadQuality.high,
              size: 1024,
              height: 1024,
              width: 1024,
              url: 'url'
            }
          }
        })
        expect(prismaMock.videoVariantDownload.create).toHaveBeenCalledWith({
          data: {
            id: 'id',
            videoVariantId: 'videoVariantId',
            quality: 'high',
            size: 1024,
            height: 1024,
            width: 1024,
            url: 'url'
          }
        })
        expect(result).toHaveProperty('data.videoVariantDownloadCreate', {
          id: 'id'
        })
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: VIDEO_VARIANT_DOWNLOAD_CREATE_MUTATION,
          variables: {
            input: {
              id: 'id',
              videoVariantId: 'videoVariantId',
              quality: VideoVariantDownloadQuality.high,
              size: 1024,
              height: 1024,
              width: 1024,
              url: 'url'
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })

    describe('videoVariantDownloadUpdate', () => {
      const VIDEO_VARIANT_DOWNLOAD_UPDATE_MUTATION = graphql(`
        mutation VideoVariantDownloadUpdate(
          $input: VideoVariantDownloadUpdateInput!
        ) {
          videoVariantDownloadUpdate(input: $input) {
            id
          }
        }
      `)

      it('should update video variant download', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoVariantDownload.update.mockResolvedValue({
          id: 'id',
          videoVariantId: 'videoVariantId',
          quality: VideoVariantDownloadQuality.low,
          size: 1024,
          height: 1024,
          width: 1024,
          bitrate: 1024,
          url: 'url',
          assetId: null,
          version: 1
        })
        const result = await authClient({
          document: VIDEO_VARIANT_DOWNLOAD_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'id',
              videoVariantId: 'videoVariantId',
              quality: VideoVariantDownloadQuality.low,
              size: 1024,
              height: 1024,
              width: 1024,
              url: 'url'
            }
          }
        })
        expect(prismaMock.videoVariantDownload.update).toHaveBeenCalledWith({
          where: { id: 'id' },
          data: {
            videoVariantId: 'videoVariantId',
            quality: 'low',
            size: 1024,
            height: 1024,
            width: 1024,
            url: 'url'
          }
        })
        expect(result).toHaveProperty('data.videoVariantDownloadUpdate', {
          id: 'id'
        })
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: VIDEO_VARIANT_DOWNLOAD_UPDATE_MUTATION,
          variables: {
            input: {
              id: 'id',
              videoVariantId: 'videoVariantId',
              quality: VideoVariantDownloadQuality.high,
              size: 1024,
              height: 1024,
              width: 1024,
              url: 'url'
            }
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })

    describe('videoVariantDownloadDelete', () => {
      const VIDEO_VARIANT_DOWNLOAD_DELETE_MUTATION = graphql(`
        mutation VideoVariantDownloadDelete($id: ID!) {
          videoVariantDownloadDelete(id: $id) {
            id
          }
        }
      `)

      it('should delete video variant download', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.videoVariantDownload.delete.mockResolvedValue({
          id: 'id',
          videoVariantId: 'videoVariantId',
          quality: VideoVariantDownloadQuality.high,
          size: 1024,
          height: 1024,
          width: 1024,
          bitrate: 1024,
          url: 'url',
          assetId: null,
          version: 1
        })
        const result = await authClient({
          document: VIDEO_VARIANT_DOWNLOAD_DELETE_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(prismaMock.videoVariantDownload.delete).toHaveBeenCalledWith({
          where: { id: 'id' }
        })
        expect(result).toHaveProperty('data.videoVariantDownloadDelete', {
          id: 'id'
        })
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: VIDEO_VARIANT_DOWNLOAD_DELETE_MUTATION,
          variables: {
            id: 'id'
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })
  })
})
