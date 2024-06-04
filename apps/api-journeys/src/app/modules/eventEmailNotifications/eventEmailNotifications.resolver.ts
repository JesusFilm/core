import { Args, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { EventEmailNotifications } from '.prisma/api-journeys-client'

import { PrismaService } from '../../lib/prisma.service'

@Resolver('eventEmailNotifications')
export class eventEmailNotificationsResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async eventEmailNotificationsByJourney(
    @Args('journeyId') journeyId: string
  ): Promise<EventEmailNotifications[]> {
    const res = await this.prismaService.eventEmailNotifications.findMany({
      where: { journeyId }
    })

    if (res == null)
      throw new GraphQLError('userInvite not found', {
        extensions: { code: 'NOT_FOUND' }
      })

    return res
  }
}
