// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'

import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'

import {
  RadioQuestionSubmissionEvent,
  RadioQuestionSubmissionEventCreateInput
} from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'
import { EventService } from '../event.service'

@Resolver('RadioQuestionSubmissionEvent')
export class RadioQuestionSubmissionEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async radioQuestionSubmissionEventCreate(
    @CurrentUserId() userId: string,
    @Args('input')
    input: RadioQuestionSubmissionEventCreateInput
  ): Promise<RadioQuestionSubmissionEvent> {
    const { visitor, journeyVisitor, journeyId } =
      await this.eventService.validateBlockEvent(
        userId,
        input.blockId,
        input.stepId
      )
    const data = {
      lastRadioQuestion: input.label ?? undefined,
      lastRadioOptionSubmission: input.value ?? undefined
    }
    const [radioSubmissionEvent] = await Promise.all([
      this.eventService.save({
        ...input,
        id: input.id ?? undefined,
        typename: 'RadioQuestionSubmissionEvent',
        visitor: { connect: { id: visitor.id } },
        stepId: input.stepId ?? undefined,
        journey: { connect: { id: journeyId } }
      }),
      this.prismaService.visitor.update({ where: { id: visitor.id }, data }),
      this.prismaService.journeyVisitor.update({
        where: { journeyId_visitorId: { journeyId, visitorId: visitor.id } },
        data: { ...data, activityCount: journeyVisitor.activityCount + 1 }
      })
    ])
    return radioSubmissionEvent as RadioQuestionSubmissionEvent
  }
}
