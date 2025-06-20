import { graphql } from 'gql.tada'

import { VideoVariantDownloadQuality } from '.prisma/api-media-client'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { getStaticRenditions } from '../../mux/video/service'

// Mock the getStaticRenditions service
jest.mock('../../mux/video/service', () => ({
  getStaticRenditions: jest.fn()
}))

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

    describe('updateVideoVariantDownloadSizesFromMux', () => {
      const UPDATE_VIDEO_VARIANT_DOWNLOAD_SIZES_FROM_MUX_MUTATION = graphql(`
        mutation UpdateVideoVariantDownloadSizesFromMux($videoVariantId: ID!) {
          updateVideoVariantDownloadSizesFromMux(
            videoVariantId: $videoVariantId
          )
        }
      `)

      beforeEach(() => {
        jest.clearAllMocks()
      })

      it('should update download sizes from Mux static renditions', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })

        // Mock video variant with mux video and downloads
        prismaMock.videoVariant.findUniqueOrThrow.mockResolvedValue({
          id: 'videoVariantId',
          muxVideo: {
            assetId: 'mux-asset-id'
          },
          downloads: [
            {
              id: 'download-1',
              quality: 'high',
              size: 0
            },
            {
              id: 'download-2',
              quality: 'sd',
              size: 0
            },
            {
              id: 'download-3',
              quality: 'low',
              size: 0
            }
          ]
        } as any)

        // Mock Mux static renditions response
        ;(getStaticRenditions as jest.Mock).mockResolvedValue({
          files: [
            {
              resolution: '720p',
              filesize: '157286400',
              status: 'ready'
            },
            {
              resolution: '360p',
              filesize: '52428800',
              status: 'ready'
            },
            {
              resolution: '270p',
              filesize: '26214400',
              status: 'ready'
            }
          ]
        })

        // Mock the update calls
        prismaMock.videoVariantDownload.update.mockResolvedValue({} as any)

        const result = await authClient({
          document: UPDATE_VIDEO_VARIANT_DOWNLOAD_SIZES_FROM_MUX_MUTATION,
          variables: {
            videoVariantId: 'videoVariantId'
          }
        })

        // Verify the service was called correctly
        expect(getStaticRenditions).toHaveBeenCalledWith('mux-asset-id', false)

        // Verify database updates for each quality level
        expect(prismaMock.videoVariantDownload.update).toHaveBeenCalledWith({
          where: { id: 'download-1' },
          data: { size: 157286400 }
        })
        expect(prismaMock.videoVariantDownload.update).toHaveBeenCalledWith({
          where: { id: 'download-2' },
          data: { size: 52428800 }
        })
        expect(prismaMock.videoVariantDownload.update).toHaveBeenCalledWith({
          where: { id: 'download-3' },
          data: { size: 26214400 }
        })

        expect(result).toHaveProperty(
          'data.updateVideoVariantDownloadSizesFromMux',
          true
        )
      })

      it('should handle files with resolution_tier property', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })

        prismaMock.videoVariant.findUniqueOrThrow.mockResolvedValue({
          id: 'videoVariantId',
          muxVideo: {
            assetId: 'mux-asset-id'
          },
          downloads: [
            {
              id: 'download-1',
              quality: 'high',
              size: 0
            }
          ]
        } as any)

        // Mock Mux response with resolution_tier instead of resolution
        ;(getStaticRenditions as jest.Mock).mockResolvedValue({
          files: [
            {
              resolution_tier: '720p',
              filesize: '157286400',
              status: 'ready'
            }
          ]
        })

        prismaMock.videoVariantDownload.update.mockResolvedValue({} as any)

        const result = await authClient({
          document: UPDATE_VIDEO_VARIANT_DOWNLOAD_SIZES_FROM_MUX_MUTATION,
          variables: {
            videoVariantId: 'videoVariantId'
          }
        })

        expect(prismaMock.videoVariantDownload.update).toHaveBeenCalledWith({
          where: { id: 'download-1' },
          data: { size: 157286400 }
        })

        expect(result).toHaveProperty(
          'data.updateVideoVariantDownloadSizesFromMux',
          true
        )
      })

      it('should skip files that are not ready', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })

        prismaMock.videoVariant.findUniqueOrThrow.mockResolvedValue({
          id: 'videoVariantId',
          muxVideo: {
            assetId: 'mux-asset-id'
          },
          downloads: [
            {
              id: 'download-1',
              quality: 'high',
              size: 0
            }
          ]
        } as any)
        ;(getStaticRenditions as jest.Mock).mockResolvedValue({
          files: [
            {
              resolution: '720p',
              filesize: '157286400',
              status: 'preparing'
            }
          ]
        })

        const result = await authClient({
          document: UPDATE_VIDEO_VARIANT_DOWNLOAD_SIZES_FROM_MUX_MUTATION,
          variables: {
            videoVariantId: 'videoVariantId'
          }
        })

        // Should not update since status is not 'ready'
        expect(prismaMock.videoVariantDownload.update).not.toHaveBeenCalled()
        expect(result).toHaveProperty(
          'data.updateVideoVariantDownloadSizesFromMux',
          true
        )
      })

      it('should skip files without filesize', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })

        prismaMock.videoVariant.findUniqueOrThrow.mockResolvedValue({
          id: 'videoVariantId',
          muxVideo: {
            assetId: 'mux-asset-id'
          },
          downloads: [
            {
              id: 'download-1',
              quality: 'high',
              size: 0
            }
          ]
        } as any)
        ;(getStaticRenditions as jest.Mock).mockResolvedValue({
          files: [
            {
              resolution: '720p',
              status: 'ready'
              // Missing filesize property
            }
          ]
        })

        const result = await authClient({
          document: UPDATE_VIDEO_VARIANT_DOWNLOAD_SIZES_FROM_MUX_MUTATION,
          variables: {
            videoVariantId: 'videoVariantId'
          }
        })

        // Should not update since filesize is missing
        expect(prismaMock.videoVariantDownload.update).not.toHaveBeenCalled()
        expect(result).toHaveProperty(
          'data.updateVideoVariantDownloadSizesFromMux',
          true
        )
      })

      it('should throw error when video variant has no Mux asset', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })

        prismaMock.videoVariant.findUniqueOrThrow.mockResolvedValue({
          id: 'videoVariantId',
          muxVideo: null,
          downloads: []
        } as any)

        const result = (await authClient({
          document: UPDATE_VIDEO_VARIANT_DOWNLOAD_SIZES_FROM_MUX_MUTATION,
          variables: {
            videoVariantId: 'videoVariantId'
          }
        })) as {
          data: any
          errors?: { message: string }[]
        }

        expect(result.errors).toBeDefined()
        expect(result.errors?.[0]?.message).toBe(
          'No Mux asset found for this video variant'
        )
      })

      it('should throw error when no static renditions found', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })

        prismaMock.videoVariant.findUniqueOrThrow.mockResolvedValue({
          id: 'videoVariantId',
          muxVideo: {
            assetId: 'mux-asset-id'
          },
          downloads: []
        } as any)
        ;(getStaticRenditions as jest.Mock).mockResolvedValue({
          files: null
        })

        const result = (await authClient({
          document: UPDATE_VIDEO_VARIANT_DOWNLOAD_SIZES_FROM_MUX_MUTATION,
          variables: {
            videoVariantId: 'videoVariantId'
          }
        })) as {
          data: any
          errors?: { message: string }[]
        }

        expect(result.errors).toBeDefined()
        expect(result.errors?.[0]?.message).toBe('No static renditions found')
      })

      it('should throw error when static renditions is null', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })

        prismaMock.videoVariant.findUniqueOrThrow.mockResolvedValue({
          id: 'videoVariantId',
          muxVideo: {
            assetId: 'mux-asset-id'
          },
          downloads: []
        } as any)
        ;(getStaticRenditions as jest.Mock).mockResolvedValue(null)

        const result = (await authClient({
          document: UPDATE_VIDEO_VARIANT_DOWNLOAD_SIZES_FROM_MUX_MUTATION,
          variables: {
            videoVariantId: 'videoVariantId'
          }
        })) as {
          data: any
          errors?: { message: string }[]
        }

        expect(result.errors).toBeDefined()
        expect(result.errors?.[0]?.message).toBe('No static renditions found')
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: UPDATE_VIDEO_VARIANT_DOWNLOAD_SIZES_FROM_MUX_MUTATION,
          variables: {
            videoVariantId: 'videoVariantId'
          }
        })

        expect(result).toHaveProperty('data', null)
      })
    })
  })
})
