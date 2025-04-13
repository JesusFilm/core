import Cloudflare from 'cloudflare'
import { APIPromise } from 'cloudflare/core'
import { mockDeep } from 'jest-mock-extended'
import clone from 'lodash/clone'
import { Response } from 'node-fetch'

import {
  createImageByDirectUpload,
  createImageFromResponse,
  createImageFromText,
  createImageFromUrl,
  deleteImage
} from './service'

const mockCloudflare = mockDeep<Cloudflare>()

jest.mock('cloudflare', () => ({
  __esModule: true,
  default: jest.fn(() => mockCloudflare)
}))

describe('ImageService', () => {
  const originalEnv = clone(process.env)

  beforeEach(() => {
    process.env = originalEnv
    process.env.CLOUDFLARE_ACCOUNT_ID = 'cf_account_id'
    process.env.CLOUDFLARE_IMAGES_TOKEN = 'cf_images_token'
  })

  afterEach(() => {
    process.env = originalEnv
    jest.clearAllMocks()
  })

  describe('createImageByDirectUpload', () => {
    it('returns direct upload create response', async () => {
      mockCloudflare.images.v2.directUploads.create.mockResolvedValueOnce({
        id: '1',
        uploadURL: 'https://upload.com'
      })
      expect(await createImageByDirectUpload()).toEqual({
        id: '1',
        uploadURL: 'https://upload.com'
      })
      expect(
        mockCloudflare.images.v2.directUploads.create
      ).toHaveBeenCalledWith({
        account_id: 'cf_account_id',
        requireSignedURLs: false
      })
    })

    it('throws error when missing CLOUDFLARE_ACCOUNT_ID', async () => {
      delete process.env.CLOUDFLARE_ACCOUNT_ID
      await expect(createImageByDirectUpload()).rejects.toThrow(
        'Missing CLOUDFLARE_ACCOUNT_ID'
      )
    })

    it('throws error when missing CLOUDFLARE_IMAGES_TOKEN', async () => {
      delete process.env.CLOUDFLARE_IMAGES_TOKEN
      await expect(createImageByDirectUpload()).rejects.toThrow(
        'Missing CLOUDFLARE_IMAGES_TOKEN'
      )
    })
  })

  describe('createImageFromResponse', () => {
    it('returns image', async () => {
      mockCloudflare.images.v1.create.mockResolvedValueOnce({
        id: '1'
      })
      const response = new Response()
      expect(await createImageFromResponse(response)).toEqual({
        id: '1'
      })
      expect(mockCloudflare.images.v1.create).toHaveBeenCalledWith({
        account_id: 'cf_account_id',
        requireSignedURLs: false,
        file: response
      })
    })

    it('throws error when missing CLOUDFLARE_ACCOUNT_ID', async () => {
      delete process.env.CLOUDFLARE_ACCOUNT_ID
      await expect(createImageFromResponse(new Response())).rejects.toThrow(
        'Missing CLOUDFLARE_ACCOUNT_ID'
      )
    })
  })

  describe('createImageFromText', () => {
    it('returns response', async () => {
      const response = new Response()
      mockCloudflare.post.mockReturnValue({
        asResponse: jest.fn().mockResolvedValueOnce(response)
      } as unknown as APIPromise<unknown>)
      expect(await createImageFromText('prompt')).toEqual(response)
      expect(mockCloudflare.post).toHaveBeenCalledWith(
        '/accounts/cf_account_id/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0',
        {
          body: {
            prompt: 'prompt'
          }
        }
      )
    })

    it('throws error when missing CLOUDFLARE_ACCOUNT_ID', async () => {
      delete process.env.CLOUDFLARE_ACCOUNT_ID
      await expect(createImageFromText('prompt')).rejects.toThrow(
        'Missing CLOUDFLARE_ACCOUNT_ID'
      )
    })
  })

  describe('createImageFromUrl', () => {
    it('returns image', async () => {
      mockCloudflare.images.v1.create.mockResolvedValueOnce({
        id: '1'
      })
      expect(await createImageFromUrl('https://image.com')).toEqual({
        id: '1'
      })
      expect(mockCloudflare.images.v1.create).toHaveBeenCalledWith({
        account_id: 'cf_account_id',
        requireSignedURLs: false,
        url: 'https://image.com'
      })
    })

    it('throws error when missing CLOUDFLARE_ACCOUNT_ID', async () => {
      delete process.env.CLOUDFLARE_ACCOUNT_ID
      await expect(createImageFromUrl('https://image.com')).rejects.toThrow(
        'Missing CLOUDFLARE_ACCOUNT_ID'
      )
    })
  })

  describe('deleteImage', () => {
    it('does not throw error', async () => {
      mockCloudflare.images.v1.delete.mockResolvedValueOnce({})
      expect(await deleteImage('1')).toEqual({})
      expect(mockCloudflare.images.v1.delete).toHaveBeenCalledWith('1', {
        account_id: 'cf_account_id'
      })
    })

    it('throws error when missing CLOUDFLARE_ACCOUNT_ID', async () => {
      delete process.env.CLOUDFLARE_ACCOUNT_ID
      await expect(deleteImage('1')).rejects.toThrow(
        'Missing CLOUDFLARE_ACCOUNT_ID'
      )
    })
  })
})
