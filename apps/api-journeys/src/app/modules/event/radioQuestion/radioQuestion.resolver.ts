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
import { VisitorService } from '../../visitor/visitor.service'

@Resolver('RadioQuestionSubmissionEvent')
export class RadioQuestionSubmissionEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly visitorService: VisitorService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async radioQuestionSubmissionEventCreate(
    @CurrentUserId() userId: string,
    @Args('input')
    input: RadioQuestionSubmissionEventCreateInput
  ): Promise<RadioQuestionSubmissionEvent> {
    const { visitor, journeyId } = await this.eventService.validateBlockEvent(
      userId,
      input.blockId,
      input.stepId
    )

    const [radioSubmissionEvent] = await Promise.all([
      this.eventService.save({
        ...input,
        id: input.id ?? undefined,
        __typename: 'RadioQuestionSubmissionEvent',
        visitorId: visitor.id,
        stepId: input.stepId ?? undefined,
        journeyId
      }),
      this.visitorService.update(visitor.id, {
        lastRadioQuestion: input.label ?? undefined,
        lastRadioOptionSubmission: input.value ?? undefined
      })
    ])
    return radioSubmissionEvent as RadioQuestionSubmissionEvent
  }
}
