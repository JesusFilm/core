// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'

import { CurrentUserAgent } from '@core/nest/decorators/CurrentUserAgent'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'

import {
  JourneyViewEvent,
  JourneyViewEventCreateInput
} from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'
import { VisitorService } from '../../visitor/visitor.service'
import { EventService, ONE_DAY } from '../event.service'

@Resolver('JourneyViewEvent')
export class JourneyViewEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly visitorService: VisitorService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async journeyViewEventCreate(
    @CurrentUserId() userId: string,
    @CurrentUserAgent() userAgent: string,
    @Args('input') input: JourneyViewEventCreateInput
  ): Promise<JourneyViewEvent | undefined> {
    const journey = await this.prismaService.journey.findUnique({
      where: { id: input.journeyId }
    })
    if (journey == null)
      throw new GraphQLError('Journey does not exist', {
        extensions: { code: 'NOT_FOUND' }
      })

    const visitorAndJourneyVisitor =
      await this.visitorService.getByUserIdAndJourneyId(userId, input.journeyId)

    if (visitorAndJourneyVisitor == null) {
      throw new GraphQLError('Visitor does not exist', {
        extensions: { code: 'NOT_FOUND' }
      })
    }

    const { visitor } = visitorAndJourneyVisitor

    const existingEvent = await this.prismaService.event.findFirst({
      where: {
        typename: 'JourneyViewEvent',
        journeyId: input.journeyId,
        visitorId: visitor.id,
        createdAt: {
          gte: new Date(Date.now() - ONE_DAY * 1000)
        }
      }
    })

    if (existingEvent == null) {
      const promises = [
        this.eventService.save({
          ...omit(input, 'journeyId'),
          id: input.id ?? undefined,
          typename: 'JourneyViewEvent',
          visitor: { connect: { id: visitor.id } },
          journey: { connect: { id: input.journeyId } }
        })
      ]

      if (visitor.userAgent == null) {
        promises.push(
          this.prismaService.visitor.update({
            where: { id: visitor.id },
            data: {
              userAgent
            }
          })
        )
      }

      const [journeyViewEvent] = await Promise.all(promises)
      return journeyViewEvent as JourneyViewEvent
    }
  }

  @ResolveField('language')
  language(@Parent() journeyViewEvent): { __typename: 'Language'; id: string } {
    // 529 (english) is default if not set
    return { __typename: 'Language', id: journeyViewEvent.value ?? '529' }
  }
}
