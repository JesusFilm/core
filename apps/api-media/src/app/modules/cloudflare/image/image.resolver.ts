import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { CloudflareImage } from '.prisma/api-media-client'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'

import { PrismaService } from '../../../lib/prisma.service'

import { ImageService } from './image.service'

@Resolver('Image')
export class ImageResolver {
  constructor(
    private readonly imageService: ImageService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  async createCloudflareUploadByFile(
    @CurrentUserId() userId: string
  ): Promise<CloudflareImage> {
    const result = await this.imageService.getImageInfoFromCloudflare()
    if (!result.success) {
      throw new Error(result.errors[0])
    }
    return await this.prismaService.cloudflareImage.create({
      data: {
        id: result.result.id,
        uploadUrl: result.result.uploadURL,
        userId
      }
    })
  }

  @Mutation()
  async createCloudflareUploadByUrl(
    @Args('url') url: string,
    @CurrentUserId() userId: string
  ): Promise<CloudflareImage | null> {
    const result = await this.imageService.uploadToCloudlareByUrl(url)
    if (!result.success) {
      throw new Error(result.errors[0])
    }
    return await this.prismaService.cloudflareImage.create({
      data: {
        id: result.result.id,
        userId,
        uploaded: true
      }
    })
  }

  @Query()
  async getMyCloudflareImages(
    @CurrentUserId() userId: string
  ): Promise<CloudflareImage[]> {
    return await this.prismaService.cloudflareImage.findMany({
      where: { userId }
    })
  }

  @Mutation()
  async deleteCloudflareImage(
    @Args('id') id: string,
    @CurrentUserId() userId: string
  ): Promise<boolean> {
    const image = await this.prismaService.cloudflareImage.findUnique({
      where: { id }
    })
    if (image == null) {
      throw new GraphQLError('Image not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    }
    if (image.userId !== userId) {
      throw new GraphQLError('This image does not belong to you', {
        extensions: { code: 'FORBIDDEN' }
      })
    }
    const result = await this.imageService.deleteImageFromCloudflare(id)
    if (!result.success) {
      throw new Error(result.errors[0])
    }
    await this.prismaService.cloudflareImage.delete({ where: { id } })
    return true
  }

  @Mutation()
  async cloudflareUploadComplete(
    @Args('id') id: string,
    @CurrentUserId() userId: string
  ): Promise<boolean> {
    const image = await this.prismaService.cloudflareImage.findUnique({
      where: { id }
    })
    if (image == null) {
      throw new GraphQLError('Image not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    }
    if (image.userId !== userId) {
      throw new GraphQLError('This image does not belong to you', {
        extensions: { code: 'FORBIDDEN' }
      })
    }
    await this.prismaService.cloudflareImage.update({
      where: { id },
      data: {
        uploaded: true
      }
    })
    return true
  }
}
