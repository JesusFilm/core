import { Response } from 'node-fetch'

import { ImageAspectRatio } from '.prisma/api-media-client'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

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
  const client = getClient()

  describe('queries', () => {
    describe('getMyCloudflareImages', () => {
      const GET_MY_CLOUDFLARE_IMAGES_QUERY = graphql(`
        query getMyCloudflareImages($offset: Int, $limit: Int) {
          getMyCloudflareImages(offset: $offset, limit: $limit) {
            id
            uploadUrl
            userId
            aspectRatio
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
        const result = await client({
          document: GET_MY_CLOUDFLARE_IMAGES_QUERY
        })
        expect(result).toEqual({
          data: {
            getMyCloudflareImages: [
              {
                id: 'testId',
                uploadUrl: 'testUrl',
                userId: 'testUserId',
                aspectRatio: ImageAspectRatio.hd
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
            aspectRatio: null,
            videoId: null
          }
        ])
        const result = await client({
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
                aspectRatio: null
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
        const result = await client({
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
        const result = await client({
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
        const result = await client({
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
        const result = await client({
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

      it('should return true', async () => {
        const result = await client({
          document: DELETE_CLOUDFLARE_IMAGE_MUTATION
        })
        expect(mockDeleteImage).toHaveBeenCalledWith('testId')
        expect(result).toEqual({
          data: {
            deleteCloudflareImage: true
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
        const result = await client({
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
