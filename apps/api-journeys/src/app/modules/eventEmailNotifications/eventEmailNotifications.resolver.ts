import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

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
    const data = await this.prismaService.eventEmailNotifications.findMany({
      where: { journeyId }
    })

    if (data.length === 0)
      throw new GraphQLError('No event email notifications found', {
        extensions: { code: 'NOT_FOUND' }
      })

    return data
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async eventEmailNotificationsUpdate(
    @Args('id') id: string,
    @Args('input') input: EventEmailNotificationsUpdateInput
  ): Promise<EventEmailNotifications> {
    const data = await this.prismaService.eventEmailNotifications.upsert({
      where: { id },
      update: input,
      create: input
    })

    if (data == null)
      throw new GraphQLError('No event email notifications found', {
        extensions: { code: 'NOT_FOUND' }
      })

    return data
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async eventEmailNotificationsDelete(
    @Args('id') id: string
  ): Promise<EventEmailNotifications> {
    const data = await this.prismaService.eventEmailNotifications.delete({
      where: { id }
    })

    if (data == null)
      throw new GraphQLError('Event email notifications not found', {
        extensions: { code: 'NOT_FOUND' }
      })

    return data
  }
}
