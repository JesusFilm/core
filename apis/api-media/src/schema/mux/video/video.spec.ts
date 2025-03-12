import { graphql } from 'gql.tada'

import { MuxVideo } from '.prisma/api-media-client'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

// import { enableDownload } from './service'

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
    status: 'ready'
  }),
  deleteVideo: jest.fn().mockResolvedValue({
    id: 'assetId'
  }),
  enableDownload: jest.fn().mockResolvedValue(undefined)
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
      currentRoles: ['publisher']
    }
  })

  describe('queries', () => {
    describe('getMyMuxVideos', () => {
      const GET_MY_MUX_VIDEOS = graphql(`
        query GetMyMuxVideos {
          getMyMuxVideos {
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
          document: GET_MY_MUX_VIDEOS
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
          document: GET_MY_MUX_VIDEOS
        })
        expect(data).toHaveProperty('data', null)
      })
    })

    describe('getMyMuxVideo', () => {
      const GET_MY_MUX_VIDEO = graphql(`
        query GetMyMuxVideo($id: ID!) {
          getMyMuxVideo(id: $id) {
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
            id: 'videoId'
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
            id: 'videoId'
          }
        })
        expect(data).toHaveProperty('data', null)
      })
    })

    describe('getMuxVideo', () => {
      const GET_MUX_VIDEO = graphql(`
        query GetMuxVideo($id: ID!) {
          getMuxVideo(id: $id) {
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
            id: 'videoId'
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
        mutation CreateMuxVideoUploadByFile($name: String!) {
          createMuxVideoUploadByFile(name: $name) {
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
            name: 'videoName'
          }
        })
        expect(prismaMock.muxVideo.create).toHaveBeenCalledWith({
          data: {
            name: 'videoName',
            uploadUrl: 'https://example.com/video.mp4',
            uploadId: 'uploadId',
            userId: 'testUserId'
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
            name: 'videoName'
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })

    describe('createMuxVideoUploadByUrl', () => {
      const CREATE_MUX_VIDEO_UPLOAD_BY_URL = graphql(`
        mutation CreateMuxVideoUploadByUrl($url: String!) {
          createMuxVideoUploadByUrl(url: $url) {
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
            url: 'https://example.com/video.mp4'
          }
        })
        expect(prismaMock.muxVideo.create).toHaveBeenCalledWith({
          data: {
            assetId: 'assetId',
            userId: 'testUserId'
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
            url: 'https://example.com/video.mp4'
          }
        })
        expect(result).toHaveProperty('data', null)
      })
    })

    describe('deleteMuxVideo', () => {
      const DELETE_MUX_VIDEO = graphql(`
        mutation DeleteMuxVideo($id: ID!) {
          deleteMuxVideo(id: $id)
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
            id: 'videoId'
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
            id: 'videoId'
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
        mutation EnableMuxDownload($id: ID!) {
          enableMuxDownload(id: $id) {
            id
            downloadable
          }
        }
      `)

      it('should enable download for a video', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
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

        // expect(prismaMock.userMediaRole.findUnique).toHaveBeenCalled()
        // expect(enableDownload).toHaveBeenCalledWith('videoId')

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

      it('should fail if not authenticated', async () => {
        const result = await client({
          document: ENABLE_MUX_DOWNLOAD,
          variables: {
            id: 'videoId'
          }
        })
        expect(result).not.toHaveProperty('data')
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
