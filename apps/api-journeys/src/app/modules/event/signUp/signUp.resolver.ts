// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators'
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
    @Args('input') input: SignUpSubmissionEventCreateInput & { __typename }
  ): Promise<SignUpSubmissionEvent> {
    input.__typename = 'SignUpSubmissionEvent'
    return await this.eventService.save({ ...input, userId })
  }
}
