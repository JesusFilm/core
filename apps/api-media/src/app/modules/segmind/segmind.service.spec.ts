import { Test, TestingModule } from '@nestjs/testing'
import { mockDeep } from 'jest-mock-extended'
import fetch, { Response } from 'node-fetch'

import { SegmindModel } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { ImageService } from '../cloudflare/image/image.service'

import { SegmindService } from './segmind.service'

jest.mock('node-fetch', () => {
  const originalModule = jest.requireActual('node-fetch')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('Segmind Service', () => {
  let imageService: ImageService,
    prismaService: PrismaService,
    segmindService: SegmindService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SegmindService,
        ImageService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() }
      ]
    }).compile()

    imageService = module.get<ImageService>(ImageService)
    prismaService = module.get<PrismaService>(PrismaService)
    segmindService = module.get<SegmindService>(SegmindService)
    mockFetch.mockClear()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  describe('createImageFromPrompt', () => {
    it('should create image from segmind with prompt to stable diffusion model', async () => {
      const result = {
        id: 'imageId',
        uploadUrl: 'uploadURL',
        userId: 'userId',
        createdAt: new Date(),
        uploaded: true,
        updatedAt: new Date()
      }
      mockFetch.mockResolvedValue({ status: 200 } as unknown as Response)
      imageService.uploadImageToCloudflare = jest.fn().mockResolvedValueOnce({
        success: true,
        result: { id: 'imageId', uploadUrl: 'uploadURL' }
      })
      prismaService.cloudflareImage.create = jest
        .fn()
        .mockResolvedValueOnce(result)
      const mockPropt = 'pictures of the new Jerusalem'
      expect(
        await segmindService.createImageFromPrompt(
          mockPropt,
          SegmindModel.sdxl1__0_txt2img,
          'userId'
        )
      ).toEqual(result)
    })

    it('should create image from segmind with prompt to paragon model', async () => {
      const result = {
        id: 'imageId',
        uploadUrl: 'uploadURL',
        userId: 'userId',
        createdAt: new Date(),
        uploaded: true,
        updatedAt: new Date()
      }
      mockFetch.mockResolvedValue({ status: 200 } as unknown as Response)
      imageService.uploadImageToCloudflare = jest.fn().mockResolvedValueOnce({
        success: true,
        result: { id: 'imageId', uploadUrl: 'uploadURL' }
      })
      prismaService.cloudflareImage.create = jest
        .fn()
        .mockResolvedValueOnce(result)
      const mockPropt = 'pictures of the new Jerusalem'
      expect(
        await segmindService.createImageFromPrompt(
          mockPropt,
          SegmindModel.sd1__5_paragon,
          'userId'
        )
      ).toEqual(result)
    })

    it('should create image from segmind with prompt to kadinsky model', async () => {
      const result = {
        id: 'imageId',
        uploadUrl: 'uploadURL',
        userId: 'userId',
        createdAt: new Date(),
        uploaded: true,
        updatedAt: new Date()
      }
      mockFetch.mockResolvedValue({ status: 200 } as unknown as Response)
      imageService.uploadImageToCloudflare = jest.fn().mockResolvedValueOnce({
        success: true,
        result: { id: 'imageId', uploadUrl: 'uploadURL' }
      })
      prismaService.cloudflareImage.create = jest
        .fn()
        .mockResolvedValueOnce(result)
      const mockPropt = 'pictures of the new Jerusalem'
      expect(
        await segmindService.createImageFromPrompt(
          mockPropt,
          SegmindModel.kandinsky2__2_txt2img,
          'userId'
        )
      ).toEqual(result)
    })

    it('should create image from segmind with prompt to tinysd model', async () => {
      const result = {
        id: 'imageId',
        uploadUrl: 'uploadURL',
        userId: 'userId',
        createdAt: new Date(),
        uploaded: true,
        updatedAt: new Date()
      }
      mockFetch.mockResolvedValue({ status: 200 } as unknown as Response)
      imageService.uploadImageToCloudflare = jest.fn().mockResolvedValueOnce({
        success: true,
        result: { id: 'imageId', uploadUrl: 'uploadURL' }
      })
      prismaService.cloudflareImage.create = jest
        .fn()
        .mockResolvedValueOnce(result)
      const mockPropt = 'pictures of the new Jerusalem'
      expect(
        await segmindService.createImageFromPrompt(
          mockPropt,
          SegmindModel.tinysd1__5_txt2img,
          'userId'
        )
      ).toEqual(result)
    })

    it('should throw error if failed to upload to cloudflare', async () => {
      mockFetch.mockResolvedValue({ status: 200 } as unknown as Response)
      imageService.uploadImageToCloudflare = jest.fn().mockResolvedValueOnce({
        success: false,
        errors: ['some message']
      })
      const mockPropt = 'pictures of the new Jerusalem'
      await expect(
        segmindService.createImageFromPrompt(
          mockPropt,
          SegmindModel.sdxl1__0_txt2img,
          'userId'
        )
      ).rejects.toThrow('some message')
    })
  })
})
