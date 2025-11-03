import { UseGuards } from '@nestjs/common'
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { CaslAccessible } from '@core/nest/common/CaslAuthModule'
import { FromPostgresql } from '@core/nest/decorators/FromPostgresql'
import {
  Event,
  JourneyVisitor,
  Prisma,
  Visitor
} from '@core/prisma/journeys/client'

import {
  JourneyVisitorFilter,
  JourneyVisitorSort
} from '../../__generated__/graphql'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'

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
  @UseGuards(AppCaslGuard)
  async journeyVisitorCount(
    @CaslAccessible('JourneyVisitor')
    accessibleJourneyVisitors: Prisma.JourneyVisitorWhereInput,
    @Args('filter') filter: JourneyVisitorFilter
  ): Promise<number> {
    return await this.journeyVisitorService.getJourneyVisitorCount({
      AND: [
        accessibleJourneyVisitors,
        this.journeyVisitorService.generateWhere(filter)
      ]
    })
  }

  @Query()
  @UseGuards(AppCaslGuard)
  async journeyVisitorsConnection(
    @CaslAccessible('JourneyVisitor')
    accessibleJourneyVisitors: Prisma.JourneyVisitorWhereInput,
    @Args('filter') filter: JourneyVisitorFilter,
    @Args('sort') sort = JourneyVisitorSort.date,
    @Args('first') first = 50,
    @Args('after') after?: string | null
  ): Promise<JourneyVisitorsConnection> {
    return await this.journeyVisitorService.getJourneyVisitorList({
      filter: {
        AND: [
          accessibleJourneyVisitors,
          this.journeyVisitorService.generateWhere(filter)
        ]
      },
      sort,
      first,
      after
    })
  }

  @ResolveField()
  async visitor(@Parent() journeyVisitor: JourneyVisitor): Promise<Visitor> {
    const visitor = await this.prismaService.visitor.findUnique({
      where: { id: journeyVisitor.visitorId }
    })
    if (visitor == null)
      throw new GraphQLError(
        `visitor with id "${journeyVisitor.visitorId}" not found`,
        {
          extensions: { code: 'NOT_FOUND' }
        }
      )
    return visitor
  }

  @ResolveField()
  @FromPostgresql()
  async events(@Parent() journeyVisitor: JourneyVisitor): Promise<Event[]> {
    return await this.prismaService.event.findMany({
      where: {
        visitorId: journeyVisitor.visitorId,
        journeyId: journeyVisitor.journeyId
      }
    })
  }
}
