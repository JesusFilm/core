import { Args, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { UserJourneyNotification } from '.prisma/api-journeys-client'

import { PrismaService } from '../../lib/prisma.service'

@Resolver('UserJourneyNotification')
export class UserJourneyNotificationResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async userJourneyNotification(
    @Args('userId') userId: string,
    @Args('journeyId') journeyId: string
  ): Promise<UserJourneyNotification> {
    const res = await this.prismaService.userJourneyNotification.findUnique({
      where: { userId_journeyId: { userId, journeyId } }
    })

    if (res == null)
      throw new GraphQLError('userInvite not found', {
        extensions: { code: 'NOT_FOUND' }
      })

    return res
  }
}
