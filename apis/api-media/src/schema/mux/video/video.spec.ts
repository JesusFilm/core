import { graphql } from 'gql.tada'

import { MuxVideo } from '.prisma/api-media-client'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

import { enableDownload } from './service'

// Mock the processVideoDownloads queue

jest.mock('./service', () => ({
  createVideoByDirectUpload: jest.fn().mockResolvedValue({
    id: 'uploadId',
    uploadUrl: 'https://example.com/video.mp4'
  }),
  createVideoFromUrl: jest.fn().mockResolvedValue({
    id: 'assetId'
  }),
  getVideo: jest.fn().mockResolvedValue({
    id: 'assetId',
    status: 'ready',
    playback_ids: [{ id: 'playbackId' }],
    duration: 10
  }),
  deleteVideo: jest.fn().mockResolvedValue({
    id: 'assetId'
  }),
  enableDownload: jest.fn().mockResolvedValue(undefined),
  getUpload: jest.fn().mockResolvedValue({
    asset_id: 'assetId'
  })
}))

jest.mock('../../../workers/processVideoDownloads/queue', () => ({
  queue: {
    add: jest.fn().mockResolvedValue({ id: 'job-id' })
  }
}))

describe('mux/video', () => {
  const client = getClient()
  const authClient = getClient({
    headers: {
      authorization: 'token'
    },
    context: {
      currentUser: {
        id: 'userId'
      }
    }
  })
  const publisherClient = getClient({
    headers: {
      authorization: 'token'
    },
    context: {
      currentRoles: ['publisher'],
      currentUser: {
        id: 'userId'
      }
    }
  })

  beforeEach(() => {
    jest.clearAllMocks()
    const { queue } = jest.requireMock(
      '../../../workers/processVideoDownloads/queue'
    )
    queue.add.mockResolvedValue({ id: 'job-id' })
  })

  describe('queries', () => {
    describe('getMyMuxVideos', () => {
      const GET_MY_MUX_VIDEOS = graphql(`
        query GetMyMuxVideos($offset: Int, $limit: Int) {
          getMyMuxVideos(offset: $offset, limit: $limit) {
            id
            playbackId
            uploadUrl
            userId
            readyToStream
            videoVariants {
              id
            }
          }
        }
      `)

      it('should return video', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.muxVideo.findMany.mockResolvedValue([
          {
            id: 'videoId',
            playbackId: 'playbackId',
            uploadId: 'uploadId',
            assetId: 'assetId',
            duration: 10,
            name: 'videoName',
            uploadUrl: 'https://example.com/video.mp4',
            userId: 'userId',
            createdAt: new Date(),
            readyToStream: true,
            downloadable: false,
            updatedAt: new Date(),
            videoVariants: []
          } as unknown as MuxVideo
        ])
        const data = await authClient({
          document: GET_MY_MUX_VIDEOS,
          variables: {
            offset: 0,
            limit: 10
          }
        })
        expect(data).toHaveProperty('data.getMyMuxVideos', [
          {
            id: 'videoId',
            playbackId: 'playbackId',
            uploadUrl: 'https://example.com/video.mp4',
            userId: 'userId',
            readyToStream: true,
            videoVariants: []
          }
        ])
      })

      it('should return null when not authorized', async () => {
        const data = await client({
          document: GET_MY_MUX_VIDEOS,
          variables: {
            offset: 0,
            limit: 10
          }
        })
        expect(data).toHaveProperty('data', null)
      })
    })

    describe('getMyMuxVideo', () => {
      const GET_MY_MUX_VIDEO = graphql(`
        query GetMyMuxVideo($id: ID!, $userGenerated: Boolean) {
          getMyMuxVideo(id: $id, userGenerated: $userGenerated) {
            id
            playbackId
            uploadUrl
            userId
            readyToStream
          }
        }
      `)

      it('should return video', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.muxVideo.findFirstOrThrow.mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'userId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: false,
          updatedAt: new Date()
        })
        const data = await authClient({
          document: GET_MY_MUX_VIDEO,
          variables: {
            id: 'videoId',
            userGenerated: true
          }
        })
        expect(data).toHaveProperty('data.getMyMuxVideo', {
          id: 'videoId',
          playbackId: 'playbackId',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'userId',
          readyToStream: true
        })
      })

      it('should return null when not authorized', async () => {
        const data = await client({
          document: GET_MY_MUX_VIDEO,
          variables: {
            id: 'videoId',
            userGenerated: true
          }
        })
        expect(data).toHaveProperty('data', null)
      })

      it('should queue download processing when video is downloadable and ready', async () => {
        const { getVideo } = jest.requireMock('./service')

        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })

        // First call returns video without playbackId to trigger getVideo call
        prismaMock.muxVideo.findFirstOrThrow.mockResolvedValue({
          id: 'videoId',
          playbackId: null,
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'userId',
          createdAt: new Date(),
          readyToStream: false,
          downloadable: true,
          updatedAt: new Date()
        })

        // Mock the updated video after getVideo call
        prismaMock.muxVideo.update.mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'userId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: true,
          updatedAt: new Date()
        })

        const data = await authClient({
          document: GET_MY_MUX_VIDEO,
          variables: {
            id: 'videoId',
            userGenerated: false
          }
        })

        expect(getVideo).toHaveBeenCalledWith('assetId', false)
        expect(prismaMock.muxVideo.update).toHaveBeenCalledWith({
          where: { id: 'videoId' },
          data: {
            readyToStream: true,
            playbackId: 'playbackId',
            duration: 10
          }
        })
        const { queue } = jest.requireMock(
          '../../../workers/processVideoDownloads/queue'
        )
        expect(queue.add).toHaveBeenCalledWith('process-video-downloads', {
          videoId: 'videoId',
          assetId: 'assetId',
          isUserGenerated: false
        })
        expect(data).toHaveProperty('data.getMyMuxVideo.readyToStream', true)
      })

      it('should not queue download processing when video is not downloadable', async () => {
        const { getVideo } = jest.requireMock('./service')

        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })

        prismaMock.muxVideo.findFirstOrThrow.mockResolvedValue({
          id: 'videoId',
          playbackId: null,
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'userId',
          createdAt: new Date(),
          readyToStream: false,
          downloadable: false, // Not downloadable
          updatedAt: new Date()
        })

        prismaMock.muxVideo.update.mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'userId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: false,
          updatedAt: new Date()
        })

        await authClient({
          document: GET_MY_MUX_VIDEO,
          variables: {
            id: 'videoId',
            userGenerated: false
          }
        })

        expect(getVideo).toHaveBeenCalledWith('assetId', false)
        expect(prismaMock.muxVideo.update).toHaveBeenCalled()
        const { queue } = jest.requireMock(
          '../../../workers/processVideoDownloads/queue'
        )
        expect(queue.add).not.toHaveBeenCalled()
      })

      it('should handle queue errors gracefully', async () => {
        const { getVideo } = jest.requireMock('./service')
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })

        prismaMock.muxVideo.findFirstOrThrow.mockResolvedValue({
          id: 'videoId',
          playbackId: null,
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'userId',
          createdAt: new Date(),
          readyToStream: false,
          downloadable: true,
          updatedAt: new Date()
        })

        prismaMock.muxVideo.update.mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'userId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: true,
          updatedAt: new Date()
        })

        // Mock queue to throw error
        const { queue } = jest.requireMock(
          '../../../workers/processVideoDownloads/queue'
        )
        queue.add.mockRejectedValueOnce(new Error('Queue connection failed'))

        const data = await authClient({
          document: GET_MY_MUX_VIDEO,
          variables: {
            id: 'videoId',
            userGenerated: false
          }
        })

        expect(queue.add).toHaveBeenCalledWith('process-video-downloads', {
          videoId: 'videoId',
          assetId: 'assetId',
          isUserGenerated: false
        })
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to queue video downloads processing:',
          expect.any(Error)
        )
        // Should still return the video even if queue fails
        expect(data).toHaveProperty('data.getMyMuxVideo.readyToStream', true)

        consoleSpy.mockRestore()
      })
    })

    describe('getMuxVideo', () => {
      const GET_MUX_VIDEO = graphql(`
        query GetMuxVideo($id: ID!, $userGenerated: Boolean) {
          getMuxVideo(id: $id, userGenerated: $userGenerated) {
            id
            playbackId
            uploadUrl
            userId
            readyToStream
          }
        }
      `)

      it('should return video', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.muxVideo.findFirstOrThrow.mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'userId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: false,
          updatedAt: new Date()
        })
        const data = await client({
          document: GET_MUX_VIDEO,
          variables: {
            id: 'videoId',
            userGenerated: false
          }
        })
        expect(data).toHaveProperty('data.getMuxVideo', {
          id: 'videoId',
          playbackId: 'playbackId',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'userId',
          readyToStream: true
        })
      })
    })
  })

  describe('mutations', () => {
    describe('createMuxVideoUploadByFile', () => {
      const CREATE_MUX_VIDEO_UPLOAD_BY_FILE = graphql(`
        mutation CreateMuxVideoUploadByFile(
          $name: String!
          $userGenerated: Boolean
        ) {
          createMuxVideoUploadByFile(
            name: $name
            userGenerated: $userGenerated
          ) {
            id
            playbackId
            uploadUrl
            userId
            readyToStream
          }
        }
      `)

      it('should create a new video', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.muxVideo.create.mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'testUserId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: false,
          updatedAt: new Date()
        })
        const result = await authClient({
          document: CREATE_MUX_VIDEO_UPLOAD_BY_FILE,
          variables: {
            name: 'videoName',
            userGenerated: true
          }
        })
        expect(prismaMock.muxVideo.create).toHaveBeenCalledWith({
          data: {
            name: 'videoName',
            uploadUrl: 'https://example.com/video.mp4',
            uploadId: 'uploadId',
            userId: 'testUserId',
            downloadable: false
          }
        })
        expect(result).toHaveProperty('data.createMuxVideoUploadByFile', {
          id: 'videoId',
          playbackId: 'playbackId',
          uploadUrl: 'https://example.com/video.mp4',
          userId: 'testUserId',
          readyToStream: true
        })
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: CREATE_MUX_VIDEO_UPLOAD_BY_FILE,
          variables: {
            name: 'videoName',
            userGenerated: true
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })

    describe('createMuxVideoUploadByUrl', () => {
      const CREATE_MUX_VIDEO_UPLOAD_BY_URL = graphql(`
        mutation CreateMuxVideoUploadByUrl(
          $url: String!
          $userGenerated: Boolean
        ) {
          createMuxVideoUploadByUrl(url: $url, userGenerated: $userGenerated) {
            id
            playbackId
            uploadUrl
            userId
            readyToStream
          }
        }
      `)

      it('should return video', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.muxVideo.create.mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: null,
          userId: 'testUserId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: false,
          updatedAt: new Date()
        })
        const result = await authClient({
          document: CREATE_MUX_VIDEO_UPLOAD_BY_URL,
          variables: {
            url: 'https://example.com/video.mp4',
            userGenerated: true
          }
        })
        expect(prismaMock.muxVideo.create).toHaveBeenCalledWith({
          data: {
            assetId: 'assetId',
            userId: 'testUserId',
            downloadable: false
          }
        })
        expect(result).toHaveProperty('data.createMuxVideoUploadByUrl', {
          id: 'videoId',
          playbackId: 'playbackId',
          uploadUrl: null,
          userId: 'testUserId',
          readyToStream: true
        })
      })

      it('should fail if not publisher', async () => {
        const result = await client({
          document: CREATE_MUX_VIDEO_UPLOAD_BY_URL,
          variables: {
            url: 'https://example.com/video.mp4',
            userGenerated: true
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })

    describe('deleteMuxVideo', () => {
      const DELETE_MUX_VIDEO = graphql(`
        mutation DeleteMuxVideo($id: ID!, $userGenerated: Boolean) {
          deleteMuxVideo(id: $id, userGenerated: $userGenerated)
        }
      `)

      it('should return true IF publisher', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.muxVideo.delete.mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: null,
          userId: 'testUserId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: false,
          updatedAt: new Date()
        })
        const result = await authClient({
          document: DELETE_MUX_VIDEO,
          variables: {
            id: 'videoId',
            userGenerated: false
          }
        })
        expect(prismaMock.muxVideo.findUniqueOrThrow).toHaveBeenCalledWith({
          where: { id: 'videoId' }
        })
        expect(prismaMock.muxVideo.delete).toHaveBeenCalledWith({
          where: { id: 'videoId' }
        })
        expect(result).toHaveProperty('data.deleteMuxVideo', true)
      })

      it('should return true if not publisher', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'testUserId',
          userId: 'userId',
          roles: []
        })
        prismaMock.muxVideo.delete.mockResolvedValue({
          id: 'videoId',
          name: 'videoName',
          uploadUrl: null,
          uploadId: 'uploadId',
          playbackId: 'playbackId',
          assetId: 'assetId',
          duration: 10,
          userId: 'testUserId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: false,
          updatedAt: new Date()
        })
        const result = await authClient({
          document: DELETE_MUX_VIDEO,
          variables: {
            id: 'videoId',
            userGenerated: true
          }
        })
        expect(prismaMock.muxVideo.findUniqueOrThrow).toHaveBeenCalledWith({
          where: { id: 'videoId', userId: 'testUserId' }
        })
        expect(prismaMock.muxVideo.delete).toHaveBeenCalledWith({
          where: { id: 'videoId' }
        })
        expect(result).toHaveProperty('data.deleteMuxVideo', true)
      })
    })

    describe('enableMuxDownload', () => {
      const ENABLE_MUX_DOWNLOAD = graphql(`
        mutation EnableMuxDownload($id: ID!, $resolution: String) {
          enableMuxDownload(id: $id, resolution: $resolution) {
            id
            downloadable
          }
        }
      `)

      it('should enable download for a video with default resolution', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.muxVideo.findUniqueOrThrow.mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: null,
          userId: 'testUserId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: false,
          updatedAt: new Date()
        })
        prismaMock.muxVideo.update.mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: null,
          userId: 'testUserId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: true,
          updatedAt: new Date()
        })
        const result = await publisherClient({
          document: ENABLE_MUX_DOWNLOAD,
          variables: {
            id: 'videoId'
          }
        })

        expect(enableDownload).toHaveBeenCalledWith('assetId', false, '1080p')

        // Check that the database was updated
        expect(prismaMock.muxVideo.update).toHaveBeenCalledWith({
          where: { id: 'videoId' },
          data: {
            downloadable: true
          }
        })

        // Check the response
        expect(result).toHaveProperty('data.enableMuxDownload', {
          id: 'videoId',
          downloadable: true
        })
      })

      it('should enable download for a video with custom resolution', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.muxVideo.findUniqueOrThrow.mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: null,
          userId: 'testUserId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: false,
          updatedAt: new Date()
        })
        prismaMock.muxVideo.update.mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: null,
          userId: 'testUserId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: true,
          updatedAt: new Date()
        })
        const result = await publisherClient({
          document: ENABLE_MUX_DOWNLOAD,
          variables: {
            id: 'videoId',
            resolution: '720p'
          }
        })

        expect(enableDownload).toHaveBeenCalledWith('assetId', false, '720p')

        // Check that the database was updated
        expect(prismaMock.muxVideo.update).toHaveBeenCalledWith({
          where: { id: 'videoId' },
          data: {
            downloadable: true
          }
        })

        // Check the response
        expect(result).toHaveProperty('data.enableMuxDownload', {
          id: 'videoId',
          downloadable: true
        })
      })

      it('should throw an error for invalid resolution', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.muxVideo.findUniqueOrThrow.mockResolvedValue({
          id: 'videoId',
          playbackId: 'playbackId',
          uploadId: 'uploadId',
          assetId: 'assetId',
          duration: 10,
          name: 'videoName',
          uploadUrl: null,
          userId: 'testUserId',
          createdAt: new Date(),
          readyToStream: true,
          downloadable: false,
          updatedAt: new Date()
        })

        const result = (await publisherClient({
          document: ENABLE_MUX_DOWNLOAD,
          variables: {
            id: 'videoId',
            resolution: 'invalid'
          }
        })) as {
          data: any
          errors?: { message: string; extensions?: { code: string } }[]
        }

        expect(result.errors).toBeDefined()
        expect(result.errors?.[0]?.message).toBe('Invalid resolution')
        expect(result.errors?.[0]?.extensions?.code).toBe('BAD_REQUEST')
      })

      it('should fail if not authenticated', async () => {
        const result = await client({
          document: ENABLE_MUX_DOWNLOAD,
          variables: {
            id: 'videoId'
          }
        })
        expect(result).toHaveProperty('data.enableMuxDownload', null)
      })
    })
  })

  describe('entity', () => {
    const MUX_VIDEO = graphql(`
      query MuxVideo {
        _entities(
          representations: [
            { __typename: "MuxVideo", id: "testId", primaryLanguageId: null }
          ]
        ) {
          ... on MuxVideo {
            id
          }
        }
      }
    `)

    it('should return mux video', async () => {
      prismaMock.muxVideo.findUniqueOrThrow.mockResolvedValue({
        id: 'testId',
        assetId: 'testAssetId',
        playbackId: 'testPlaybackId',
        uploadId: 'testUploadId',
        userId: 'testUserId',
        uploadUrl: 'testUrl',
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'testName',
        readyToStream: true,
        downloadable: false,
        duration: 10
      })
      const data = await client({
        document: MUX_VIDEO
      })
      expect(prismaMock.muxVideo.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'testId' }
      })
      expect(data).toHaveProperty('data._entities[0]', {
        id: 'testId'
      })
    })
  })
})
