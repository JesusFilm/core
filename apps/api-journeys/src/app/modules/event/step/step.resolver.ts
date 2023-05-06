// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  StepNextEvent,
  StepNextEventCreateInput,
  StepViewEvent,
  StepViewEventCreateInput
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'
import { VisitorService } from '../../visitor/visitor.service'
import { PrismaService } from '../../../lib/prisma.service'

@Resolver('StepViewEvent')
export class StepViewEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly visitorService: VisitorService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async stepViewEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: StepViewEventCreateInput
  ): Promise<StepViewEvent> {
    const { visitor, journeyId } = await this.eventService.validateBlockEvent(
      userId,
      input.blockId,
      input.blockId
    )
    const date = new Date()

    const [stepViewEvent] = await Promise.all([
      this.eventService.save({
        ...input,
        id: input.id ?? undefined,
        __typename: 'StepViewEvent',
        visitorId: visitor.id,
        journeyId,
        stepId: input.blockId ?? undefined
      }),
      this.visitorService.update(visitor.id, {
        duration: Math.abs(date - visitor.createdAt) / 1000,
        lastStepViewedAt: date
      })
    ])
    return stepViewEvent as StepViewEvent
  }
}

@Resolver('StepNextEvent')
export class StepNextEventResolver {
  constructor(private readonly eventService: EventService) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async stepNextEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: StepNextEventCreateInput
  ): Promise<StepNextEvent> {
    const { visitor, journeyId } = await this.eventService.validateBlockEvent(
      userId,
      input.blockId,
      input.blockId
    )

    const stepNextEvent = await this.eventService.save({
      ...input,
      id: input.id ?? undefined,
      __typename: 'StepNextEvent',
      visitorId: visitor.id,
      journeyId
    })

    return stepNextEvent as StepNextEvent
  }
}
