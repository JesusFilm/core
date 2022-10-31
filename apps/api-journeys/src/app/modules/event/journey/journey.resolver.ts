// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { CurrentUserInfo } from '@core/nest/decorators/CurrentUserInfo'
import { v4 as uuidv4 } from 'uuid'
import {
  JourneyViewEvent,
  JourneyViewEventCreateInput
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'
import { JourneyService } from '../../journey/journey.service'
import { VisitorService } from '../../visitor/visitor.service'

@Resolver('JourneyViewEvent')
export class JourneyViewEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly journeyService: JourneyService,
    private readonly visitorService: VisitorService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async journeyViewEventCreate(
    @CurrentUserId() userId: string,
    @CurrentUserInfo() userInfo,
    @Args('input') input: JourneyViewEventCreateInput
  ): Promise<JourneyViewEvent> {
    let visitor = await this.eventService.getVisitorByUserIdAndJourneyId(
      userId,
      input.journeyId
    )

    const journey: { teamId: string; languageId: string } =
      await this.journeyService.get(input.journeyId)

    if (visitor == null) {
      visitor = await this.visitorService.save({
        id: uuidv4(),
        teamId: journey.teamId,
        userId,
        createdAt: new Date().toISOString()
      })
    }

    if (visitor.userAgent == null) {
      await this.visitorService.update(visitor.id, {
        userAgent: userInfo.userAgent
      })
    }

    return await this.eventService.save({
      ...input,
      __typename: 'JourneyViewEvent',
      visitorId: visitor.id,
      createdAt: new Date().toISOString()
    })
  }
}
