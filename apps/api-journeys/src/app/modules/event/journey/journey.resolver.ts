// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  JourneyViewEvent,
  JourneyViewEventCreateInput
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'

@Resolver('JourneyViewEvent')
export class JourneyViewEventResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async journeyViewEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: JourneyViewEventCreateInput
  ): Promise<JourneyViewEvent> {
    return await this.eventService.save({
      ...input,
      __typename: 'JourneyViewEvent',
      userId
    })
  }
}
