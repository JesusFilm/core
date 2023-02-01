import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'

import { DocumentCollection } from 'arangojs/collection'
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

export const cfResult = {
  result: {
    id: '1',
    uploadURL: 'https://upload.com',
    success: true
  }
}

describe('ImageResolver', () => {
  let service: ImageService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()

    service = module.get<ImageService>(ImageService)
    service.collection = mockDeep<DocumentCollection>()
    mockFetch.mockClear()
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
        }/images/v2/direct_upload?requireSignedURL=true&metadata={"key":"value"}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CLOUDFLARE_IMAGES_TOKEN ?? ''}`
          },
          method: 'POST'
        }
      )
    })
  })
})
