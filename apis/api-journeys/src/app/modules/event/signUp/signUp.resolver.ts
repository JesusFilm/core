// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'

import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'

import {
  SignUpSubmissionEvent,
  SignUpSubmissionEventCreateInput
} from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'
import { EventService } from '../event.service'

@Resolver('SignUpSubmissionEvent')
export class SignUpSubmissionEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async signUpSubmissionEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: SignUpSubmissionEventCreateInput
  ): Promise<SignUpSubmissionEvent> {
    const { visitor, journeyVisitor, journeyId } =
      await this.eventService.validateBlockEvent(
        userId,
        input.blockId,
        input.stepId
      )

    const promises = [
      this.eventService.save({
        id: input.id ?? undefined,
        blockId: input.blockId,
        typename: 'SignUpSubmissionEvent',
        visitor: { connect: { id: visitor.id } },
        createdAt: new Date().toISOString(),
        journey: { connect: { id: journeyId } },
        stepId: input.stepId ?? undefined,
        label: null,
        value: input.name,
        email: input.email
      })
    ]

    let req = {}
    if (visitor.name == null) {
      req = {
        name: input.name
      }
    }
    if (visitor.email == null) {
      req = {
        ...req,
        email: input.email
      }
    }
    if (req != null) {
      promises.push(
        this.prismaService.visitor.update({
          where: { id: visitor.id },
          data: req
        })
      )
      promises.push(
        this.prismaService.journeyVisitor.update({
          where: { journeyId_visitorId: { journeyId, visitorId: visitor.id } },
          data: { activityCount: journeyVisitor.activityCount + 1 }
        })
      )
    }

    await this.eventService.sendEventsEmail(journeyId, visitor.id)

    const [signUpSubmissionEvent] = await Promise.all(promises)
    return signUpSubmissionEvent as SignUpSubmissionEvent
  }
}
