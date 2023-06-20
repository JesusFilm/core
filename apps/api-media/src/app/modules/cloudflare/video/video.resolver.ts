import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { ForbiddenError, UserInputError } from 'apollo-server-errors'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { CloudflareVideo } from '../../../__generated__/graphql'
import { VideoService } from './video.service'

@Resolver('Video')
export class VideoResolver {
  constructor(private readonly videoService: VideoService) {}

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
    return await this.videoService.save({
      _key: response.id,
      uploadUrl: response.uploadUrl,
      userId,
      name,
      createdAt: new Date().toISOString(),
      readyToStream: false
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
    return await this.videoService.save({
      _key: response.result.uid,
      userId,
      createdAt: new Date().toISOString(),
      readyToStream: false
    })
  }

  @Query()
  async getMyCloudflareVideos(
    @CurrentUserId() userId: string
  ): Promise<CloudflareVideo[]> {
    return await this.videoService.getCloudflareVideosForUserId(userId)
  }

  @Query()
  async getMyCloudflareVideo(
    @Args('id') id: string,
    @CurrentUserId() userId: string
  ): Promise<CloudflareVideo> {
    const video = await this.videoService.get(id)
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
    return await this.videoService.update(id, {
      readyToStream: response.result?.readyToStream ?? false
    })
  }

  @Mutation()
  async deleteCloudflareVideo(
    @Args('id') id: string,
    @CurrentUserId() userId: string
  ): Promise<boolean> {
    const video = await this.videoService.get(id)
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
    await this.videoService.remove(id)
    return true
  }
}
