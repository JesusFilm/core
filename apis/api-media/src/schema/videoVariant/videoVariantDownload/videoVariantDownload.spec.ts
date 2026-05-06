import { VideoVariantDownloadQuality } from '@core/prisma/media/client'
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

  describe('queries', () => {
    describe('videoVariantDownloads', () => {
      const VIDEO_VARIANT_DOWNLOADS_QUERY = graphql(`
        query VideoVariantDownloads {
          videoVariantDownloads {
            id
            quality
            size
            height
            width
            bitrate
            url
          }
        }
      `)

      it('should return video variant downloads', async () => {
        prismaMock.videoVariantDownload.findMany.mockResolvedValue([
          {
            id: 'downloadId',
            videoVariantId: 'variantId',
            quality: VideoVariantDownloadQuality.high,
            size: 1024,
            height: 720,
            width: 1280,
            bitrate: 2000,
            url: 'https://example.com/video.mp4',
            assetId: null,
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ])
        const result = await client({ document: VIDEO_VARIANT_DOWNLOADS_QUERY })
        expect(
          prismaMock.videoVariantDownload.findMany
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              updatedAt: undefined,
              videoVariantId: undefined,
              quality: undefined
            },
            skip: 0,
            take: 100,
            orderBy: [{ updatedAt: 'asc' }, { id: 'asc' }]
          })
        )
        expect(result).toHaveProperty('data.videoVariantDownloads', [
          {
            id: 'downloadId',
            quality: VideoVariantDownloadQuality.high,
            size: 1024,
            height: 720,
            width: 1280,
            bitrate: 2000,
            url: 'https://example.com/video.mp4'
          }
        ])
      })

      it('should filter by videoVariantId', async () => {
        const FILTERED_QUERY = graphql(`
          query VideoVariantDownloadsFiltered {
            videoVariantDownloads(where: { videoVariantId: "specificVariantId" }) {
              id
            }
          }
        `)
        prismaMock.videoVariantDownload.findMany.mockResolvedValue([])
        await client({ document: FILTERED_QUERY })
        expect(
          prismaMock.videoVariantDownload.findMany
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              videoVariantId: 'specificVariantId'
            })
          })
        )
      })
    })

    describe('videoVariantDownloadsCount', () => {
      const VIDEO_VARIANT_DOWNLOADS_COUNT_QUERY = graphql(`
        query VideoVariantDownloadsCount {
          videoVariantDownloadsCount
        }
      `)

      it('should return video variant downloads count', async () => {
        prismaMock.videoVariantDownload.count.mockResolvedValue(7)
        const result = await client({
          document: VIDEO_VARIANT_DOWNLOADS_COUNT_QUERY
        })
        expect(prismaMock.videoVariantDownload.count).toHaveBeenCalledWith({
          where: {
            updatedAt: undefined,
            videoVariantId: undefined,
            quality: undefined
          }
        })
        expect(result).toHaveProperty('data.videoVariantDownloadsCount', 7)
      })
    })
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
          roles: ['publisher'],
          createdAt: new Date(),
          updatedAt: new Date()
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
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date()
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
          roles: ['publisher'],
          createdAt: new Date(),
          updatedAt: new Date()
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
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date()
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
          roles: ['publisher'],
          createdAt: new Date(),
          updatedAt: new Date()
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
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date()
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
