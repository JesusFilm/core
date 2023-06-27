import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { subject } from '@casl/ability'
import { ForbiddenError } from 'apollo-server-errors'
import { PrismaService } from '../../lib/prisma.service'
import {
  CaslGuard,
  CaslAccessible,
  CaslAbility
} from '@core/nest/common/CaslAuthModule'
import {
  UserTeamInviteCreateInput,
  UserTeamRole
} from '../../__generated__/graphql'
import { UserTeamInvite, Prisma } from '.prisma/api-journeys-client'
import { GraphQLError } from 'graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'

@Resolver('userTeamInvite')
export class TeamResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async userTeamInvites(
    @CaslAccessible('UserTeamInvite')
    accessibleUserTeamInvites: Prisma.UserTeamInviteWhereInput,
    @Args('teamId') teamId: string
  ): Promise<UserTeamInvite[]> {
    return this.prismaService.userTeamInvite.findMany({
      where: {
        AND: [accessibleUserTeamInvites, { teamId }]
      }
    })
  }

  @Mutation()
  async userTeamInviteCreate(
    @CaslAbility() ability: AppAbility,
    @Args('teamId') teamId: string,
    @Args('input') input: UserTeamInviteCreateInput
  ): Promise<UserTeamInvite> {
    const team = await this.prismaService.team.findUnique({
      where: { id: teamId },
      include: { userTeams: true }
    })
    if (team == null)
      throw new GraphQLError('Team not found.', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.can(Action.Manage, subject('Team', team))) {
      return this.prismaService.userTeamInvite.create({
        data: {
          teamId,
          email: input.email,
          role: UserTeamRole.member
        }
      })
    }
    throw new ForbiddenError('user is not allowed to create userTeamInvite')
  }

  @Mutation()
  async userTeamInviteDelete(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('teamId') teamId: string
  ): Promise<UserTeamInvite> {
    const team = await this.prismaService.team.findUnique({
      where: { id: teamId },
      include: { userTeams: true }
    })
    if (team == null)
      throw new GraphQLError('Team not found.', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.can(Action.Manage, subject('Team', team))) {
      return this.prismaService.userTeamInvite.delete({
        where: {
          id
        }
      })
    }
    throw new ForbiddenError('user is not allowed to delete userTeamInvite')
  }
}
