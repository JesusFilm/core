import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import { EventEmailNotifications } from '.prisma/api-journeys-client'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'

import { EventEmailNotificationsUpdateInput } from '../../__generated__/graphql'
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
    @Args('input') input: EventEmailNotificationsUpdateInput,
    @Args('id') id?: string
  ): Promise<EventEmailNotifications> {
    const { userId, journeyId } = input
    const where =
      id != null ? { id } : { userId_journeyId: { userId, journeyId } }
    return await this.prismaService.eventEmailNotifications.upsert({
      where,
      update: input,
      create: input
    })
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async eventEmailNotificationsDelete(
    @Args('input') input: EventEmailNotificationsUpdateInput,
    @Args('id') id?: string
  ): Promise<EventEmailNotifications> {
    const { userId, journeyId } = input
    const where =
      id != null ? { id } : { userId_journeyId: { userId, journeyId } }
    return await this.prismaService.eventEmailNotifications.delete({
      where
    })
  }
}
