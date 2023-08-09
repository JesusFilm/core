import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '../../../lib/prisma.service'

import { ImageResolver } from './image.resolver'
import { ImageService } from './image.service'

const cfResult = {
  result: {
    id: '1',
    uploadURL: 'https://upload.com'
  },
  success: true
}

const cfImage = {
  id: '1',
  uploadUrl: 'https://upload.com',
  createdAt: new Date(),
  userId: 'user_1'
}

describe('ImageResolver', () => {
  let resolver: ImageResolver,
    service: ImageService,
    prismaService: PrismaService

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
        getImageInfoFromCloudflare: jest.fn(() => cfResult),
        deleteImageFromCloudflare: jest.fn(() => cfResult),
        uploadToCloudlareByUrl: jest.fn(() => cfResult),
        remove: jest.fn(() => cfImage)
      })
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageResolver, imageService, PrismaService]
    }).compile()
    resolver = module.get<ImageResolver>(ImageResolver)
    service = await module.resolve(ImageService)
    prismaService = await module.resolve(PrismaService)
    prismaService.cloudflareImage.findUnique = jest
      .fn()
      .mockResolvedValue(cfImage)
    prismaService.cloudflareImage.findMany = jest
      .fn()
      .mockResolvedValue([cfImage, cfImage])
    prismaService.cloudflareImage.create = jest
      .fn()
      .mockImplementationOnce((input) => input.data)
    prismaService.cloudflareImage.update = jest
      .fn()
      .mockImplementationOnce((input) => input.data)
    prismaService.cloudflareImage.delete = jest.fn().mockResolvedValue(cfImage)
  })

  describe('createCloudflareUploadByFile', () => {
    it('returns cloudflare response information', async () => {
      expect(await resolver.createCloudflareUploadByFile(user.id)).toEqual({
        id: '1',
        uploadUrl: 'https://upload.com',
        userId: user.id
      })
      expect(prismaService.cloudflareImage.create).toHaveBeenCalledWith({
        data: {
          id: '1',
          uploadUrl: 'https://upload.com',
          userId: user.id
        }
      })
    })
  })

  describe('createCloudflareUploadByUrl', () => {
    it('returns cloudflare response information', async () => {
      expect(
        await resolver.createCloudflareUploadByUrl(
          'https://upload.com',
          user.id
        )
      ).toEqual({
        id: '1',
        uploaded: true,
        userId: user.id
      })
      expect(prismaService.cloudflareImage.create).toHaveBeenCalledWith({
        data: {
          id: '1',
          userId: user.id,
          uploaded: true
        }
      })
    })
  })

  describe('deleteCloudflareImage', () => {
    it('throws an error if wrong user', async () => {
      await expect(
        resolver.deleteCloudflareImage('1', 'user_2')
      ).rejects.toThrow('This image does not belong to you')
    })

    it('calls service.deleteCloudflareImage', async () => {
      expect(await resolver.deleteCloudflareImage('1', user.id)).toBe(true)
      expect(service.deleteImageFromCloudflare).toHaveBeenCalledWith('1')
    })

    it('calls service.remove', async () => {
      expect(await resolver.deleteCloudflareImage('1', user.id)).toBe(true)
      expect(prismaService.cloudflareImage.delete).toHaveBeenCalledWith({
        where: { id: '1' }
      })
    })
  })

  describe('getMyCloudflareImages', () => {
    it('returns cloudflare response information', async () => {
      expect(await resolver.getMyCloudflareImages('1')).toEqual([
        cfImage,
        cfImage
      ])
    })
  })

  describe('cloudflareUploadComplete', () => {
    it('throws an error if wrong user', async () => {
      await expect(
        resolver.cloudflareUploadComplete('1', 'user_2')
      ).rejects.toThrow('This image does not belong to you')
    })

    it('calls service.save', async () => {
      expect(await resolver.cloudflareUploadComplete(cfImage.id, user.id)).toBe(
        true
      )
      expect(prismaService.cloudflareImage.update).toHaveBeenCalledWith({
        where: { id: cfImage.id },
        data: {
          uploaded: true
        }
      })
    })
  })
})
