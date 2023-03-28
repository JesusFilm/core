// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  TextResponseSubmissionEvent,
  TextResponseSubmissionEventCreateInput
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'
import { VisitorService } from '../../visitor/visitor.service'

@Resolver('TextResponseSubmissionEvent')
export class TextResponseSubmissionEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly visitorService: VisitorService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async textResponseSubmissionEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: TextResponseSubmissionEventCreateInput
  ): Promise<TextResponseSubmissionEvent> {
    const { visitor, journeyId } = await this.eventService.validateBlockEvent(
      userId,
      input.blockId,
      input.stepId
    )

    const [textResponseSubmissionEvent] = await Promise.all([
      this.eventService.save({
        ...input,
        __typename: 'TextResponseSubmissionEvent',
        visitorId: visitor.id,
        createdAt: new Date().toISOString(),
        journeyId
      }),
      this.visitorService.update(visitor.id, {
        lastTextResponse: input.value
      })
    ])
    return textResponseSubmissionEvent
  }
}
