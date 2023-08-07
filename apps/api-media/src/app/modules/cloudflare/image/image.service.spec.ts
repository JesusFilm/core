import { Test, TestingModule } from '@nestjs/testing'
import FormData from 'form-data'
import fetch, { Response } from 'node-fetch'

import { ImageService } from './image.service'

jest.mock('node-fetch', () => {
  const originalModule = jest.requireActual('node-fetch')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

const cfResult = {
  result: {
    id: '1',
    uploadURL: 'https://upload.com'
  },
  success: true
}

const cfDeleteResult = {
  result: {},
  result_info: null,
  success: true,
  errors: [],
  messages: []
}

describe('ImageService', () => {
  let service: ImageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageService]
    }).compile()

    service = module.get<ImageService>(ImageService)
    mockFetch.mockClear()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  describe('getCloudflareImageUploadInfo', () => {
    it('returns cloudflare response information', async () => {
      const request = mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => await Promise.resolve(cfResult)
      } as unknown as Response)
      expect(await service.getImageInfoFromCloudflare()).toEqual(cfResult)
      expect(request).toHaveBeenCalledWith(
        `https://api.cloudflare.com/client/v4/accounts/${
          process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
        }/images/v2/direct_upload?requireSignedURLs=true&metadata={"key":"value"}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CLOUDFLARE_IMAGES_TOKEN ?? ''}`
          },
          method: 'POST'
        }
      )
    })
  })

  describe('uploadToCloudlareByUrl', () => {
    it('returns cloudflare response information', async () => {
      const url = 'https://upload.com'
      const formData = new FormData()
      formData.append('url', url)
      const request = mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => await Promise.resolve(cfResult)
      } as unknown as Response)
      expect(await service.uploadToCloudlareByUrl(url)).toEqual(cfResult)
      expect(request).toHaveBeenCalledWith(
        `https://api.cloudflare.com/client/v4/accounts/${
          process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
        }/images/v1?requireSignedURLs=false&metadata={"key":"value"}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CLOUDFLARE_IMAGES_TOKEN ?? ''}`
          },
          method: 'POST',
          body: {
            ...formData,
            _boundary: expect.any(String),
            _streams: expect.any(Array)
          }
        }
      )
    })
  })

  describe('deleteImageFromCloudflare', () => {
    it('returns cloudflare response information', async () => {
      const request = mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => await Promise.resolve(cfDeleteResult)
      } as unknown as Response)
      expect(await service.deleteImageFromCloudflare('1')).toEqual(
        cfDeleteResult
      )
      expect(request).toHaveBeenCalledWith(
        `https://api.cloudflare.com/client/v4/accounts/${
          process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
        }/images/v1/1`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CLOUDFLARE_IMAGES_TOKEN ?? ''}`
          },
          method: 'DELETE'
        }
      )
    })
  })
})
