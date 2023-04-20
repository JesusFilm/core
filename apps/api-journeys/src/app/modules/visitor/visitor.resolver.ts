import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  Args,
  Resolver,
  Query,
  ResolveField,
  Parent,
  Mutation
} from '@nestjs/graphql'
import { ForbiddenError, UserInputError } from 'apollo-server-errors'
import { IResult, UAParser } from 'ua-parser-js'
import { Event, VisitorsConnection } from '../../__generated__/graphql'
import { EventService } from '../event/event.service'
import { MemberService } from '../member/member.service'
import { VisitorService, VisitorRecord } from './visitor.service'
import { Inject } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('Visitor')
export class VisitorResolver {
  constructor(
    private readonly visitorService: VisitorService,
    private readonly memberService: MemberService,
    private readonly eventService: EventService,
    @Inject(PrismaService) private readonly prismaService: PrismaService
  ) {}

  @Query()
  async visitorsConnection(
    @CurrentUserId() userId: string,
    @Args('teamId') teamId: string,
    @Args('first') first?: number | null,
    @Args('after') after?: string | null
  ): Promise<VisitorsConnection> {
    const memberResult = await this.memberService.getMemberByTeamId(
      userId,
      teamId
    )

    if (memberResult == null)
      throw new ForbiddenError('User is not a member of the team.')

    return await this.visitorService.getList({
      filter: { teamId },
      first: first ?? 50,
      after
    })
  }

  @Query()
  async visitor(
    @CurrentUserId() userId: string,
    @Args('id') id: string
  ): Promise<VisitorRecord> {
    const visitor = await this.visitorService.get(id)

    if (visitor == null)
      throw new UserInputError(`Visitor with ID "${id}" does not exist`)

    const memberResult = await this.memberService.getMemberByTeamId(
      userId,
      visitor.teamId
    )

    if (memberResult == null)
      throw new ForbiddenError(
        'User is not a member of the team the visitor belongs to'
      )

    return visitor
  }

  @Mutation()
  async visitorUpdate(
    @CurrentUserId() userId: string,
    @Args('id') id: string,
    @Args('input') input
  ): Promise<VisitorRecord | undefined> {
    const visitor = await this.visitorService.get(id)

    if (visitor == null)
      throw new UserInputError(`Visitor with ID "${id}" does not exist`)

    const memberResult = await this.memberService.getMemberByTeamId(
      userId,
      visitor.teamId
    )

    if (memberResult == null)
      throw new ForbiddenError(
        'User is not a member of the team the visitor belongs to'
      )

    return await this.visitorService.update(id, input)
  }

  @ResolveField()
  async events(@Parent() visitor): Promise<Event[]> {
    return await this.eventService.getAllByVisitorId(visitor.id)
  }

  @ResolveField()
  userAgent(@Parent() visitor): IResult | undefined {
    if (visitor.userAgent != null)
      return new UAParser(visitor.userAgent).getResult()
  }
}
