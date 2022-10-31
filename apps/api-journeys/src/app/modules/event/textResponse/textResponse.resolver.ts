// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { UserInputError } from 'apollo-server'
import {
  TextResponseSubmissionEvent,
  TextResponseSubmissionEventCreateInput
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'
import { BlockService } from '../../block/block.service'

@Resolver('TextResponseSubmissionEvent')
export class TextResponseSubmissionEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly blockService: BlockService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async textResponseSubmissionEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: TextResponseSubmissionEventCreateInput
  ): Promise<TextResponseSubmissionEvent> {
    const block: { journeyId: string } = await this.blockService.get(
      input.blockId
    )

    const journeyId = block.journeyId

    const stepBlock: { journeyId: string } | null =
      input.stepId != null ? await this.blockService.get(input.stepId) : null
    if (stepBlock == null || stepBlock.journeyId !== journeyId)
      throw new UserInputError(
        `Step ID ${
          input.stepId as string
        } does not exist on Journey with ID ${journeyId}`
      )

    const visitor = await this.eventService.getVisitorByUserIdAndJourneyId(
      userId,
      journeyId
    )

    return await this.eventService.save({
      ...input,
      __typename: 'TextResponseSubmissionEvent',
      visitorId: visitor.id,
      createdAt: new Date().toISOString(),
      journeyId
    })
  }
}
