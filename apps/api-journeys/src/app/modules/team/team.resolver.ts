import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent
} from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { Team, Prisma } from '.prisma/api-journeys-client'
import { subject } from '@casl/ability'
import { GraphQLError } from 'graphql'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  CaslAbility,
  CaslAccessible,
  CaslPolicy
} from '@core/nest/common/CaslAuthModule'
import { PrismaService } from '../../lib/prisma.service'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { UserTeamRole, UserTeamsConnection } from '../../__generated__/graphql'

@Resolver('Team')
export class TeamResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  @UseGuards(AppCaslGuard)
  async teams(
    @CaslAccessible('Team') accessibleTeams: Prisma.TeamWhereInput
  ): Promise<Team[]> {
    return await this.prismaService.team.findMany({
      where: accessibleTeams
    })
  }

  @Query()
  @UseGuards(AppCaslGuard)
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
  @UseGuards(AppCaslGuard)
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
  @UseGuards(AppCaslGuard)
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

  @ResolveField()
  async userTeamsConnection(
    @CaslAccessible('UserTeam') accessibleUserTeams: Prisma.UserTeamWhereInput,
    @Parent() team: Team,
    @Args('first') first = 50,
    @Args('after') after?: string | null
  ): Promise<UserTeamsConnection> {
    const result = await this.prismaService.userTeam.findMany({
      where: { AND: [accessibleUserTeams, { teamId: team.id }] },
      cursor: after != null ? { id: after } : undefined,
      orderBy: { role: 'asc' },
      skip: after == null ? 0 : 1,
      take: first + 1
    })

    const sendResult = result.length > first ? result.slice(0, -1) : result
    return {
      edges: sendResult.map((userTeam) => ({
        node: {
          ...userTeam,
          role: userTeam.role as UserTeamRole,
          createdAt: userTeam.createdAt.toISOString(),
          updatedAt: userTeam.createdAt.toISOString(),
          user: { id: userTeam.userId }
        },
        cursor: userTeam.id
      })),
      pageInfo: {
        hasNextPage: result.length > first,
        startCursor: result.length > 0 ? result[0].id : null,
        endCursor:
          result.length > 0 ? sendResult[sendResult.length - 1].id : null
      },
      totalCount: await this.prismaService.userTeam.count({
        where: { AND: [accessibleUserTeams, { teamId: team.id }] }
      })
    }
  }
}
