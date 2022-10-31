// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { UserInputError } from 'apollo-server'
import {
  SignUpSubmissionEvent,
  SignUpSubmissionEventCreateInput
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
    const block: { journeyId: string } = await this.blockService.get(
      input.blockId
    )
    const journeyId = block.journeyId

    const stepBlock: { journeyId: string } | null =
      input.stepId != null ? await this.blockService.get(input.stepId) : null
    if (stepBlock == null || stepBlock.journeyId !== journeyId)
      throw new UserInputError(
        `Step ID ${
          input.stepId as string
        } does not exist on Journey with ID ${journeyId}`
      )

    const visitor = await this.eventService.getVisitorByUserIdAndJourneyId(
      userId,
      journeyId
    )

    if (visitor.name == null || visitor.email == null) {
      const name = visitor.name == null ? input.name : visitor.name
      const email = visitor.email == null ? input.email : visitor.email
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
      stepId: input.stepId,
      label: null,
      value: input.name,
      email: input.email
    })
  }
}
