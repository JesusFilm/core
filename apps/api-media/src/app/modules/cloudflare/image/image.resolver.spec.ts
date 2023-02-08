import { Test, TestingModule } from '@nestjs/testing'
import { CloudflareImage } from '../../../__generated__/graphql'

import { ImageResolver } from './image.resolver'
import { ImageService } from './image.service'

const cfResult = {
  result: {
    id: '1',
    uploadURL: 'https://upload.com'
  },
  success: true
}

const cfImage: CloudflareImage = {
  id: '1',
  uploadUrl: 'https://upload.com',
  createdAt: new Date().toISOString(),
  userId: 'user_1'
}

describe('ImageResolver', () => {
  let resolver: ImageResolver
  let service: ImageService

  const user = {
    id: 'user_1',
    firstName: 'fo',
    lastName: 'sho',
    email: 'tho@no.co',
    imageUrl: 'po'
  }

  beforeEach(async () => {
    const imageService = {
      provide: ImageService,
      useFactory: () => ({
        get: jest.fn(() => cfImage),
        getAll: jest.fn(() => [cfImage, cfImage]),
        save: jest.fn((input) => input),
        getImageInfoFromCloudflare: jest.fn(() => cfResult),
        deleteImageFromCloudflare: jest.fn(() => cfResult),
        getCloudflareImagesForUserId: jest.fn(() => [cfImage]),
        remove: jest.fn(() => cfImage)
      })
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageResolver, imageService]
    }).compile()
    resolver = module.get<ImageResolver>(ImageResolver)
    service = await module.resolve(ImageService)
  })

  describe('getCloudflareImageUploadInfo', () => {
    it('returns cloudflare response information', async () => {
      expect(await resolver.createCloudflareImage(user.id)).toEqual({
        id: '1',
        uploadUrl: 'https://upload.com',
        createdAt: expect.any(String),
        userId: user.id
      })
    })
  })
  describe('deleteCloudflareImage', () => {
    it('throws an error if wrong user', async () => {
      await resolver.deleteCloudflareImage('1', 'user_2').catch((e) => {
        expect(e.message).toEqual('This image does not belong to you')
      })
    })
    it('calls service.deleteCloudflareImage', async () => {
      expect(await resolver.deleteCloudflareImage('1', user.id)).toEqual(true)
      expect(service.deleteImageFromCloudflare).toHaveBeenCalledWith('1')
    })
    it('calls service.remove', async () => {
      expect(await resolver.deleteCloudflareImage('1', user.id)).toEqual(true)
      expect(service.remove).toHaveBeenCalledWith('1')
    })
  })
  describe('getMyCloudflareImages', () => {
    it('returns cloudflare response information', async () => {
      expect(await resolver.getMyCloudflareImages('1')).toEqual([cfImage])
    })
  })
})
