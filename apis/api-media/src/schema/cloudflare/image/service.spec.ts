import Cloudflare from 'cloudflare'
import clone from 'lodash/clone'
import { vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'

import {
  createImageByDirectUpload,
  createImageFromText,
  createImageFromUrl,
  deleteImage
} from './service'

const mockCloudflare = mockDeep<Cloudflare>()

vi.mock('cloudflare', () => ({
  __esModule: true,
  default: vi.fn(function () {
    return mockCloudflare
  })
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
    vi.clearAllMocks()
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

  describe('createImageFromText', () => {
    it('sends a multipart prompt to FLUX and uploads the decoded image', async () => {
      const imageBytes = Buffer.from([255, 216, 255, 217])
      mockCloudflare.post.mockResolvedValueOnce({
        result: { image: imageBytes.toString('base64') }
      })
      mockCloudflare.images.v1.create.mockResolvedValueOnce({ id: '1' })

      expect(await createImageFromText('test prompt')).toEqual({ id: '1' })

      const [path, options] = mockCloudflare.post.mock.calls[0]
      expect(path).toBe(
        '/accounts/cf_account_id/ai/run/@cf/black-forest-labs/flux-2-klein-9b'
      )
      const { body: multipart } = (await options) ?? {}
      expect(multipart).toEqual(
        expect.objectContaining({ body: expect.any(FormData) })
      )
      const { body: form } = multipart as { body: FormData }
      expect(form.get('prompt')).toBe('test prompt')

      const [upload] = mockCloudflare.images.v1.create.mock.calls[0]
      expect(upload).toEqual({
        account_id: 'cf_account_id',
        requireSignedURLs: false,
        file: expect.any(File)
      })
      const file = upload.file as File
      expect(Buffer.from(await file.arrayBuffer())).toEqual(imageBytes)
    })

    it('does not upload when Workers AI returns no image', async () => {
      mockCloudflare.post.mockResolvedValueOnce({ result: {} })

      await expect(createImageFromText('prompt')).rejects.toThrow(
        'Workers AI did not return generated image data'
      )
      expect(mockCloudflare.images.v1.create).not.toHaveBeenCalled()
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
