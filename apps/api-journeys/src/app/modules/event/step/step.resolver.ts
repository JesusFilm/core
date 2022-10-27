// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  StepViewEvent,
  StepViewEventCreateInput,
  StepBlock
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
    const block: StepBlock = await this.blockService.get(input.blockId)
    const journeyId = block.journeyId

    const visitor = await this.eventService.getVisitorByUserIdAndJourneyId(
      userId,
      journeyId
    )

    const stepName: string =
      block.parentBlockId != null
        ? await this.eventService.getStepHeader(block.parentBlockId)
        : 'Untitled'

    return await this.eventService.save({
      ...input,
      __typename: 'StepViewEvent',
      visitorId: visitor.id,
      createdAt: new Date().toISOString(),
      journeyId,
      stepId: input.blockId,
      label: null,
      value: stepName
    })
  }
}
