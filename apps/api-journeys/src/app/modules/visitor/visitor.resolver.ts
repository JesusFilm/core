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
import { Event, Visitor } from '.prisma/api-journeys-client'
import { VisitorConnectionFilter } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { VisitorService, VisitorsConnection } from './visitor.service'

@Resolver('Visitor')
export class VisitorResolver {
  constructor(
    private readonly visitorService: VisitorService,
    private readonly prismaService: PrismaService
  ) {}

  @Query()
  async visitorsConnection(
    @CurrentUserId() userId: string,
    @Args('teamId') teamId: string,
    @Args('first') first?: number | null,
    @Args('after') after?: string | null,
    @Args('filter') filter = VisitorConnectionFilter.all
  ): Promise<VisitorsConnection> {
    const memberResult = await this.prismaService.member.findUnique({
      where: { teamId_userId: { userId, teamId } }
    })

    if (memberResult == null)
      throw new ForbiddenError('User is not a member of the team.')

    return await this.visitorService.getList({
      filter: { teamId, filter },
      first: first ?? 50,
      after
    })
  }

  @Query()
  async visitor(
    @CurrentUserId() userId: string,
    @Args('id') id: string
  ): Promise<Visitor> {
    const visitor = await this.prismaService.visitor.findUnique({
      where: { id }
    })

    if (visitor == null)
      throw new UserInputError(`Visitor with ID "${id}" does not exist`)

    const memberResult = await this.prismaService.member.findUnique({
      where: { teamId_userId: { userId, teamId: visitor.teamId } }
    })

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
  ): Promise<Visitor | undefined> {
    const visitor = await this.prismaService.visitor.findUnique({
      where: { id }
    })

    if (visitor == null)
      throw new UserInputError(`Visitor with ID "${id}" does not exist`)

    const memberResult = await this.prismaService.member.findUnique({
      where: { teamId_userId: { userId, teamId: visitor.teamId } }
    })

    if (memberResult == null)
      throw new ForbiddenError(
        'User is not a member of the team the visitor belongs to'
      )

    return await this.prismaService.visitor.update({
      where: { id },
      data: input
    })
  }

  @ResolveField()
  async events(@Parent() visitor): Promise<Event[]> {
    return await this.prismaService.event.findMany({
      where: { visitorId: visitor.id }
    })
  }

  @ResolveField()
  userAgent(@Parent() visitor): IResult | undefined {
    if (visitor.userAgent != null)
      return new UAParser(visitor.userAgent).getResult()
  }
}
