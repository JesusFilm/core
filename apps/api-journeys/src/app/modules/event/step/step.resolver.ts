// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  StepNextEvent,
  StepNextEventCreateInput,
  StepViewEvent,
  StepViewEventCreateInput
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'
import { VisitorService } from '../../visitor/visitor.service'

@Resolver('StepViewEvent')
export class StepViewEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly visitorService: VisitorService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async stepViewEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: StepViewEventCreateInput
  ): Promise<StepViewEvent> {
    const { visitor, journeyId } = await this.eventService.validateBlockEvent(
      userId,
      input.blockId,
      input.blockId
    )

    const [, stepViewEvent] = await Promise.all([
      this.visitorService.update(visitor.id, {
        lastEventAt: new Date().toISOString()
      }),
      this.eventService.save({
        ...input,
        __typename: 'StepViewEvent',
        visitorId: visitor.id,
        createdAt: new Date().toISOString(),
        journeyId,
        stepId: input.blockId
      })
    ])

    return stepViewEvent
  }
}

@Resolver('StepNextEvent')
export class StepNextEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly visitorService: VisitorService
  ) {}

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

    void this.visitorService.update(visitor.id, {
      lastEventAt: new Date().toISOString()
    })

    return await this.eventService.save({
      ...input,
      __typename: 'StepNextEvent',
      visitorId: visitor.id,
      createdAt: new Date().toISOString(),
      journeyId
    })
  }
}
