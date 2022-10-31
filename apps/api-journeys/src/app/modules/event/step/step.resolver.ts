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
import { BlockService } from '../../block/block.service'

@Resolver('StepViewEvent')
export class StepViewEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly blockService: BlockService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async stepViewEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: StepViewEventCreateInput
  ): Promise<StepViewEvent> {
    const block: { journeyId: string } = await this.blockService.get(
      input.blockId
    )
    const journeyId = block.journeyId

    const visitor = await this.eventService.getVisitorByUserIdAndJourneyId(
      userId,
      journeyId
    )

    return await this.eventService.save({
      ...input,
      __typename: 'StepViewEvent',
      visitorId: visitor.id,
      createdAt: new Date().toISOString(),
      journeyId,
      stepId: input.blockId
    })
  }
}

@Resolver('StepNextEvent')
export class StepNextEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly blockService: BlockService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async stepNextEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: StepNextEventCreateInput
  ): Promise<StepNextEvent> {
    const block: { journeyId: string; parentBlockId: string } =
      await this.blockService.get(input.blockId)

    const journeyId = block.journeyId

    const visitor = await this.eventService.getVisitorByUserIdAndJourneyId(
      userId,
      journeyId
    )

    const stepName: string =
      block.parentBlockId != null
        ? await this.eventService.getStepHeader(block.parentBlockId)
        : 'Untitled'

    const nextStepName: string = await this.eventService.getStepHeader(
      input.nextStepId
    )

    return await this.eventService.save({
      ...input,
      __typename: 'StepNextEvent',
      visitorId: visitor.id,
      createdAt: new Date().toISOString(),
      journeyId,
      stepId: input.blockId,
      label: stepName,
      value: nextStepName
    })
  }
}
