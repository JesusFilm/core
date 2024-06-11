import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import { EventEmailNotifications } from '.prisma/api-journeys-client'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'

import {
  EventEmailNotificationsDeleteByTeamInput,
  EventEmailNotificationsUpdateInput
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('EventEmailNotifications')
export class EventEmailNotificationsResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async eventEmailNotificationsByJourney(
    @Args('journeyId') journeyId: string
  ): Promise<EventEmailNotifications[]> {
    return await this.prismaService.eventEmailNotifications.findMany({
      where: { journeyId }
    })
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async eventEmailNotificationsUpdate(
    @Args('input') input: EventEmailNotificationsUpdateInput
  ): Promise<EventEmailNotifications> {
    const { userId, journeyId } = input
    return await this.prismaService.eventEmailNotifications.upsert({
      where: { userId_journeyId: { userId, journeyId } },
      update: input,
      create: input
    })
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async eventEmailNotificationsDelete(
    @Args('input') input: EventEmailNotificationsUpdateInput
  ): Promise<EventEmailNotifications> {
    const { userId, journeyId } = input
    return await this.prismaService.eventEmailNotifications.delete({
      where: { userId_journeyId: { userId, journeyId } }
    })
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async eventEmailNotificationsDeleteByTeamId(
    @Args('input') input: EventEmailNotificationsDeleteByTeamInput
  ): Promise<EventEmailNotifications[]> {
    const { teamId, userId } = input
    const eventEmailNotifications =
      await this.prismaService.eventEmailNotifications.findMany({
        where: { teamId, userId }
      })

    await this.prismaService.eventEmailNotifications.deleteMany({
      where: { teamId, userId }
    })

    return eventEmailNotifications
  }
}
