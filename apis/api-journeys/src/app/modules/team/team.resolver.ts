import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  ResolveReference,
  Resolver
} from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import filter from 'lodash/filter'

import {
  CaslAbility,
  CaslAccessible,
  CaslPolicy
} from '@core/nest/common/CaslAuthModule'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  CustomDomain,
  Integration,
  Prisma,
  Team,
  UserTeam
} from '@core/prisma/journeys/client'

import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('Team')
export class TeamResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  @UseGuards(AppCaslGuard)
  async teams(
    @CaslAccessible('Team') accessibleTeams: Prisma.TeamWhereInput
  ): Promise<Team[]> {
    return await this.prismaService.team.findMany({
      where: { AND: [accessibleTeams] },
      include: { customDomains: { select: { id: true } } }
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
      include: { userTeams: true, customDomains: { select: { id: true } } }
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
      include: { userTeams: true, customDomains: { select: { id: true } } }
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
  async userTeams(
    @Parent() team: Team,
    @CaslAbility({ optional: true }) ability?: AppAbility
  ): Promise<UserTeam[]> {
    if (ability == null) return []
    const userTeams = await this.prismaService.team
      .findUnique({
        where: { id: team.id }
      })
      .userTeams({ include: { team: { include: { userTeams: true } } } })
    return filter(userTeams, (userTeam) =>
      ability.can(Action.Read, subject('UserTeam', userTeam))
    )
  }

  @ResolveField()
  async customDomains(
    @Parent() parent: Team & { customDomains: Array<{ id: string }> }
  ): Promise<CustomDomain[]> {
    return await this.prismaService.customDomain.findMany({
      where: { teamId: parent.id }
    })
  }

  @ResolveField()
  async integrations(@Parent() parent: Team): Promise<Integration[]> {
    const integrations = await this.prismaService.team
      .findUnique({
        where: { id: parent.id }
      })
      .integrations({
        where: { teamId: parent.id }
      })

    return integrations != null ? integrations : []
  }

  @ResolveReference()
  async resolveReference(reference: {
    __typename: 'Team'
    id: string
  }): Promise<Team | null> {
    return await this.prismaService.team.findUnique({
      where: { id: reference.id }
    })
  }
}
