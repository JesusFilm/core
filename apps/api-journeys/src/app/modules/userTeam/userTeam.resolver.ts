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

import { Prisma, UserTeam } from '.prisma/api-journeys-client'
import { CaslAbility, CaslAccessible } from '@core/nest/common/CaslAuthModule'

import {
  UserTeamFilterInput,
  UserTeamUpdateInput
} from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('UserTeam')
export class UserTeamResolver {
  constructor(private readonly prismaService: PrismaService) {}

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
    if (ability.can(Action.Delete, subject('UserTeam', userTeam)))
      return await this.prismaService.userTeam.delete({
        where: { id }
      })
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
}
