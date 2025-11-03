import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver
} from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { CaslAbility, CaslAccessible } from '@core/nest/common/CaslAuthModule'
import { Prisma, UserTeam } from '@core/prisma/journeys/client'

import {
  JourneyNotification,
  UserTeamFilterInput,
  UserTeamUpdateInput
} from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'

import { UserTeamService } from './userTeam.service'

@Resolver('UserTeam')
export class UserTeamResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userTeamService: UserTeamService
  ) {}

  @Query()
  @UseGuards(AppCaslGuard)
  async userTeams(
    @CaslAccessible('UserTeam') accessibleUserTeams: Prisma.UserTeamWhereInput,
    @Args('teamId') teamId: string,
    @Args('where') where?: UserTeamFilterInput
  ): Promise<UserTeam[]> {
    const roleFilter = where?.role != null ? { role: { in: where.role } } : {}
    return await this.prismaService.userTeam.findMany({
      where: {
        AND: [accessibleUserTeams, { teamId, ...roleFilter }]
      }
    })
  }

  @Query()
  @UseGuards(AppCaslGuard)
  async userTeam(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<UserTeam> {
    const userTeam = await this.prismaService.userTeam.findUnique({
      where: { id },
      include: { team: { include: { userTeams: true } } }
    })
    if (userTeam == null)
      throw new GraphQLError('userTeam not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.can(Action.Read, subject('UserTeam', userTeam))) return userTeam
    throw new GraphQLError('user is not allowed to view userTeam', {
      extensions: { code: 'FORBIDDEN' }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async userTeamUpdate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('input') data: UserTeamUpdateInput
  ): Promise<UserTeam> {
    const userTeam = await this.prismaService.userTeam.findUnique({
      where: { id },
      include: { team: { include: { userTeams: true } } }
    })
    if (userTeam == null)
      throw new GraphQLError('userTeam not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.can(Action.Update, subject('UserTeam', userTeam)))
      return await this.prismaService.userTeam.update({
        where: { id },
        data
      })
    throw new GraphQLError('user is not allowed to update userTeam', {
      extensions: { code: 'FORBIDDEN' }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async userTeamDelete(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<UserTeam> {
    const userTeam = await this.prismaService.userTeam.findUnique({
      where: { id },
      include: { team: { include: { userTeams: true } } }
    })
    if (userTeam == null)
      throw new GraphQLError('userTeam not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.can(Action.Delete, subject('UserTeam', userTeam))) {
      const userTeamDelete = await this.prismaService.userTeam.delete({
        where: { id }
      })

      await this.userTeamService.sendTeamRemovedEmail(
        userTeam.team.title,
        userTeam.userId
      )

      return userTeamDelete
    }

    throw new GraphQLError('user is not allowed to delete userTeam', {
      extensions: { code: 'FORBIDDEN' }
    })
  }

  @ResolveField('user')
  async user(
    @Parent() userTeam: UserTeam
  ): Promise<{ __typename: string; id: string }> {
    return { __typename: 'User', id: userTeam.userId }
  }

  @ResolveField('journeyNotification')
  async journeyNotifications(
    @Parent() userTeam: UserTeam,
    @Args('journeyId') journeyId: string
  ): Promise<JourneyNotification | null | undefined> {
    const res = await this.prismaService.userTeam
      .findUnique({
        where: { id: userTeam.id }
      })
      .journeyNotifications({ where: { journeyId } })

    return res?.[0]
  }
}
