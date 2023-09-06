import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '../../../lib/prisma.service'

import { VideoResolver } from './video.resolver'
import {
  CloudflareVideoUploadUrl,
  CloudflareVideoUrlUploadResponse,
  VideoService
} from './video.service'

const cloudflareVideo = {
  id: '1',
  uploadUrl: 'https://upload.com',
  createdAt: new Date(),
  userId: 'user_1',
  readyToStream: false
}

describe('VideoResolver', () => {
  let resolver: VideoResolver,
    service: jest.Mocked<VideoService>,
    prismaService: PrismaService

  const user = {
    id: 'user_1',
    firstName: 'fo',
    lastName: 'sho',
    email: 'tho@no.co',
    videoUrl: 'po'
  }
  const cloudflareVideoUploadUrl: CloudflareVideoUploadUrl = {
    id: 'mediaStreamId',
    uploadUrl: 'https://example.com/video.mp4'
  }
  const cloudflareVideoUrlUploadResponse: CloudflareVideoUrlUploadResponse = {
    result: {
      uid: 'cloudflareUid'
    },
    success: true,
    errors: [],
    messages: []
  }

  beforeEach(async () => {
    const videoService = {
      provide: VideoService,
      useFactory: () => ({
        uploadToCloudflareByFile: jest.fn(() => cloudflareVideoUploadUrl),
        deleteVideoFromCloudflare: jest.fn(() => cloudflareVideo),
        uploadToCloudflareByUrl: jest.fn(
          () => cloudflareVideoUrlUploadResponse
        ),
        getVideoFromCloudflare: jest.fn(() => cloudflareVideo)
      })
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoResolver, videoService, PrismaService]
    }).compile()
    resolver = module.get<VideoResolver>(VideoResolver)
    service = await module.resolve(VideoService)
    prismaService = await module.resolve(PrismaService)
    prismaService.cloudflareVideo.findUnique = jest
      .fn()
      .mockResolvedValue(cloudflareVideo)
    prismaService.cloudflareVideo.findMany = jest
      .fn()
      .mockResolvedValue([cloudflareVideo, cloudflareVideo])
    prismaService.cloudflareVideo.create = jest
      .fn()
      .mockImplementationOnce((input) => input.data)
    prismaService.cloudflareVideo.update = jest
      .fn()
      .mockImplementationOnce((input) => input.data)
    prismaService.cloudflareVideo.delete = jest
      .fn()
      .mockResolvedValue(cloudflareVideo)
  })

  describe('createCloudflareUploadByFile', () => {
    it('return cloudflare video', async () => {
      expect(
        await resolver.createCloudflareVideoUploadByFile(100, 'name', 'userId')
      ).toEqual({
        ...cloudflareVideoUploadUrl,
        name: 'name',
        userId: 'userId'
      })
      expect(service.uploadToCloudflareByFile).toHaveBeenCalledWith(
        100,
        'name',
        'userId'
      )
    })

    it('when cloudflare request fails then throw an error', async () => {
      service.uploadToCloudflareByFile.mockResolvedValueOnce(undefined)
      await expect(
        async () =>
          await resolver.createCloudflareVideoUploadByFile(
            100,
            'name',
            'userId'
          )
      ).rejects.toThrow('unable to connect to cloudflare')
      expect(service.uploadToCloudflareByFile).toHaveBeenCalledWith(
        100,
        'name',
        'userId'
      )
    })
  })

  describe('createCloudflareVideoUploadByUrl', () => {
    it('returns cloudflare video', async () => {
      expect(
        await resolver.createCloudflareVideoUploadByUrl(
          'https://example.com/video.mp4',
          user.id
        )
      ).toEqual({
        id: 'cloudflareUid',
        userId: user.id
      })
      expect(service.uploadToCloudflareByUrl).toHaveBeenCalledWith(
        'https://example.com/video.mp4',
        user.id
      )
    })

    it('when cloudflare request fails then throw an error', async () => {
      service.uploadToCloudflareByUrl.mockResolvedValueOnce({
        result: null,
        success: false,
        errors: ['video is too big'],
        messages: []
      })
      await expect(
        async () =>
          await resolver.createCloudflareVideoUploadByUrl(
            'https://example.com/video.mp4',
            user.id
          )
      ).rejects.toThrow('video is too big')
      expect(service.uploadToCloudflareByUrl).toHaveBeenCalledWith(
        'https://example.com/video.mp4',
        user.id
      )
    })
  })

  describe('getMyCloudflareVideos', () => {
    it('returns cloudflare response information', async () => {
      expect(await resolver.getMyCloudflareVideos('userId')).toEqual([
        cloudflareVideo,
        cloudflareVideo
      ])
      expect(prismaService.cloudflareVideo.findMany).toHaveBeenCalledWith({
        where: { userId: 'userId' }
      })
    })
  })

  describe('getMyCloudflareVideo', () => {
    it('throws an error if not found', async () => {
      prismaService.cloudflareVideo.findUnique = jest
        .fn()
        .mockResolvedValueOnce(null)
      await expect(
        async () => await resolver.getMyCloudflareVideo('videoId', user.id)
      ).rejects.toThrow('Video not found')
    })

    it('throws an error if wrong user', async () => {
      await expect(
        async () => await resolver.getMyCloudflareVideo('videoId', 'user2Id')
      ).rejects.toThrow('This video does not belong to you')
    })

    it('throws an error if could not be retrieved from cloudflare', async () => {
      service.getVideoFromCloudflare.mockResolvedValueOnce({
        result: null,
        success: false,
        errors: ['Video could not be retrieved from cloudflare'],
        messages: []
      })
      await expect(
        async () => await resolver.getMyCloudflareVideo('videoId', user.id)
      ).rejects.toThrow('Video could not be retrieved from cloudflare')
    })

    it('updates video and returns updated video', async () => {
      service.getVideoFromCloudflare.mockResolvedValueOnce({
        result: {
          readyToStream: true
        },
        success: true,
        errors: [],
        messages: []
      })
      expect(await resolver.getMyCloudflareVideo('videoId', user.id)).toEqual({
        readyToStream: true
      })
      expect(prismaService.cloudflareVideo.update).toHaveBeenCalledWith({
        where: { id: 'videoId' },
        data: {
          readyToStream: true
        }
      })
    })
  })

  describe('deleteCloudflareVideo', () => {
    it('throws an error if not found', async () => {
      prismaService.cloudflareVideo.findUnique = jest
        .fn()
        .mockResolvedValueOnce(null)
      await expect(
        async () => await resolver.deleteCloudflareVideo('videoId', user.id)
      ).rejects.toThrow('Video not found')
    })

    it('throws an error if wrong user', async () => {
      await expect(
        async () => await resolver.deleteCloudflareVideo('videoId', 'user2Id')
      ).rejects.toThrow('This video does not belong to you')
    })

    it('throws an error if could not be deleted from cloudflare', async () => {
      service.deleteVideoFromCloudflare.mockResolvedValueOnce(false)
      await expect(
        async () => await resolver.deleteCloudflareVideo('videoId', user.id)
      ).rejects.toThrow('Video could not be deleted from cloudflare')
    })

    it('calls service.deleteCloudflareVideo', async () => {
      expect(await resolver.deleteCloudflareVideo('videoId', user.id)).toBe(
        true
      )
      expect(service.deleteVideoFromCloudflare).toHaveBeenCalledWith('videoId')
    })

    it('calls service.remove', async () => {
      expect(await resolver.deleteCloudflareVideo('1', user.id)).toBe(true)
      expect(prismaService.cloudflareVideo.delete).toHaveBeenCalledWith({
        where: { id: '1' }
      })
    })
  })
})
