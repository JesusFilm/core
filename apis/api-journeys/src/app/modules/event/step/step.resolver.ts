// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'

import {
  StepNextEvent,
  StepNextEventCreateInput,
  StepPreviousEvent,
  StepPreviousEventCreateInput
} from '../../../__generated__/graphql'
import { CurrentUserId } from '../../../lib/decorators/CurrentUserId'
import { GqlAuthGuard } from '../../../lib/GqlAuthGuard'
import { EventService } from '../event.service'

@Resolver('StepNextEvent')
export class StepNextEventResolver {
  constructor(private readonly eventService: EventService) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async stepNextEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: StepNextEventCreateInput
  ): Promise<StepNextEvent> {
    const { visitor, journeyId } = await this.eventService.validateBlockEvent(
      userId,
      input.blockId,
      input.blockId
    )

    const stepNextEvent = await this.eventService.save({
      ...input,
      id: input.id ?? undefined,
      typename: 'StepNextEvent',
      visitor: { connect: { id: visitor.id } },
      createdAt: new Date().toISOString(),
      journey: { connect: { id: journeyId } }
    })

    return stepNextEvent as StepNextEvent
  }
}

@Resolver('StepPreviousEvent')
export class StepPreviousEventResolver {
  constructor(private readonly eventService: EventService) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async stepPreviousEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: StepPreviousEventCreateInput
  ): Promise<StepPreviousEvent> {
    const { visitor, journeyId } = await this.eventService.validateBlockEvent(
      userId,
      input.blockId,
      input.blockId
    )

    const stepPreviousEvent = await this.eventService.save({
      ...input,
      id: input.id ?? undefined,
      typename: 'StepPreviousEvent',
      visitor: { connect: { id: visitor.id } },
      createdAt: new Date().toISOString(),
      journey: { connect: { id: journeyId } }
    })

    return stepPreviousEvent as StepPreviousEvent
  }
}
