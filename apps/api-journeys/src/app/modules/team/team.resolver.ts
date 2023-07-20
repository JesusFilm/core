import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { Team, Prisma } from '.prisma/api-journeys-client'
import { subject } from '@casl/ability'
import { GraphQLError } from 'graphql'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  CaslAbility,
  CaslAccessible,
  CaslPolicy,
  CaslGuard
} from '@core/nest/common/CaslAuthModule'
import { PrismaService } from '../../lib/prisma.service'
import { Action, AppAbility } from '../../lib/casl/caslFactory'

@Resolver('Team')
export class TeamResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  @UseGuards(GqlAuthGuard, CaslGuard)
  async teams(
    @CaslAccessible('Team') accessibleTeams: Prisma.TeamWhereInput
  ): Promise<Team[]> {
    return await this.prismaService.team.findMany({
      where: accessibleTeams
    })
  }

  @Query()
  @UseGuards(GqlAuthGuard, CaslGuard)
  async team(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<Team> {
    const team = await this.prismaService.team.findUnique({
      where: { id },
      include: { userTeams: true }
    })
    if (team == null)
      throw new GraphQLError('team not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.can(Action.Read, subject('Team', team))) return team
    throw new GraphQLError('user is not allowed to view team', {
      extensions: { code: 'FORBIDDEN' }
    })
  }

  @Mutation()
  @UseGuards(GqlAuthGuard, CaslGuard)
  @CaslPolicy((ability) => ability.can(Action.Create, 'Team'))
  async teamCreate(
    @CurrentUserId() userId: string,
    @Args('input') data
  ): Promise<Team> {
    return await this.prismaService.team.create({
      data: { ...data, userTeams: { create: { userId, role: 'manager' } } }
    })
  }

  @Mutation()
  @UseGuards(GqlAuthGuard, CaslGuard)
  async teamUpdate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('input') data
  ): Promise<Team | undefined> {
    const team = await this.prismaService.team.findUnique({
      where: { id },
      include: { userTeams: true }
    })
    if (team == null)
      throw new GraphQLError('team not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.can(Action.Update, subject('Team', team)))
      return await this.prismaService.team.update({
        where: { id },
        data
      })
    throw new GraphQLError('user is not allowed to update team', {
      extensions: { code: 'FORBIDDEN' }
    })
  }
}
