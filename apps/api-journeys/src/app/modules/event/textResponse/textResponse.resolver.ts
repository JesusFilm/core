// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  TextResponseSubmissionEvent,
  TextResponseSubmissionEventCreateInput,
  Block
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'

@Resolver('TextResponseSubmissionEvent')
export class TextResponseSubmissionEventResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  @UseGuards(GqlAuthGuard)
  async textResponseSubmissionEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: TextResponseSubmissionEventCreateInput
  ): Promise<TextResponseSubmissionEvent> {
    const block: Block = await this.eventService.getBlockById(input.blockId)
    const journeyId = block.journeyId
    const stepName: string = await this.eventService.getStepHeader(
      block.parentBlockId ?? ''
    ) // should return untitled if no parentBlockId

    return await this.eventService.save({
      ...input,
      __typename: 'TextResponseSubmissionEvent',
      userId,
      createdAt: new Date().toISOString(),
      journeyId,
      stepName,
      teamId: 'team.id' // TODO: update
    })
  }
}
