// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  SignUpSubmissionEvent,
  SignUpSubmissionEventCreateInput,
  SignUpBlock
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'
import { BlockService } from '../../block/block.service'

@Resolver('SignUpSubmissionEvent')
export class SignUpSubmissionEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly blockService: BlockService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async signUpSubmissionEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: SignUpSubmissionEventCreateInput
  ): Promise<SignUpSubmissionEvent> {
    const block: SignUpBlock = await this.blockService.get(input.blockId)
    const journeyId = block.journeyId
    const stepName: string =
      block.parentBlockId != null
        ? await this.eventService.getStepHeader(block.parentBlockId)
        : 'Untitled'

    // TODO: check name and email in visitorTeam and update if null

    return await this.eventService.save({
      ...input,
      __typename: 'SignUpSubmissionEvent',
      userId,
      createdAt: new Date().toISOString(),
      journeyId,
      stepName,
      teamId: 'team.id' // TODO: update
    })
  }
}
