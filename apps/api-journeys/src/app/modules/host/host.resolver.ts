import { Args, Mutation, Resolver, Query } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import { CaslAbility, CaslAccessible } from '@core/nest/common/CaslAuthModule'
import { UseGuards } from '@nestjs/common'
import { subject } from '@casl/ability'
import { Host, Prisma } from '.prisma/api-journeys-client'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { HostUpdateInput, HostCreateInput } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { AppCaslGuard } from '../../lib/casl/caslGuard'

@Resolver('Host')
export class HostResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  @UseGuards(AppCaslGuard)
  async hosts(
    @CaslAccessible('Host') accessibleHosts: Prisma.HostWhereInput,
    @Args('teamId') teamId: string
  ): Promise<Host[]> {
    return await this.prismaService.host.findMany({
      where: { AND: [accessibleHosts, { teamId }] }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async hostCreate(
    @CaslAbility() ability: AppAbility,
    @Args('teamId') teamId: string,
    @Args('input') input: HostCreateInput
  ): Promise<Host> {
    const team = await this.prismaService.team.findUnique({
      where: { id: teamId },
      include: { userTeams: true }
    })
    if (team == null)
      throw new GraphQLError('Team not found.', {
        extensions: { code: 'NOT_FOUND' }
      })
    // change this Action.Create in the future to Action.Read restrict the roles
    if (ability.can(Action.Create, subject('Team', team))) {
      const host = {
        teamId,
        ...input
      }
      return await this.prismaService.host.create({ data: host })
    }
    throw new GraphQLError('User is not allowed to create host.', {
      extensions: { code: 'FORBIDDEN' }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async hostUpdate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('input') input: HostUpdateInput
  ): Promise<Host> {
    const host = await this.prismaService.host.findUnique({
      where: { id },
      include: { team: { include: { userTeams: true } } }
    })
    if (host == null)
      throw new GraphQLError('Host not found.', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.can(Action.Manage, subject('Host', host))) {
      if (input.title === null)
        throw new GraphQLError('host title cannot be set to null', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      return await this.prismaService.host.update({
        where: { id },
        data: { ...input, title: input.title ?? undefined }
      })
    }
    throw new GraphQLError('User is not allowed to update userTeam.', {
      extensions: { code: 'FORBIDDEN' }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async hostDelete(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<Host> {
    const host = await this.prismaService.host.findUnique({
      where: { id },
      include: { team: { include: { userTeams: true } } }
    })
    if (host == null)
      throw new GraphQLError('host not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.can(Action.Manage, subject('Host', host))) {
      const journeysWithHost = await this.prismaService.journey.findMany({
        where: {
          hostId: id
        }
      })
      if (journeysWithHost.length > 1)
        throw new GraphQLError('This host is used in other journeys.', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      return await this.prismaService.host.delete({
        where: {
          id
        }
      })
    }
    throw new GraphQLError('user is not allowed to delete userTeam', {
      extensions: { code: 'FORBIDDEN' }
    })
  }
}
