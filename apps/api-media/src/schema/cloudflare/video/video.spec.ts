import { Video } from 'cloudflare/resources/stream/stream'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

import {
  createVideoByDirectUpload,
  createVideoFromUrl,
  deleteVideo,
  getVideo
} from './service'

const mockCreateVideoByDirectUpload =
  createVideoByDirectUpload as jest.MockedFunction<
    typeof createVideoByDirectUpload
  >
const mockCreateVideoFromUrl = createVideoFromUrl as jest.MockedFunction<
  typeof createVideoFromUrl
>

const mockGetVideo = getVideo as jest.MockedFunction<typeof getVideo>

const mockDeleteVideo = deleteVideo as jest.MockedFunction<typeof deleteVideo>

jest.mock('./service', () => ({
  __esModule: true,
  createVideoByDirectUpload: jest.fn(),
  createVideoFromUrl: jest.fn(),
  getVideo: jest.fn(),
  deleteVideo: jest.fn()
}))

describe('cloudflareVideo', () => {
  const client = getClient()

  describe('queries', () => {
    describe('getMyCloudflareVideos', () => {
      const GET_MY_CLOUDFLARE_VIDEOS_QUERY = graphql(`
        query getMyCloudflareVideos($offset: Int, $limit: Int) {
          getMyCloudflareVideos(offset: $offset, limit: $limit) {
            id
            uploadUrl
            userId
            createdAt
            readyToStream
          }
        }
      `)

      it('should return cloudflare videos', async () => {
        prismaMock.cloudflareVideo.findMany.mockResolvedValue([
          {
            id: 'testId',
            userId: 'testUserId',
            uploadUrl: 'testUrl',
            createdAt: new Date(),
            updatedAt: new Date(),
            name: 'testName',
            readyToStream: true
          }
        ])
        const result = await client({
          document: GET_MY_CLOUDFLARE_VIDEOS_QUERY
        })
        expect(result).toEqual({
          data: {
            getMyCloudflareVideos: [
              {
                id: 'testId',
                uploadUrl: 'testUrl',
                userId: 'testUserId',
                createdAt: expect.any(String),
                readyToStream: true
              }
            ]
          }
        })
        expect(prismaMock.cloudflareVideo.findMany).toHaveBeenCalledWith({
          where: { userId: 'testUserId' }
        })
      })

      it('should return cloudflare videos with pagination', async () => {
        prismaMock.cloudflareVideo.findMany.mockResolvedValue([
          {
            id: 'testId',
            userId: 'testUserId',
            uploadUrl: 'testUrl',
            createdAt: new Date(),
            updatedAt: new Date(),
            name: 'testName',
            readyToStream: true
          }
        ])
        const result = await client({
          document: GET_MY_CLOUDFLARE_VIDEOS_QUERY,
          variables: {
            offset: 0,
            limit: 10
          }
        })
        expect(result).toEqual({
          data: {
            getMyCloudflareVideos: [
              {
                id: 'testId',
                uploadUrl: 'testUrl',
                userId: 'testUserId',
                createdAt: expect.any(String),
                readyToStream: true
              }
            ]
          }
        })
        expect(prismaMock.cloudflareVideo.findMany).toHaveBeenCalledWith({
          where: { userId: 'testUserId' },
          take: 10,
          skip: 0
        })
      })
    })

    describe('getMyCloudflareVideo', () => {
      const GET_MY_CLOUDFLARE_VIDEO_QUERY = graphql(`
        query getMyCloudflareVideo {
          getMyCloudflareVideo(id: "testId") {
            id
            uploadUrl
            userId
            createdAt
            readyToStream
          }
        }
      `)

      it('should return cloudflare video', async () => {
        prismaMock.cloudflareVideo.findFirstOrThrow.mockResolvedValue({
          id: 'testId',
          userId: 'testUserId',
          uploadUrl: 'testUrl',
          createdAt: new Date(),
          updatedAt: new Date(),
          name: 'testName',
          readyToStream: true
        })
        const result = await client({
          document: GET_MY_CLOUDFLARE_VIDEO_QUERY
        })
        expect(result).toEqual({
          data: {
            getMyCloudflareVideo: {
              id: 'testId',
              uploadUrl: 'testUrl',
              userId: 'testUserId',
              createdAt: expect.any(String),
              readyToStream: true
            }
          }
        })
        expect(
          prismaMock.cloudflareVideo.findFirstOrThrow
        ).toHaveBeenCalledWith({
          where: { id: 'testId', userId: 'testUserId' }
        })
      })

      it('should return cloudflare video with readyToStream', async () => {
        prismaMock.cloudflareVideo.findFirstOrThrow.mockResolvedValue({
          id: 'testId',
          userId: 'testUserId',
          uploadUrl: 'testUrl',
          createdAt: new Date(),
          updatedAt: new Date(),
          name: 'testName',
          readyToStream: false
        })
        prismaMock.cloudflareVideo.update.mockResolvedValue({
          id: 'testId',
          userId: 'testUserId',
          uploadUrl: 'testUrl',
          createdAt: new Date(),
          updatedAt: new Date(),
          name: 'testName',
          readyToStream: true
        })
        mockGetVideo.mockResolvedValue({
          id: 'testId',
          readyToStream: true
        } as unknown as Video)
        const result = await client({
          document: GET_MY_CLOUDFLARE_VIDEO_QUERY
        })
        expect(result).toEqual({
          data: {
            getMyCloudflareVideo: {
              id: 'testId',
              uploadUrl: 'testUrl',
              userId: 'testUserId',
              createdAt: expect.any(String),
              readyToStream: true
            }
          }
        })
        expect(
          prismaMock.cloudflareVideo.findFirstOrThrow
        ).toHaveBeenCalledWith({
          where: { id: 'testId', userId: 'testUserId' }
        })
        expect(mockGetVideo).toHaveBeenCalledWith('testId')
        expect(prismaMock.cloudflareVideo.update).toHaveBeenCalledWith({
          where: { id: 'testId' },
          data: { readyToStream: true }
        })
      })
    })
  })

  describe('mutations', () => {
    describe('createCloudflareUploadByFile', () => {
      const CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_FILE_MUTATION = graphql(`
        mutation createCloudflareVideoUploadByFile {
          createCloudflareVideoUploadByFile(
            uploadLength: 100
            name: "testName"
          ) {
            id
            uploadUrl
            userId
            createdAt
            readyToStream
          }
        }
      `)

      it('should return cloudflare video', async () => {
        mockCreateVideoByDirectUpload.mockResolvedValue({
          id: 'id',
          uploadUrl: 'testUrl'
        })
        prismaMock.cloudflareVideo.create.mockResolvedValue({
          id: 'id',
          userId: 'testUserId',
          uploadUrl: 'testUrl',
          createdAt: new Date(),
          updatedAt: new Date(),
          name: 'testName',
          readyToStream: true
        })
        const result = await client({
          document: CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_FILE_MUTATION
        })
        expect(result).toEqual({
          data: {
            createCloudflareVideoUploadByFile: {
              id: 'id',
              uploadUrl: 'testUrl',
              userId: 'testUserId',
              createdAt: expect.any(String),
              readyToStream: true
            }
          }
        })
        expect(prismaMock.cloudflareVideo.create).toHaveBeenCalledWith({
          data: {
            id: 'id',
            userId: 'testUserId',
            uploadUrl: 'testUrl',
            name: 'testName'
          }
        })
      })
    })

    describe('createCloudflareVideoUploadByUrl', () => {
      const CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_URL_MUTATION = graphql(`
        mutation createCloudflareVideoUploadByUrl($url: String!) {
          createCloudflareVideoUploadByUrl(url: $url) {
            id
            uploadUrl
            userId
            createdAt
            readyToStream
          }
        }
      `)

      it('should return cloudflare video', async () => {
        mockCreateVideoFromUrl.mockResolvedValue({ uid: 'id' })
        prismaMock.cloudflareVideo.create.mockResolvedValue({
          id: 'id',
          userId: 'testUserId',
          uploadUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          name: 'testName',
          readyToStream: true
        })
        const result = await client({
          document: CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_URL_MUTATION,
          variables: {
            url: 'testUrl'
          }
        })
        expect(result).toEqual({
          data: {
            createCloudflareVideoUploadByUrl: {
              id: 'id',
              uploadUrl: null,
              userId: 'testUserId',
              createdAt: expect.any(String),
              readyToStream: true
            }
          }
        })
        expect(prismaMock.cloudflareVideo.create).toHaveBeenCalledWith({
          data: {
            id: 'id',
            userId: 'testUserId'
          }
        })
      })
    })

    describe('deleteCloudflareVideo', () => {
      const DELETE_CLOUDFLARE_VIDEO_MUTATION = graphql(`
        mutation deleteCloudflareVideo {
          deleteCloudflareVideo(id: "testId")
        }
      `)

      it('should return true', async () => {
        const result = await client({
          document: DELETE_CLOUDFLARE_VIDEO_MUTATION
        })
        expect(mockDeleteVideo).toHaveBeenCalledWith('testId')
        expect(result).toEqual({
          data: {
            deleteCloudflareVideo: true
          }
        })
        expect(prismaMock.cloudflareVideo.delete).toHaveBeenCalledWith({
          where: { id: 'testId' }
        })
      })
    })
  })
})
