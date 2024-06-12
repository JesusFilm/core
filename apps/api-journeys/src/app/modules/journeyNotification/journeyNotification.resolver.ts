import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import { JourneyNotification } from '.prisma/api-journeys-client'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'

import { JourneyNotificationUpdateInput } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'

@Resolver('JourneyNotification')
export class JourneyNotificationResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async journeyNotifications(
    @Args('journeyId') journeyId: string
  ): Promise<JourneyNotification[]> {
    return await this.prismaService.journeyNotification.findMany({
      where: { journeyId }
    })
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async journeyNotificationsUpdate(
    @CurrentUserId() userId: string,
    @Args('input') input: JourneyNotificationUpdateInput
  ): Promise<JourneyNotification> {
    const { journeyId } = input
    return await this.prismaService.journeyNotification.upsert({
      where: { userId_journeyId: { userId, journeyId } },
      update: input,
      create: { userId, ...input }
    })
  }
}
