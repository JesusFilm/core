import { Response } from 'node-fetch'

import { CloudflareImage, ImageAspectRatio } from '@core/prisma/media/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { queue } from '../../../workers/processImageBlurhash/queue'

import {
  createImageByDirectUpload,
  createImageFromResponse,
  createImageFromText,
  createImageFromUrl,
  deleteImage
} from './service'

jest.mock('../../../workers/processImageBlurhash/queue', () => ({
  queue: {
    add: jest.fn().mockResolvedValue({ id: 'job-id' })
  }
}))

const mockedQueue = queue as jest.Mocked<typeof queue>

const mockCreateImageByDirectUpload =
  createImageByDirectUpload as jest.MockedFunction<
    typeof createImageByDirectUpload
  >
const mockCreateImageFromText = createImageFromText as jest.MockedFunction<
  typeof createImageFromText
>
const mockCreateImageFromResponse =
  createImageFromResponse as jest.MockedFunction<typeof createImageFromResponse>

const mockCreateImageFromUrl = createImageFromUrl as jest.MockedFunction<
  typeof createImageFromUrl
>

const mockDeleteImage = deleteImage as jest.MockedFunction<typeof deleteImage>

jest.mock('./service', () => ({
  __esModule: true,
  createImageByDirectUpload: jest.fn(),
  createImageFromResponse: jest.fn(),
  createImageFromText: jest.fn(),
  createImageFromUrl: jest.fn(),
  deleteImage: jest.fn()
}))

