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
      duration: -1
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
      duration: -1
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
    console.log('asdf', video)
    if (video == null) {
      throw new UserInputError('Video not found')
    }
    if (video.userId !== userId) {
      throw new ForbiddenError('This video does not belong to you')
    }
    const response = await this.videoService.getVideoFromCloudflare(id)
    console.log('asdf1', response)

    if (!response.success) {
      throw new Error(response.errors[0])
    }
    const yo = await this.videoService.update(id, {
      duration: (response.result?.duration !== undefined && response.result?.duration  > -1) ? response.result?.duration : -1
    })
    console.log('yo', yo)

    return video
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
