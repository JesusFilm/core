// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  StepNextEventCreateInput,
  StepViewEvent,
  StepViewEventCreateInput,
  StepNextEvent
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'

@Resolver('StepViewEvent')
export class StepViewEventResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async stepViewEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: StepViewEventCreateInput
  ): Promise<StepViewEvent> {
    return await this.eventService.save({
      ...input,
      __typename: 'StepViewEvent',
      userId,
      createdAt: new Date().toISOString()
    })
  }
}

@Resolver('StepNextEvent')
export class StepNextEventResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async stepNextEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: StepNextEventCreateInput
  ): Promise<StepNextEvent> {
    return await this.eventService.save({
      ...input,
      __typename: 'StepNextEvent',
      userId,
      createdAt: new Date().toISOString()
    })
  }
}