describe('cloudflareImage', () => {
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
    describe('getMyCloudflareImages', () => {
      const GET_MY_CLOUDFLARE_IMAGES_QUERY = graphql(`
        query getMyCloudflareImages(
          $first: Int
          $after: String
          $isAi: Boolean
        ) {
          getMyCloudflareImages(first: $first, after: $after, isAi: $isAi) {
            edges {
              cursor
              node {
                id
                url
                isAi
              }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      `)

      it('should return cloudflare images as a connection', async () => {
        prismaMock.cloudflareImage.findMany.mockResolvedValue([
          {
            id: 'testId',
            uploaded: true,
            userId: 'testUserId',
            uploadUrl: 'testUrl',
            createdAt: new Date(),
            updatedAt: new Date(),
            aspectRatio: ImageAspectRatio.hd,
            videoId: null,
            blurhash: 'testBlurhash',
            blurhashAttemptedAt: null,
            isAi: false
          }
        ])
        const result = await authClient({
          document: GET_MY_CLOUDFLARE_IMAGES_QUERY,
          variables: { first: 10 }
        })
        expect(result).toEqual({
          data: {
            getMyCloudflareImages: {
              edges: [
                {
                  cursor: expect.any(String),
                  node: {
                    id: 'testId',
                    url: `https://imagedelivery.net/${
                      process.env.CLOUDFLARE_IMAGE_ACCOUNT ?? 'testAccount'
                    }/testId`,
                    isAi: false
                  }
                }
              ],
              pageInfo: {
                endCursor: expect.any(String),
                hasNextPage: false
              }
            }
          }
        })
      })

      it('should filter by isAi', async () => {
        prismaMock.cloudflareImage.findMany.mockResolvedValue([])
        await authClient({
          document: GET_MY_CLOUDFLARE_IMAGES_QUERY,
          variables: { first: 10, isAi: true }
        })
        expect(prismaMock.cloudflareImage.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { userId: 'testUserId', isAi: true }
          })
        )
      })
    })

    describe('getMyCloudflareImage', () => {
      const GET_MY_CLOUDFLARE_IMAGE_QUERY = graphql(`
        query getMyCloudflareImage {
          getMyCloudflareImage(id: "testId") {
            id
            uploadUrl
            userId
            aspectRatio
          }
        }
      `)

      it('should return cloudflare image', async () => {
        prismaMock.cloudflareImage.findFirstOrThrow.mockResolvedValue({
          id: 'testId',
          uploaded: true,
          userId: 'testUserId',
          uploadUrl: 'testUrl',
          createdAt: new Date(),
          updatedAt: new Date(),
          aspectRatio: null,
          videoId: null,
          blurhash: 'testBlurhash',
          blurhashAttemptedAt: null
        })
        const result = await authClient({
          document: GET_MY_CLOUDFLARE_IMAGE_QUERY
        })
        expect(result).toEqual({
          data: {
            getMyCloudflareImage: {
              id: 'testId',
              uploadUrl: 'testUrl',
              userId: 'testUserId',
              aspectRatio: null
            }
          }
        })
        expect(
          prismaMock.cloudflareImage.findFirstOrThrow
        ).toHaveBeenCalledWith({
          where: { id: 'testId', userId: 'testUserId' }
        })
      })
    })
  })

  describe('mutations', () => {
    describe('createCloudflareUploadByFile', () => {
      const CREATE_CLOUDFLARE_UPLOAD_BY_FILE_MUTATION = graphql(`
        mutation createCloudflareUploadByFile($input: ImageInput!) {
          createCloudflareUploadByFile(input: $input) {
            id
            uploadUrl
            userId
            aspectRatio
          }
        }
      `)

      it('should return cloudflare image', async () => {
        mockCreateImageByDirectUpload.mockResolvedValue({
          id: 'id',
          uploadURL: 'testUrl'
        })
        prismaMock.cloudflareImage.create.mockResolvedValue({
          id: 'id',
          uploaded: true,
          userId: 'testUserId',
          uploadUrl: 'testUrl',
          createdAt: new Date(),
          updatedAt: new Date(),
          aspectRatio: ImageAspectRatio.hd,
          videoId: 'videoId',
          blurhash: null,
          blurhashAttemptedAt: null
        })
        const result = await authClient({
          document: CREATE_CLOUDFLARE_UPLOAD_BY_FILE_MUTATION,
          variables: {
            input: {
              aspectRatio: ImageAspectRatio.hd,
              videoId: 'videoId'
            }
          }
        })
        expect(result).toEqual({
          data: {
            createCloudflareUploadByFile: {
              id: 'id',
              uploadUrl: 'testUrl',
              userId: 'testUserId',
              aspectRatio: ImageAspectRatio.hd
            }
          }
        })
        expect(prismaMock.cloudflareImage.create).toHaveBeenCalledWith({
          data: {
            id: 'id',
            userId: 'testUserId',
            uploadUrl: 'testUrl',
            aspectRatio: ImageAspectRatio.hd,
            videoId: 'videoId'
          }
        })
        expect(mockCreateImageByDirectUpload).toHaveBeenCalledWith()
      })
    })

    describe('createCloudflareUploadByUrl', () => {
      const CREATE_CLOUDFLARE_UPLOAD_BY_URL_MUTATION = graphql(`
        mutation createCloudflareUploadByUrl(
          $url: String!
          $input: ImageInput!
        ) {
          createCloudflareUploadByUrl(url: $url, input: $input) {
            id
            uploadUrl
            userId
            aspectRatio
            blurhash
          }
        }
      `)

      it('should return cloudflare image and queue blurhash job', async () => {
        mockCreateImageFromUrl.mockResolvedValue({ id: 'id' })
        prismaMock.cloudflareImage.create.mockResolvedValue({
          id: 'id',
          uploaded: true,
          userId: 'testUserId',
          uploadUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          aspectRatio: ImageAspectRatio.banner,
          videoId: 'videoId',
          blurhash: null,
          blurhashAttemptedAt: null
        })
        const result = await authClient({
          document: CREATE_CLOUDFLARE_UPLOAD_BY_URL_MUTATION,
          variables: {
            url: 'testUrl',
            input: {
              aspectRatio: ImageAspectRatio.banner,
              videoId: 'videoId'
            }
          }
        })
        expect(result).toEqual({
          data: {
            createCloudflareUploadByUrl: {
              id: 'id',
              uploadUrl: null,
              userId: 'testUserId',
              aspectRatio: ImageAspectRatio.banner,
              blurhash: null
            }
          }
        })
        expect(prismaMock.cloudflareImage.create).toHaveBeenCalledWith({
          data: {
            id: 'id',
            uploaded: true,
            userId: 'testUserId',
            aspectRatio: ImageAspectRatio.banner,
            videoId: 'videoId'
          }
        })
        expect(mockCreateImageFromUrl).toHaveBeenCalledWith('testUrl')
        expect(mockedQueue.add).toHaveBeenCalledWith(
          'api-media-process-image-blurhash-job',
          { imageId: 'id' }
        )
      })
    })

    describe('createCloudflareImageFromPrompt', () => {
      const CREATE_CLOUDFLARE_IMAGE_FROM_PROMPT_MUTATION = graphql(`
        mutation createCloudflareImageFromPrompt(
          $prompt: String!
          $input: ImageInput!
        ) {
          createCloudflareImageFromPrompt(prompt: $prompt, input: $input) {
            id
            uploadUrl
            userId
            aspectRatio
            blurhash
          }
        }
      `)

      it('should return cloudflare image and queue blurhash job', async () => {
        const response = new Response()
        mockCreateImageFromText.mockResolvedValue(response)
        mockCreateImageFromResponse.mockResolvedValue({ id: 'id' })
        prismaMock.cloudflareImage.create.mockResolvedValue({
          id: 'id',
          uploaded: true,
          userId: 'testUserId',
          uploadUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          aspectRatio: ImageAspectRatio.hd,
          videoId: 'videoId',
          blurhash: null,
          blurhashAttemptedAt: null
        })
        const result = await authClient({
          document: CREATE_CLOUDFLARE_IMAGE_FROM_PROMPT_MUTATION,
          variables: {
            prompt: 'test prompt',
            input: {
              aspectRatio: ImageAspectRatio.hd,
              videoId: 'videoId'
            }
          }
        })
        expect(result).toEqual({
          data: {
            createCloudflareImageFromPrompt: {
              id: 'id',
              uploadUrl: null,
              userId: 'testUserId',
              aspectRatio: ImageAspectRatio.hd,
              blurhash: null
            }
          }
        })
        expect(prismaMock.cloudflareImage.create).toHaveBeenCalledWith({
          data: {
            id: 'id',
            uploaded: true,
            userId: 'testUserId',
            aspectRatio: ImageAspectRatio.hd,
            videoId: 'videoId'
          }
        })
        expect(mockedQueue.add).toHaveBeenCalledWith(
          'api-media-process-image-blurhash-job',
          { imageId: 'id' }
        )
      })
    })

    describe('deleteCloudflareImage', () => {
      const DELETE_CLOUDFLARE_IMAGE_MUTATION = graphql(`
        mutation deleteCloudflareImage {
          deleteCloudflareImage(id: "testId")
        }
      `)

      it('should return true if publisher', async () => {
        prismaMock.userMediaRole.findUnique.mockResolvedValue({
          id: 'testUserId',
          userId: 'userId',
          roles: ['publisher'],
          createdAt: new Date(),
          updatedAt: new Date()
        })
        prismaMock.cloudflareImage.findUniqueOrThrow.mockResolvedValue({
          userId: 'notUser'
        } as unknown as CloudflareImage)
        const result = await authClient({
          document: DELETE_CLOUDFLARE_IMAGE_MUTATION
        })
        expect(
          prismaMock.cloudflareImage.findUniqueOrThrow
        ).toHaveBeenCalledWith({
          where: { id: 'testId' }
        })
        expect(mockDeleteImage).not.toHaveBeenCalled()
        expect(result).toEqual({
          data: {
            deleteCloudflareImage: true
          }
        })
        expect(prismaMock.cloudflareImage.delete).toHaveBeenCalledWith({
          where: { id: 'testId' }
        })
      })

      it('should return true if not publisher', async () => {
        prismaMock.cloudflareImage.findUniqueOrThrow.mockResolvedValue({
          userId: 'testUserId'
        } as unknown as CloudflareImage)
        const result = await authClient({
          document: DELETE_CLOUDFLARE_IMAGE_MUTATION
        })
        expect(mockDeleteImage).toHaveBeenCalledWith('testId')
        expect(result).toEqual({
          data: {
            deleteCloudflareImage: true
          }
        })
        expect(
          prismaMock.cloudflareImage.findUniqueOrThrow
        ).toHaveBeenCalledWith({
          where: {
            id: 'testId',
            userId: 'testUserId'
          }
        })
        expect(prismaMock.cloudflareImage.delete).toHaveBeenCalledWith({
          where: { id: 'testId' }
        })
      })
    })

    describe('cloudflareUploadComplete', () => {
      const CLOUDFLARE_UPLOAD_COMPLETE_MUTATION = graphql(`
        mutation cloudflareUploadComplete {
          cloudflareUploadComplete(id: "testId")
        }
      `)

      it('should return true and queue blurhash job', async () => {
        const result = await authClient({
          document: CLOUDFLARE_UPLOAD_COMPLETE_MUTATION
        })
        expect(result).toEqual({
          data: {
            cloudflareUploadComplete: true
          }
        })
        expect(prismaMock.cloudflareImage.update).toHaveBeenCalledWith({
          where: { id: 'testId', userId: 'testUserId' },
          data: { uploaded: true }
        })
        expect(mockedQueue.add).toHaveBeenCalledWith(
          'api-media-process-image-blurhash-job',
          { imageId: 'testId' }
        )
      })
    })
  })
})
