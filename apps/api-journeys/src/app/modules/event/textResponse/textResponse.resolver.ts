// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'

import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'

import {
  TextResponseSubmissionEvent,
  TextResponseSubmissionEventCreateInput
} from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'
import { EventService } from '../event.service'

@Resolver('TextResponseSubmissionEvent')
export class TextResponseSubmissionEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async textResponseSubmissionEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: TextResponseSubmissionEventCreateInput
  ): Promise<TextResponseSubmissionEvent> {
    const { visitor, journeyVisitor, journeyId } =
      await this.eventService.validateBlockEvent(
        userId,
        input.blockId,
        input.stepId
      )

    const [textResponseSubmissionEvent] = await Promise.all([
      this.eventService.save({
        ...input,
        id: input.id ?? undefined,
        typename: 'TextResponseSubmissionEvent',
        visitor: { connect: { id: visitor.id } },
        createdAt: new Date().toISOString(),
        journeyId,
        stepId: input.stepId ?? undefined
      }),
      this.prismaService.visitor.update({
        where: { id: visitor.id },
        data: {
          lastTextResponse: input.value
        }
      }),
      this.prismaService.journeyVisitor.update({
        where: {
          journeyId_visitorId: {
            journeyId,
            visitorId: journeyVisitor.visitorId
          }
        },
        data: {
          lastTextResponse: input.value,
          activityCount: journeyVisitor.activityCount + 1
        }
      })
    ])
    return textResponseSubmissionEvent as TextResponseSubmissionEvent
  }
}
