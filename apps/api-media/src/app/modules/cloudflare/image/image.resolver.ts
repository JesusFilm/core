import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { ForbiddenError, UserInputError } from 'apollo-server-errors'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { CloudflareImage } from '../../../__generated__/graphql'
import { ImageService } from './image.service'

@Resolver('Image')
export class ImageResolver {
  constructor(private readonly imageService: ImageService) {}

  @Mutation()
  async createCloudflareUploadByFile(
    @CurrentUserId() userId: string
  ): Promise<CloudflareImage> {
    const result = await this.imageService.getImageInfoFromCloudflare()
    if (!result.success) {
      throw new Error(result.errors[0])
    }
    const createdAt = new Date().toISOString()
    await this.imageService.save({
      _key: result.result.id,
      uploadUrl: result.result.uploadURL,
      userId,
      createdAt
    })
    return {
      id: result.result.id,
      uploadUrl: result.result.uploadURL,
      userId,
      createdAt
    }
  }

  @Mutation()
  async createCloudflareUploadByUrl(
    @Args('url') url: string,
    @CurrentUserId() userId: string
  ): Promise<CloudflareImage> {
    const result = await this.imageService.uploadToCloudlareByUrl(url)
    if (!result.success) {
      throw new Error(result.errors[0])
    }
    const createdAt = new Date().toISOString()
    await this.imageService.save({
      _key: result.result.id,
      userId,
      createdAt,
      uploaded: true
    })
    return {
      id: result.result.id,
      userId,
      createdAt
    }
  }

  @Query()
  async getMyCloudflareImages(
    @CurrentUserId() userId: string
  ): Promise<CloudflareImage[]> {
    return await this.imageService.getCloudflareImagesForUserId(userId)
  }

  @Mutation()
  async deleteCloudflareImage(
    @Args('id') id: string,
    @CurrentUserId() userId: string
  ): Promise<boolean> {
    const image = (await this.imageService.get(id)) as CloudflareImage
    if (image == null) {
      throw new UserInputError('Image not found')
    }
    if (image.userId !== userId) {
      throw new ForbiddenError('This image does not belong to you')
    }
    const result = await this.imageService.deleteImageFromCloudflare(id)
    if (!result.success) {
      throw new Error(result.errors[0])
    }
    await this.imageService.remove(id)
    return true
  }

  @Mutation()
  async cloudflareUploadComplete(
    @Args('id') id: string,
    @CurrentUserId() userId: string
  ): Promise<boolean> {
    const image = (await this.imageService.get(id)) as CloudflareImage
    if (image == null) {
      throw new UserInputError('Image not found')
    }
    if (image.userId !== userId) {
      throw new ForbiddenError('This image does not belong to you')
    }
    await this.imageService.update(id, {
      uploaded: true
    })
    return true
  }
}
