import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { FromPostgresql } from '@core/nest/decorators/FromPostgresql'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { ForbiddenError } from 'apollo-server-errors'
import { Visitor, Event } from '.prisma/api-journeys-client'
import { PrismaService } from '../../lib/prisma.service'
import {
  JourneyVisitorFilter,
  JourneyVisitorSort
} from '../../__generated__/graphql'
import {
  JourneyVisitorService,
  JourneyVisitorsConnection
} from './journeyVisitor.service'

@Resolver('JourneyVisitor')
export class JourneyVisitorResolver {
  constructor(
    private readonly journeyVisitorService: JourneyVisitorService,
    private readonly prismaService: PrismaService
  ) {}

  @Query()
  async journeyVisitorCount(
    @Args('filter') filter: JourneyVisitorFilter
  ): Promise<number> {
    return await this.journeyVisitorService.getJourneyVisitorCount(filter)
  }

  @Query()
  async journeyVisitorsConnection(
    @CurrentUserId() userId: string,
    @Args('teamId') teamId: string,
    @Args('filter') filter: JourneyVisitorFilter,
    @Args('sort') sort = JourneyVisitorSort.date,
    @Args('first') first = 50,
    @Args('after') after?: string | null
  ): Promise<JourneyVisitorsConnection> {
    const memberResult = await this.prismaService.userTeam.findUnique({
      where: { teamId_userId: { userId, teamId } }
    })

    if (memberResult == null)
      throw new ForbiddenError('User is not a member of the team.')

    return await this.journeyVisitorService.getJourneyVisitorList({
      filter,
      sort,
      first,
      after
    })
  }

  @ResolveField()
  async visitor(@Parent() journeyVisitor): Promise<Visitor | null> {
    return await this.prismaService.visitor.findUnique({
      where: { id: journeyVisitor.visitorId }
    })
  }

  @ResolveField()
  @FromPostgresql()
  async events(@Parent() journeyVisitor): Promise<Event[]> {
    return await this.prismaService.event.findMany({
      where: {
        visitorId: journeyVisitor.visitorId,
        journeyId: journeyVisitor.journeyId
      }
    })
  }
}
