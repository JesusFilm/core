import { Test, TestingModule } from '@nestjs/testing'
import fetch, { Response } from 'node-fetch'

import { SegmindModel } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { ImageService } from '../cloudflare/image/image.service'

import { SegmindResolver } from './segmind.resolver'
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

describe('Segmind Resolver', () => {
  let segmindResolver: SegmindResolver,
    segmindService: SegmindService,
    prismaService: PrismaService

  beforeEach(async () => {
    const imageService = {
      provide: ImageService,
      useFactory: () => ({
        uploadImageToCloudflare: jest.fn(() => {
          return {
            success: true,
            result: { id: 'imageId', uploadUrl: 'uploadURL' }
          }
        })
      })
    }
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SegmindResolver],
      providers: [SegmindService, imageService, PrismaService]
    }).compile()

    segmindService = await module.get<SegmindService>(SegmindService)
    segmindResolver = module.get<SegmindResolver>(SegmindResolver)
    prismaService = await module.get<PrismaService>(PrismaService)

    mockFetch.mockClear()
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  describe('createImageBySegmindPrompt', () => {
    it('should create an image by prompt', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 200
      } as unknown as Response)

      const result = {
        id: 'imageId',
        uploadUrl: 'uploadURL',
        userId: 'userId',
        createdAt: new Date(),
        uploaded: true,
        updatedAt: new Date()
      }
      const mockPrompt = 'a snowy field'

      jest
        .spyOn(segmindService, 'createImageFromPrompt')
        .mockImplementation(
          async (prompt: string, model: SegmindModel, userId: string) =>
            await Promise.resolve(result)
        )
      prismaService.cloudflareImage.create = jest
        .fn()
        .mockResolvedValueOnce(result)

      expect(
        await segmindResolver.createImageBySegmindPrompt(
          mockPrompt,
          SegmindModel.sdxl1__0_txt2img
        )
      ).toEqual(result)
    })
  })
})
