// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  RadioQuestionSubmissionEvent,
  RadioQuestionSubmissionEventCreateInput,
  RadioQuestionBlock,
  RadioOptionBlock
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'

@Resolver('RadioQuestionSubmissionEvent')
export class RadioQuestionSubmissionEventResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async radioQuestionSubmissionEventCreate(
    @CurrentUserId() userId: string,
    @Args('input')
    input: RadioQuestionSubmissionEventCreateInput
  ): Promise<RadioQuestionSubmissionEvent> {
    const block = (await this.eventService.getBlockById(
      input.blockId
    )) as RadioQuestionBlock
    const radioOptionBlock = (await this.eventService.getBlockById(
      input.radioOptionBlockId
    )) as RadioOptionBlock
    const journeyId = block.journeyId
    const stepName: string =
      block.parentBlockId != null
        ? await this.eventService.getStepHeader(block.parentBlockId)
        : 'Untitled'

    return await this.eventService.save({
      ...input,
      __typename: 'RadioQuestionSubmissionEvent',
      userId,
      createdAt: new Date().toISOString(),
      journeyId,
      stepName,
      selectedOption: radioOptionBlock.label,
      teamId: 'team.id' // TODO: update
    })
  }
}
