import { Mutation, Resolver } from '@nestjs/graphql'

import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'

import { PrismaService } from '../../lib/prisma.service'

@Resolver('Segmind')
export class SegmindResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Mutation()
  async createImageBySegmindPrompt(
    @CurrentUserId() userId: string
  ): Promise<void> {}
}
