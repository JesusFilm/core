// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { CurrentUserInfo } from '@core/nest/decorators/CurrentUserInfo'
import {
  JourneyViewEvent,
  JourneyViewEventCreateInput,
  Journey
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'
import { JourneyService } from '../../journey/journey.service'

@Resolver('JourneyViewEvent')
export class JourneyViewEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly journeyService: JourneyService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async journeyViewEventCreate(
    @CurrentUserId() userId: string,
    @CurrentUserInfo() userInfo,
    @Args('input') input: JourneyViewEventCreateInput
  ): Promise<JourneyViewEvent> {
    const visitor = await this.eventService.getVisitorByUserIdAndTeamId(
      userId,
      input.journeyId
    )

    const journey: Journey = await this.journeyService.get(input.journeyId)

    // TODO:  check user info in visitorTeam and update

    return await this.eventService.save({
      ...input,
      __typename: 'JourneyViewEvent',
      visitorId: visitor.id,
      createdAt: new Date().toISOString(),
      language: journey.language // TODO: update to get language from language api
    })
  }
}
