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
import { Event, Visitor, Prisma } from '.prisma/api-journeys-client'
import { FromPostgresql } from '@core/nest/decorators/FromPostgresql'
import pick from 'lodash/pick'
import { CaslAbility, CaslAccessible } from '@core/nest/common/CaslAuthModule'
import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma.service'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { VisitorUpdateInput } from '../../__generated__/graphql'
import { VisitorService, VisitorsConnection } from './visitor.service'

@Resolver('Visitor')
export class VisitorResolver {
  constructor(
    private readonly visitorService: VisitorService,
    private readonly prismaService: PrismaService
  ) {}

  @Query()
  @UseGuards(AppCaslGuard)
  async visitorsConnection(
    @CaslAccessible('Visitor') accessibleVisitors: Prisma.VisitorWhereInput,
    @Args('teamId') teamId: string,
    @Args('first') first?: number | null,
    @Args('after') after?: string | null
  ): Promise<VisitorsConnection> {
    return await this.visitorService.getList({
      filter: {
        AND: [accessibleVisitors, { teamId }]
      },
      first: first ?? 50,
      after
    })
  }

  @Query()
  @UseGuards(AppCaslGuard)
  async visitor(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<Visitor> {
    const visitor = await this.prismaService.visitor.findUnique({
      where: { id },
      include: {
        team: {
          include: { userTeams: true }
        },
        journeyVisitors: {
          include: { journey: { include: { userJourneys: true } } }
        }
      }
    })
    if (visitor == null)
      throw new GraphQLError(`visitor with id "${id}" not found`, {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.cannot(Action.Read, subject('Visitor', visitor)))
      throw new GraphQLError('user is not allowed to view visitor', {
        extensions: { code: 'FORBIDDEN' }
      })
    return visitor
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async visitorUpdate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('input') input: VisitorUpdateInput
  ): Promise<Visitor> {
    const visitor = await this.prismaService.visitor.findUnique({
      where: { id },
      include: {
        team: {
          include: { userTeams: true }
        },
        journeyVisitors: {
          include: { journey: { include: { userJourneys: true } } }
        }
      }
    })
    if (visitor == null)
      throw new GraphQLError(`visitor with id "${id}" not found`, {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.cannot(Action.Update, subject('Visitor', visitor)))
      throw new GraphQLError('user is not allowed to update visitor', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.prismaService.visitor.update({
      where: { id: visitor.id },
      data: input
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async visitorUpdateForCurrentUser(
    @CaslAbility() ability: AppAbility,
    @CurrentUserId() userId: string,
    @Args('input') input: VisitorUpdateInput
  ): Promise<Visitor | undefined> {
    const visitor = await this.prismaService.visitor.findFirst({
      where: { userId }
    })
    if (visitor == null)
      throw new GraphQLError(`visitor with userId "${userId}" not found`, {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.cannot(Action.Update, subject('Visitor', visitor)))
      throw new GraphQLError('user is not allowed to update visitor', {
        extensions: { code: 'FORBIDDEN' }
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
