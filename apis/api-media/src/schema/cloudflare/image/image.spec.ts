import { Response } from 'node-fetch'

import { CloudflareImage, ImageAspectRatio } from '@core/prisma/media/client'
import { graphql } from '@core/shared/gql'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'

import {
  createImageByDirectUpload,
  createImageFromResponse,
  createImageFromText,
  createImageFromUrl,
  deleteImage
} from './service'

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
        query getMyCloudflareImages($offset: Int, $limit: Int) {
          getMyCloudflareImages(offset: $offset, limit: $limit) {
            id
            uploadUrl
            userId
            aspectRatio
            url
            mobileCinematicHigh
            mobileCinematicLow
            mobileCinematicVeryLow
            thumbnail
            videoStill
          }
        }
      `)

      it('should return cloudflare images', async () => {
        prismaMock.cloudflareImage.findMany.mockResolvedValue([
          {
            id: 'testId',
            uploaded: true,
            userId: 'testUserId',
            uploadUrl: 'testUrl',
            createdAt: new Date(),
            updatedAt: new Date(),
            aspectRatio: ImageAspectRatio.hd,
            videoId: null
          }
        ])
        const result = await authClient({
          document: GET_MY_CLOUDFLARE_IMAGES_QUERY
        })
        expect(result).toEqual({
          data: {
            getMyCloudflareImages: [
              {
                id: 'testId',
                uploadUrl: 'testUrl',
                userId: 'testUserId',
                aspectRatio: ImageAspectRatio.hd,
                url: `https://imagedelivery.net/${
                  process.env.CLOUDFLARE_IMAGE_ACCOUNT ?? 'testAccount'
                }/testId`,
                mobileCinematicHigh: null,
                mobileCinematicLow: null,
                mobileCinematicVeryLow: null,
                thumbnail: `https://imagedelivery.net/${
                  process.env.CLOUDFLARE_IMAGE_ACCOUNT ?? 'testAccount'
                }/testId/f=jpg,w=120,h=68,q=95`,
                videoStill: `https://imagedelivery.net/${
                  process.env.CLOUDFLARE_IMAGE_ACCOUNT ?? 'testAccount'
                }/testId/f=jpg,w=1920,h=1080,q=95`
              }
            ]
          }
        })
        expect(prismaMock.cloudflareImage.findMany).toHaveBeenCalledWith({
          where: { userId: 'testUserId' }
        })
      })

      it('should return cloudflare images with pagination', async () => {
        prismaMock.cloudflareImage.findMany.mockResolvedValue([
          {
            id: 'testId',
            uploaded: true,
            userId: 'testUserId',
            uploadUrl: 'testUrl',
            createdAt: new Date(),
            updatedAt: new Date(),
            aspectRatio: ImageAspectRatio.banner,
            videoId: null
          }
        ])
        const result = await authClient({
          document: GET_MY_CLOUDFLARE_IMAGES_QUERY,
          variables: {
            offset: 0,
            limit: 10
          }
        })
        expect(result).toEqual({
          data: {
            getMyCloudflareImages: [
              {
                id: 'testId',
                uploadUrl: 'testUrl',
                userId: 'testUserId',
                aspectRatio: ImageAspectRatio.banner,
                url: `https://imagedelivery.net/${
                  process.env.CLOUDFLARE_IMAGE_ACCOUNT ?? 'testAccount'
                }/testId`,
                mobileCinematicHigh: `https://imagedelivery.net/${
                  process.env.CLOUDFLARE_IMAGE_ACCOUNT ?? 'testAccount'
                }/testId/f=jpg,w=1280,h=600,q=95`,
                mobileCinematicLow: `https://imagedelivery.net/${
                  process.env.CLOUDFLARE_IMAGE_ACCOUNT ?? 'testAccount'
                }/testId/f=jpg,w=640,h=300,q=95`,
                mobileCinematicVeryLow: `https://imagedelivery.net/${
                  process.env.CLOUDFLARE_IMAGE_ACCOUNT ?? 'testAccount'
                }/testId/f=webp,w=640,h=300,q=50`,
                thumbnail: null,
                videoStill: null
              }
            ]
          }
        })
        expect(prismaMock.cloudflareImage.findMany).toHaveBeenCalledWith({
          where: { userId: 'testUserId' },
          take: 10,
          skip: 0
        })
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
          videoId: null
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
          videoId: 'videoId'
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
        mutation createCloudflareUploadByUrl($url: String!) {
          createCloudflareUploadByUrl(url: $url) {
            id
            uploadUrl
            userId
            aspectRatio
          }
        }
      `)

      it('should return cloudflare image', async () => {
        mockCreateImageFromUrl.mockResolvedValue({ id: 'id' })
        prismaMock.cloudflareImage.create.mockResolvedValue({
          id: 'id',
          uploaded: true,
          userId: 'testUserId',
          uploadUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          aspectRatio: ImageAspectRatio.banner,
          videoId: 'videoId'
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
              aspectRatio: ImageAspectRatio.banner
            }
          }
        })
        expect(prismaMock.cloudflareImage.create).toHaveBeenCalledWith({
          data: {
            id: 'id',
            uploaded: true,
            userId: 'testUserId'
          }
        })
        expect(mockCreateImageFromUrl).toHaveBeenCalledWith('testUrl')
      })
    })

    describe('createCloudflareImageFromPrompt', () => {
      const CREATE_CLOUDFLARE_IMAGE_FROM_PROMPT_MUTATION = graphql(`
        mutation createCloudflareImageFromPrompt($prompt: String!) {
          createCloudflareImageFromPrompt(prompt: $prompt) {
            id
            uploadUrl
            userId
            aspectRatio
          }
        }
      `)

      it('should return cloudflare image', async () => {
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
          videoId: 'videoId'
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
              aspectRatio: ImageAspectRatio.hd
            }
          }
        })
        expect(prismaMock.cloudflareImage.create).toHaveBeenCalledWith({
          data: {
            id: 'id',
            uploaded: true,
            userId: 'testUserId'
          }
        })
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
          roles: ['publisher']
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

      it('should return true', async () => {
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
      })
    })
  })
})
