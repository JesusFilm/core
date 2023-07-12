import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent
} from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { UserTeam, Prisma } from '.prisma/api-journeys-client'
import { subject } from '@casl/ability'
import { ForbiddenError } from 'apollo-server-errors'
import { GraphQLError } from 'graphql'
import { CaslAbility, CaslAccessible } from '@core/nest/common/CaslAuthModule'
import { PrismaService } from '../../lib/prisma.service'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { UserTeamUpdateInput } from '../../__generated__/graphql'
import { AppCaslGuard } from '../../lib/casl/caslGuard'

@Resolver('UserTeam')
export class UserTeamResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  @UseGuards(AppCaslGuard)
  async userTeams(
    @CaslAccessible('UserTeam') accessibleUserTeams: Prisma.UserTeamWhereInput,
    @Args('teamId') teamId: string
  ): Promise<UserTeam[]> {
    return await this.prismaService.userTeam.findMany({
      where: {
        AND: [accessibleUserTeams, { teamId }]
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
    throw new ForbiddenError('user is not allowed to view userTeam')
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
    throw new ForbiddenError('user is not allowed to update userTeam')
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
    throw new ForbiddenError('user is not allowed to delete userTeam')
  }

  @ResolveField('user')
  async user(
    @Parent() userTeam: UserTeam
  ): Promise<{ __typename: string; id: string }> {
    return { __typename: 'User', id: userTeam.userId }
  }
}
