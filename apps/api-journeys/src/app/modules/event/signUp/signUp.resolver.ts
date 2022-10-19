// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  SignUpSubmissionEvent,
  SignUpSubmissionEventCreateInput,
  Block
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
    const block: Block = await this.eventService.getBlockById(input.blockId)
    const journeyId = block.journeyId

    return await this.eventService.save({
      ...input,
      __typename: 'SignUpSubmissionEvent',
      userId,
      createdAt: new Date().toISOString(),
      journeyId,
      teamId: 'team.id' // TODO: update
    })
  }
}
