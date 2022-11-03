// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { UserInputError } from 'apollo-server'
import {
  StepNextEvent,
  StepNextEventCreateInput,
  StepViewEvent,
  StepViewEventCreateInput
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
    const { visitor, journeyId } = await this.eventService.validateBlockEvent(
      userId,
      input.blockId,
      input.blockId
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
    private readonly blockService: BlockService,
    private readonly visitorService: VisitorService
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

    const visitor = await this.visitorService.getByUserIdAndJourneyId(
      userId,
      journeyId
    )

    const validStep = await this.blockService.validateBlock(
      input.nextStepId ?? null,
      'journeyId',
      journeyId
    )

    if (!validStep) {
      throw new UserInputError(
        `Next step ID ${
          input.nextStepId as string
        } does not exist on Journey with ID ${journeyId}`
      )
    }

    return await this.eventService.save({
      ...input,
      __typename: 'StepNextEvent',
      visitorId: visitor.id,
      createdAt: new Date().toISOString(),
      journeyId
    })
  }
}
