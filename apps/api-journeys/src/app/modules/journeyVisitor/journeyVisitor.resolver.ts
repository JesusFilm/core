import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { FromPostgresql } from '@core/nest/decorators/FromPostgresql'
import { Visitor } from '.prisma/api-journeys-client'
import { VisitorService } from '../visitor/visitor.service'
import { MemberService } from '../member/member.service'
import { PrismaService } from '../../lib/prisma.service'
import {
  JourneyVisitorFilter,
  JourneyVisitorSort
} from '../../__generated__/graphql'
import { JourneyVisitorsConnection } from './journeyVisitor.service'

@Resolver('JourneyVisitor')
export class JourneyVisitorResolver {
  constructor(
    private readonly visitorService: VisitorService,
    private readonly memberService: MemberService,
    private readonly prismaService: PrismaService
  ) {}

  @Query()
  async journeyVisitorCount(
    @Args('filter') filter: JourneyVisitorFilter
  ): Promise<number> {
    return await this.visitorService.getJourneyVisitorCount(filter)
  }

  @Query()
  async journeyVisitorsConnection(
    // @CurrentUserId() userId: string,
    @Args('teamId') teamId: string,
    @Args('filter') filter: JourneyVisitorFilter,
    @Args('sort') sort = JourneyVisitorSort.date,
    @Args('first') first?: number | null,
    @Args('after') after?: string | null
  ): Promise<JourneyVisitorsConnection> {
    // const memberResult = await this.memberService.getMemberByTeamId(
    //   userId,
    //   teamId
    // )

    // if (memberResult == null)
    //   throw new ForbiddenError('User is not a member of the team.')

    return await this.visitorService.getJourneyVisitorList({
      filter,
      sort,
      first: first ?? 50,
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
  async events(@Parent() visitor): Promise<Event[]> {
    return await this.prismaService.event.findMany({
      where: { visitorId: visitor.id }
    })
  }
}
