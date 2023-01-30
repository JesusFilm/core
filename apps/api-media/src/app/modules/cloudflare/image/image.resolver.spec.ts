import { URLSearchParams } from 'url'
import { Test, TestingModule } from '@nestjs/testing'
import fetch, { Response } from 'node-fetch'

import { ImageResolver } from './image.resolver'
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

describe('ImageResolver', () => {
  let resolver: ImageResolver

  const user = {
    id: '1',
    firstName: 'fo',
    lastName: 'sho',
    email: 'tho@no.co',
    imageUrl: 'po'
  }

  beforeEach(async () => {
    const imageService = {
      provide: ImageService,
      useFactory: () => ({
        get: jest.fn(() => user),
        getByUserId: jest.fn(() => user),
        getAll: jest.fn(() => [user, user]),
        save: jest.fn((input) => input)
      })
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageResolver, imageService]
    }).compile()
    resolver = module.get<ImageResolver>(ImageResolver)

    mockFetch.mockClear()
  })

  describe('getCloudflareImageUploadInfo', () => {
    it('returns cloudflare response information', async () => {
      const request = mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () =>
          await Promise.resolve({
            result: {
              id: '1',
              uploadURL: 'https://upload.com',
              success: true
            }
          })
      } as unknown as Response)
      expect(await resolver.getCloudflareImageUploadInfo(user.id)).toEqual({
        imageId: '1',
        uploadUrl: 'https://upload.com'
      })
      expect(request).toHaveBeenCalledWith(
        `https://api.cloudflare.com/client/v4/accounts/${
          process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
        }/images/v2/direct_upload`,
        {
          body: new URLSearchParams(
            'requireSignedURL=true&metadata={"key":"value"}'
          ),
          headers: {
            Authorization: `Bearer ${process.env.CLOUDFLARE_IMAGES_TOKEN ?? ''}`
          },
          method: 'POST'
        }
      )
    })
  })
})
