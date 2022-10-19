// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { CurrentUserInfo } from '@core/nest/decorators/CurrentUserInfo'
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
    @CurrentUserInfo() userInfo,
    @Args('input') input: JourneyViewEventCreateInput
  ): Promise<JourneyViewEvent> {
    return await this.eventService.save({
      ...input,
      ...userInfo,
      __typename: 'JourneyViewEvent',
      userId,
      createdAt: new Date().toISOString(),
      teamId: 'team.id' // TODO: update
    })
  }
}
