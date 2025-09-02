// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'

import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { Prisma } from '@core/prisma/journeys/client'

import {
  TextResponseSubmissionEvent,
  TextResponseSubmissionEventCreateInput,
  TextResponseType
} from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'
import { IntegrationGrowthSpacesService } from '../../integration/growthSpaces/growthSpaces.service'
import { EventService } from '../event.service'

@Resolver('TextResponseSubmissionEvent')
export class TextResponseSubmissionEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly prismaService: PrismaService,
    private readonly integrationGrowthSpacesService: IntegrationGrowthSpacesService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async textResponseSubmissionEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: TextResponseSubmissionEventCreateInput
  ): Promise<TextResponseSubmissionEvent> {
    const { visitor, journeyVisitor, journeyId, block } =
      await this.eventService.validateBlockEvent(
        userId,
        input.blockId,
        input.stepId
      )
    const visitorDataUpdate: Prisma.VisitorUpdateInput = {
      lastTextResponse: input.value
    }

    if (block.type === TextResponseType.name)
      visitorDataUpdate.name = input.value

    if (block.type === TextResponseType.email) {
      visitorDataUpdate.email = input.value
    }

    if (block.type === TextResponseType.phone) {
      visitorDataUpdate.phone = input.value
    }

    const [textResponseSubmissionEvent, updatedVisitor] = await Promise.all([
      this.eventService.save({
        ...input,
        id: input.id ?? undefined,
        typename: 'TextResponseSubmissionEvent',
        visitor: { connect: { id: visitor.id } },
        createdAt: new Date().toISOString(),
        journey: { connect: { id: journeyId } },
        stepId: input.stepId ?? undefined
      }),
      this.prismaService.visitor.update({
        where: { id: visitor.id },
        data: visitorDataUpdate
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

    if (
      block.routeId != null &&
      block.integrationId != null &&
      updatedVisitor?.email != null &&
      updatedVisitor?.name != null
    )
      await this.integrationGrowthSpacesService.addSubscriber(
        journeyId,
        block,
        updatedVisitor.name,
        updatedVisitor.email
      )

    await this.eventService.sendEventsEmail(journeyId, visitor.id)

    return textResponseSubmissionEvent as TextResponseSubmissionEvent
  }
}
