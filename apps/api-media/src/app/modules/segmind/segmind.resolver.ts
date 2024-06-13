import { Args, Mutation, Resolver } from '@nestjs/graphql'

import { CloudflareImage } from '.prisma/api-media-client'

import { SegmindModel } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

import { SegmindService } from './segmind.service'

@Resolver('Segmind')
export class SegmindResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly segmindService: SegmindService
  ) {}

  @Mutation()
  async createImageBySegmindPrompt(
    @Args('prompt') prompt: string,
    @Args('model') model: SegmindModel
  ): Promise<CloudflareImage | undefined> {
    return await this.segmindService.createImageFromPrompt(
      prompt,
      model,
      'userId'
    )
  }
}
