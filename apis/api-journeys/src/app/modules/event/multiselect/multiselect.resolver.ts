import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'

import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'

// Using runtime-safe types to avoid tight coupling with generated types
import { PrismaService } from '../../../lib/prisma.service'
import { EventService } from '../event.service'

@Resolver('MultiselectSubmissionEvent')
export class MultiselectSubmissionEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async multiselectSubmissionEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: any
  ): Promise<any> {
    const { visitor, journeyVisitor, journeyId } =
      await this.eventService.validateBlockEvent(
        userId,
        input.blockId,
        input.stepId
      )

    const [saved] = await Promise.all([
      this.eventService.save({
        id: input.id ?? undefined,
        blockId: input.blockId,
        typename: 'MultiselectSubmissionEvent',
        visitor: { connect: { id: visitor.id } },
        stepId: input.stepId ?? undefined,
        journey: { connect: { id: journeyId } },
        label: input.label ?? undefined,
        value: input.values.join(', ')
      }),
      this.prismaService.journeyVisitor.update({
        where: { journeyId_visitorId: { journeyId, visitorId: visitor.id } },
        data: { activityCount: journeyVisitor.activityCount + 1 }
      })
    ])

    const savedEvent: { id: string; createdAt: string } = saved as any
    const result = {
      __typename: 'MultiselectSubmissionEvent',
      id: savedEvent.id,
      journeyId: journeyId,
      createdAt: savedEvent.createdAt as any,
      label: input.label ?? null,
      // GraphQL exposes array under "value" for this type per generated typing
      value: input.values
    }

    return result
  }
}
