// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  SignUpSubmissionEvent,
  SignUpSubmissionEventCreateInput
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'

@Resolver('SignUpSubmissionEvent')
export class SignUpSubmissionEventResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async signUpSubmissionEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: SignUpSubmissionEventCreateInput
  ): Promise<SignUpSubmissionEvent> {
    return await this.eventService.save({
      ...input,
      __typename: 'SignUpSubmissionEvent',
      userId
    })
  }
}
