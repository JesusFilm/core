import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { mockCollectionSaveResult } from '@core/nest/database/mock'

import { DocumentCollection, EdgeCollection } from 'arangojs/collection'
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
  let service: ImageService,
    db: DeepMockProxy<Database>,
    collectionMock: DeepMockProxy<DocumentCollection & EdgeCollection>

  beforeEach(async () => {
    db = mockDeep()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: 'DATABASE',
          useFactory: () => db
        }
      ]
    }).compile()

    service = module.get<ImageService>(ImageService)
    collectionMock = mockDeep()
    service.collection = collectionMock
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
  describe('getCloudflareImagesForUserId', () => {
    const input = {
      _key: cfResult.result.id,
      uploadUrl: cfResult.result.uploadURL,
      uploaded: true
    }
    const result = {
      id: input._key,
      uploadUrl: input.uploadUrl,
      uploaded: input.uploaded
    }
    beforeEach(() => {
      collectionMock.update.mockReturnValue(
        mockCollectionSaveResult(service.collection, input)
      )
    })

    it('should return an updated result', async () => {
      expect(
        await service.update(cfResult.result.id, { uploaded: true })
      ).toEqual(result)
    })
  })
})
