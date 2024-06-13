import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'

import { JourneyNotification } from '.prisma/api-journeys-client'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'

import { JourneyNotificationUpdateInput } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('JourneyNotification')
export class JourneyNotificationResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async journeyNotificationUpdate(
    @CurrentUserId() userId: string,
    @Args('input') input: JourneyNotificationUpdateInput
  ): Promise<JourneyNotification> {
    const { journeyId } = input
    const journey = await this.prismaService.journey.findUnique({
      where: { id: journeyId },
      include: { team: { include: { userTeams: true } }, userJourneys: true }
    })
    const userJourneyId = journey?.userJourneys?.find(
      (userJourney) => userJourney.userId === userId
    )?.id
    const userTeamId = journey?.team?.userTeams?.find(
      (userTeam) => userTeam.userId === userId
    )?.id

    const upsertInput = {
      ...input,
      userJourneyId,
      userTeamId
    }

    return await this.prismaService.journeyNotification.upsert({
      where: { userId_journeyId: { userId, journeyId } },
      update: upsertInput,
      create: { userId, ...upsertInput }
    })
  }
}
