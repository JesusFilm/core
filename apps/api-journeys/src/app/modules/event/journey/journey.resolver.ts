// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
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
      userId,
      createdAt: new Date().toISOString()
    })
  }

  @ResolveField('language')
  language(@Parent() journeyViewEvent): { __typename: 'Language'; id: string } {
    // 529 (english) is default if not set
    return { __typename: 'Language', id: journeyViewEvent.value ?? '529' }
  }
}
