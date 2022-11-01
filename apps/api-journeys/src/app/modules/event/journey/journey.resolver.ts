// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { CurrentUserAgent } from '@core/nest/decorators/CurrentUserAgent'
import {
  JourneyViewEvent,
  JourneyViewEventCreateInput
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'
import { VisitorService } from '../../visitor/visitor.service'

@Resolver('JourneyViewEvent')
export class JourneyViewEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly visitorService: VisitorService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async journeyViewEventCreate(
    @CurrentUserId() userId: string,
    @CurrentUserAgent() userAgent: string,
    @Args('input') input: JourneyViewEventCreateInput
  ): Promise<JourneyViewEvent> {
    const visitor = await this.visitorService.getByUserIdAndJourneyId(
      userId,
      input.journeyId
    )

    if (visitor.userAgent == null) {
      await this.visitorService.update(visitor.id, {
        userAgent
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
