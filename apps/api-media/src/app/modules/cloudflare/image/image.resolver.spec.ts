import { Test, TestingModule } from '@nestjs/testing'

import { ImageResolver } from './image.resolver'
import { ImageService } from './image.service'

const cfResult = {
  result: {
    id: '1',
    uploadURL: 'https://upload.com'
  },
  success: true
}

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
        save: jest.fn((input) => input),
        getImageInfoFromCloudflare: jest.fn(() => cfResult)
      })
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageResolver, imageService]
    }).compile()
    resolver = module.get<ImageResolver>(ImageResolver)
  })

  describe('getCloudflareImageUploadInfo', () => {
    it('returns cloudflare response information', async () => {
      expect(await resolver.getCloudflareImageUploadInfo(user.id)).toEqual({
        imageId: '1',
        uploadUrl: 'https://upload.com'
      })
    })
  })
})
