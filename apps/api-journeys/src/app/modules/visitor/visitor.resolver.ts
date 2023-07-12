import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  Args,
  Resolver,
  Query,
  ResolveField,
  Parent,
  Mutation
} from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import { IResult, UAParser } from 'ua-parser-js'
import { Event, Visitor } from '.prisma/api-journeys-client'
import { FromPostgresql } from '@core/nest/decorators/FromPostgresql'
import { pick } from 'lodash'
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
    @Args('after') after?: string | null
  ): Promise<VisitorsConnection> {
    const memberResult = await this.prismaService.userTeam.findUnique({
      where: { teamId_userId: { userId, teamId } }
    })

    if (memberResult == null)
      throw new GraphQLError('User is not a member of the team.', {
        extensions: { code: 'FORBIDDEN' }
      })

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
  ): Promise<Visitor> {
    const visitor = await this.prismaService.visitor.findUnique({
      where: { id }
    })

    if (visitor == null)
      throw new GraphQLError(`Visitor with ID "${id}" does not exist`, {
        extensions: { code: 'NOT_FOUND' }
      })

    const memberResult = await this.prismaService.userTeam.findUnique({
      where: { teamId_userId: { userId, teamId: visitor.teamId } }
    })

    if (memberResult == null)
      throw new GraphQLError(
        'User is not a member of the team the visitor belongs to',
        { extensions: { code: 'FORBIDDEN' } }
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
      throw new GraphQLError(`Visitor with ID "${id}" does not exist`, {
        extensions: { code: 'NOT_FOUND' }
      })

    const memberResult = await this.prismaService.userTeam.findUnique({
      where: { teamId_userId: { userId, teamId: visitor.teamId } }
    })

    if (memberResult == null)
      throw new GraphQLError(
        'User is not a member of the team the visitor belongs to',
        { extensions: { code: 'FORBIDDEN' } }
      )

    return await this.prismaService.visitor.update({
      where: { id: visitor.id },
      data: input
    })
  }

  @Mutation()
  async visitorUpdateForCurrentUser(
    @CurrentUserId() userId: string,
    @Args('input') input
  ): Promise<Visitor | undefined> {
    const visitor = await this.prismaService.visitor.findFirst({
      where: { userId }
    })

    if (visitor == null)
      throw new GraphQLError(`No visitor record found for user "${userId}"`, {
        extensions: { code: 'NOT_FOUND' }
      })

    return await this.prismaService.visitor.update({
      where: { id: visitor.id },
      data: pick(input, ['countryCode', 'referrer'])
    })
  }

  @ResolveField()
  @FromPostgresql()
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
