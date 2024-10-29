import { graphql } from 'gql.tada'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

jest.mock('./service', () => ({
  createVideoByDirectUpload: jest.fn().mockResolvedValue({
    id: 'videoId',
    uploadUrl: 'https://example.com/video.mp4'
  }),
  createVideoFromUrl: jest.fn().mockResolvedValue({
    id: 'videoId'
  }),
  getVideo: jest.fn().mockResolvedValue({
    id: 'videoId',
    status: 'ready'
  }),
  deleteVideo: jest.fn().mockResolvedValue({
    id: 'videoId'
  })
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

  describe('queries', () => {
    describe('getMyMuxVideos', () => {
      const GET_MY_MUX_VIDEOS = graphql(`
        query GetMyMuxVideos {
          getMyMuxVideos {
            id
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
        prismaMock.muxVideo.findMany.mockResolvedValue([
          {
            id: 'videoId',
            name: 'videoName',
            uploadUrl: 'https://example.com/video.mp4',
            userId: 'userId',
            createdAt: new Date(),
            readyToStream: true,
            downloadable: false,
            updatedAt: new Date()
          }
        ])
        const data = await authClient({
          document: GET_MY_MUX_VIDEOS
        })
        expect(data).toHaveProperty('data.getMyMuxVideos', [
          {
            id: 'videoId',
            uploadUrl: 'https://example.com/video.mp4',
            userId: 'userId',
            readyToStream: true
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
  })

  describe('mutations', () => {
    describe('createMuxVideoUploadByFile', () => {
      const CREATE_MUX_VIDEO_UPLOAD_BY_FILE = graphql(`
        mutation CreateMuxVideoUploadByFile($name: String!) {
          createMuxVideoUploadByFile(name: $name) {
            id
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
            id: 'videoId',
            name: 'videoName',
            uploadUrl: 'https://example.com/video.mp4',
            userId: 'testUserId'
          }
        })
        expect(result).toHaveProperty('data.createMuxVideoUploadByFile', {
          id: 'videoId',
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
            id: 'videoId',
            userId: 'testUserId'
          }
        })
        expect(result).toHaveProperty('data.createMuxVideoUploadByUrl', {
          id: 'videoId',
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

      it('should return true', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'userId',
          userId: 'userId',
          roles: ['publisher']
        })
        prismaMock.muxVideo.delete.mockResolvedValue({
          id: 'videoId',
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
        expect(prismaMock.muxVideo.delete).toHaveBeenCalledWith({
          where: { id: 'videoId' }
        })
        expect(result).toHaveProperty('data.deleteMuxVideo', true)
      })
    })
  })
})
