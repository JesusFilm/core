import { Args, Mutation, Resolver, Query } from '@nestjs/graphql'
import { UserInputError, ForbiddenError } from 'apollo-server-errors'
import { GraphQLError } from 'graphql'

import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import {
  CaslAbility,
  CaslAccessible,
  CaslGuard
} from '@core/nest/common/CaslAuthModule'
import { UseGuards } from '@nestjs/common'
import { subject } from '@casl/ability'
import { Host, Prisma } from '.prisma/api-journeys-client'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { HostUpdateInput, HostCreateInput } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyService } from '../journey/journey.service'

@Resolver('Host')
export class HostResolver {
  constructor(
    private readonly journeyService: JourneyService,
    private readonly prismaService: PrismaService
  ) {}

  @Query()
  @UseGuards(GqlAuthGuard, CaslGuard)
  async hosts(
    @CaslAccessible('Host') accessibleHosts: Prisma.HostWhereInput,
    @Args('teamId') teamId: string
  ): Promise<Host[]> {
    return await this.prismaService.host.findMany({
      where: { AND: [accessibleHosts, { teamId }] }
    })
  }

  @Mutation()
  @UseGuards(GqlAuthGuard, CaslGuard)
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
    if (ability.can(Action.Read, subject('Team', team))) {
      const host = {
        teamId,
        ...input
      }
      return await this.prismaService.host.create({ data: host })
    }
    throw new ForbiddenError('User is not allowed to create host.')
  }

  @Mutation()
  @UseGuards(GqlAuthGuard, CaslGuard)
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
        throw new UserInputError('host title cannot be set to null')
      return await this.prismaService.host.update({
        where: { id },
        data: { ...input, title: input.title ?? undefined }
      })
    }
    throw new ForbiddenError('User is not allowed to update userTeam.')
  }

  @Mutation()
  @UseGuards(GqlAuthGuard, CaslGuard)
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
      const journeysWithHost = await this.journeyService.getAllByHost(id)
      if (journeysWithHost.length > 1)
        throw new UserInputError('This host is used in other journeys.')
      return await this.prismaService.host.delete({
        where: {
          id
        }
      })
    }
    throw new ForbiddenError('user is not allowed to delete userTeam')
  }
}
