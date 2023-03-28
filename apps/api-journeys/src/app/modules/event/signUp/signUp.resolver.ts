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
import { VisitorService } from '../../visitor/visitor.service'

@Resolver('SignUpSubmissionEvent')
export class SignUpSubmissionEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly visitorService: VisitorService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async signUpSubmissionEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: SignUpSubmissionEventCreateInput
  ): Promise<SignUpSubmissionEvent> {
    const { visitor, journeyId } = await this.eventService.validateBlockEvent(
      userId,
      input.blockId,
      input.stepId
    )

    const promiseArray = [
      this.eventService.save({
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
    ]

    if (visitor.name == null) {
      promiseArray.push(
        this.visitorService.update(visitor.id, {
          name: input.name
        })
      )
    }

    if (visitor.email == null) {
      promiseArray.push(
        this.visitorService.update(visitor.id, {
          email: input.email
        })
      )
    }

    const [SignUpSubmissionEvent] = await Promise.all([...promiseArray])
    return SignUpSubmissionEvent
  }
}
