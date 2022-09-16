// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  TextFieldSubmissionEvent,
  TextFieldSubmissionEventCreateInput
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'

@Resolver('TextFieldSubmissionEvent')
export class TextFieldSubmissionEventResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async textFieldSubmissionEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: TextFieldSubmissionEventCreateInput
  ): Promise<TextFieldSubmissionEvent> {
    return await this.eventService.save({
      ...input,
      __typename: 'TextFieldSubmissionEvent',
      userId
    })
  }
}
