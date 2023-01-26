import { Resolver, Query } from '@nestjs/graphql'
import fetch from 'node-fetch'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { CloudflareDirectCreatorUploadResponse } from '../../../__generated__/graphql'
import { ImageService } from './image.service'

@Resolver('Image')
export class ImageResolver {
  constructor(private readonly imageService: ImageService) {}

  @Query()
  async getCloudflareUploadInfo(
    @CurrentUserId() userId: string
  ): Promise<CloudflareDirectCreatorUploadResponse> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${
        process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
      }/images/v2/direct_upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN ?? ''}`
        },
        body: new URLSearchParams(
          'requireSignedURL=true&metadata={"key":"value"}'
        )
      }
    )
    const result = await response.json()
    if (!result.result.success) {
      throw new Error(result.result.error)
    }
    await this.imageService.save({
      userId,
      imageId: result.result.id,
      createdAt: new Date().toISOString()
    })
    return {
      id: result.result.id,
      uploadURL: result.result.uploadURL
    }
  }
}
