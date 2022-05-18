// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators'
import {
  RadioQuestionSubmissionEvent,
  RadioQuestionSubmissionEventCreateInput
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
    return await this.eventService.save({
      ...input,
      __typename: 'RadioQuestionSubmissionEvent',
      userId
    })
  }
}
