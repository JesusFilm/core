// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  RadioQuestionSubmissionEvent,
  RadioQuestionSubmissionEventCreateInput
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'
import { BlockService } from '../../block/block.service'

@Resolver('RadioQuestionSubmissionEvent')
export class RadioQuestionSubmissionEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly blockService: BlockService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async radioQuestionSubmissionEventCreate(
    @CurrentUserId() userId: string,
    @Args('input')
    input: RadioQuestionSubmissionEventCreateInput
  ): Promise<RadioQuestionSubmissionEvent> {
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
      __typename: 'RadioQuestionSubmissionEvent',
      visitorId: visitor.id,
      createdAt: new Date().toISOString(),
      journeyId
    })
  }
}
