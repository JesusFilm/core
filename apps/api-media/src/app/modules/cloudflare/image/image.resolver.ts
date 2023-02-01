import { Resolver, Query } from '@nestjs/graphql'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { CloudflareDirectCreatorUploadResponse } from '../../../__generated__/graphql'
import { ImageService } from './image.service'

@Resolver('Image')
export class ImageResolver {
  constructor(private readonly imageService: ImageService) {}

  @Query()
  async getCloudflareImageUploadInfo(
    @CurrentUserId() userId: string
  ): Promise<CloudflareDirectCreatorUploadResponse> {
    const result = await this.imageService.getImageInfoFromCloudflare()
    if (!result.success) {
      throw new Error(result.errors[0])
    }
    await this.imageService.save({
      userId,
      imageId: result.result.id,
      createdAt: new Date().toISOString()
    })
    return {
      imageId: result.result.id,
      uploadUrl: result.result.uploadURL
    }
  }
}
