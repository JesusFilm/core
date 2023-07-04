import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { ForbiddenError, UserInputError } from 'apollo-server-errors'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { CloudflareVideo } from '.prisma/api-media-client'

import { PrismaService } from '../../../lib/prisma.service'
import { VideoService } from './video.service'

@Resolver('Video')
export class VideoResolver {
  constructor(
    private readonly videoService: VideoService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  async createCloudflareVideoUploadByFile(
    @Args('uploadLength') uploadLength: number,
    @Args('name') name: string,
    @CurrentUserId() userId: string
  ): Promise<CloudflareVideo> {
    const response = await this.videoService.uploadToCloudflareByFile(
      uploadLength,
      name,
      userId
    )
    if (response == null) throw new Error('unable to connect to cloudflare')
    return await this.prismaService.cloudflareVideo.create({
      data: {
        id: response.id,
        uploadUrl: response.uploadUrl,
        userId,
        name
      }
    })
  }

  @Mutation()
  async createCloudflareVideoUploadByUrl(
    @Args('url') url: string,
    @CurrentUserId() userId: string
  ): Promise<CloudflareVideo> {
    const response = await this.videoService.uploadToCloudflareByUrl(
      url,
      userId
    )
    if (!response.success || response.result == null)
      throw new Error(response.errors[0])
    return await this.prismaService.cloudflareVideo.create({
      data: {
        id: response.result.uid,
        userId
      }
    })
  }

  @Query()
  async getMyCloudflareVideos(
    @CurrentUserId() userId: string
  ): Promise<CloudflareVideo[]> {
    return await this.prismaService.cloudflareVideo.findMany({
      where: { userId }
    })
  }

  @Query()
  async getMyCloudflareVideo(
    @Args('id') id: string,
    @CurrentUserId() userId: string
  ): Promise<CloudflareVideo> {
    const video = await this.prismaService.cloudflareVideo.findUnique({
      where: { id }
    })
    if (video == null) {
      throw new UserInputError('Video not found')
    }
    if (video.userId !== userId) {
      throw new ForbiddenError('This video does not belong to you')
    }
    const response = await this.videoService.getVideoFromCloudflare(id)

    if (!response.success) {
      throw new Error(response.errors[0])
    }
    return await this.prismaService.cloudflareVideo.update({
      where: { id },
      data: {
        readyToStream: response.result?.readyToStream ?? false
      }
    })
  }

  @Mutation()
  async deleteCloudflareVideo(
    @Args('id') id: string,
    @CurrentUserId() userId: string
  ): Promise<boolean> {
    const video = await this.prismaService.cloudflareVideo.findUnique({
      where: { id }
    })
    if (video == null) {
      throw new UserInputError('Video not found')
    }
    if (video.userId !== userId) {
      throw new ForbiddenError('This video does not belong to you')
    }
    const response = await this.videoService.deleteVideoFromCloudflare(id)
    if (!response) {
      throw new UserInputError('Video could not be deleted from cloudflare')
    }
    await this.prismaService.cloudflareVideo.delete({ where: { id } })
    return true
  }
}
