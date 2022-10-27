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
import { VisitorService } from '../../visitor/visitor.service'

@Resolver('SignUpSubmissionEvent')
export class SignUpSubmissionEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly blockService: BlockService,
    private readonly visitorSerice: VisitorService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async signUpSubmissionEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: SignUpSubmissionEventCreateInput
  ): Promise<SignUpSubmissionEvent> {
    const block: SignUpBlock = await this.blockService.get(input.blockId)
    const journeyId = block.journeyId

    const stepBlock = await this.eventService.getParentStepBlockByBlockId(
      input.blockId
    )

    const visitor = await this.eventService.getVisitorByUserIdAndTeamId(
      userId,
      journeyId
    )

    if (visitor.name !== input.name || visitor.email !== input.email) {
      const name =
        visitor.name == null || visitor.name !== input.name
          ? input.name
          : visitor.name
      const email =
        visitor.email == null || visitor.email !== input.email
          ? input.email
          : visitor.email
      await this.visitorSerice.update(visitor.id, {
        name,
        email
      })
    }

    return await this.eventService.save({
      id: input.id,
      blockId: input.blockId,
      __typename: 'SignUpSubmissionEvent',
      visitorId: visitor.id,
      createdAt: new Date().toISOString(),
      journeyId,
      stepId: stepBlock?.id,
      label: null,
      value: input.name,
      email: input.email
    })
  }
}
