// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'

import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'

import {
  StepNextEvent,
  StepNextEventCreateInput,
  StepPreviousEvent,
  StepPreviousEventCreateInput,
  StepViewEvent,
  StepViewEventCreateInput
} from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'
import { EventService } from '../event.service'

@Resolver('StepViewEvent')
export class StepViewEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async stepViewEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: StepViewEventCreateInput
  ): Promise<StepViewEvent> {
    const { visitor, journeyVisitor, journeyId } =
      await this.eventService.validateBlockEvent(
        userId,
        input.blockId,
        input.blockId
      )

    const [stepViewEvent] = await Promise.all([
      this.eventService.save({
        ...input,
        id: input.id ?? undefined,
        typename: 'StepViewEvent',
        visitor: { connect: { id: visitor.id } },
        journey: { connect: { id: journeyId } },
        stepId: input.blockId ?? undefined
      }),

      this.prismaService.visitor.update({
        where: { id: visitor.id },
        data: {
          duration: Math.min(
            1200,
            Math.floor(
              Math.abs(
                new Date().getTime() - new Date(visitor.createdAt).getTime()
              ) / 1000
            )
          ),
          lastStepViewedAt: new Date()
        }
      }),
      this.prismaService.journeyVisitor.update({
        where: {
          journeyId_visitorId: {
            journeyId,
            visitorId: visitor.id
          }
        },
        data: {
          duration: Math.min(
            1200,
            Math.floor(
              Math.abs(
                new Date().getTime() -
                  new Date(journeyVisitor.createdAt).getTime()
              ) / 1000
            )
          ),
          lastStepViewedAt: new Date()
        }
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
      typename: 'StepNextEvent',
      visitor: { connect: { id: visitor.id } },
      createdAt: new Date().toISOString(),
      journey: { connect: { id: journeyId } }
    })

    return stepNextEvent as StepNextEvent
  }
}

@Resolver('StepPreviousEvent')
export class StepPreviousEventResolver {
  constructor(private readonly eventService: EventService) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async stepPreviousEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: StepPreviousEventCreateInput
  ): Promise<StepPreviousEvent> {
    const { visitor, journeyId } = await this.eventService.validateBlockEvent(
      userId,
      input.blockId,
      input.blockId
    )

    const stepPreviousEvent = await this.eventService.save({
      ...input,
      id: input.id ?? undefined,
      typename: 'StepPreviousEvent',
      visitor: { connect: { id: visitor.id } },
      createdAt: new Date().toISOString(),
      journey: { connect: { id: journeyId } }
    })

    return stepPreviousEvent as StepPreviousEvent
  }
}
