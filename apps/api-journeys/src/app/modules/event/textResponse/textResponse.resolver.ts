// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  TextResponseSubmissionEvent,
  TextResponseSubmissionEventCreateInput,
  TextResponseBlock
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'
import { BlockService } from '../../block/block.service'

@Resolver('TextResponseSubmissionEvent')
export class TextResponseSubmissionEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly blockService: BlockService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async textResponseSubmissionEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: TextResponseSubmissionEventCreateInput
  ): Promise<TextResponseSubmissionEvent> {
    const block: TextResponseBlock = await this.blockService.get(input.blockId)
    const journeyId = block.journeyId

    const stepBlock = await this.eventService.getParentStepBlockByBlockId(
      input.blockId
    )

    const visitor = await this.eventService.getVisitorByUserIdAndTeamId(
      userId,
      journeyId
    )

    const stepName: string =
      block.parentBlockId != null
        ? await this.eventService.getStepHeader(block.parentBlockId)
        : 'Untitled'

    return await this.eventService.save({
      ...input,
      __typename: 'TextResponseSubmissionEvent',
      visitorId: visitor.id,
      createdAt: new Date().toISOString(),
      journeyId,
      stepId: stepBlock?.id,
      label: stepName
    })
  }
}
