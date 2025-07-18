import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { CaslAbility, CaslAccessible } from '@core/nest/common/CaslAuthModule'
import { Host, Prisma } from '@core/prisma/journeys/client'

import { HostCreateInput, HostUpdateInput } from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'

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
    return await this.prismaService.$transaction(async (tx) => {
      const createdHost = await this.prismaService.host.create({
        data: {
          ...input,
          team: { connect: { id: teamId } }
        }
      })
      const host = await tx.host.findUnique({
        where: { id: createdHost.id },
        include: {
          team: {
            include: { userTeams: true }
          }
        }
      })
      if (host == null)
        throw new GraphQLError('host not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      if (!ability.can(Action.Create, subject('Host', host)))
        throw new GraphQLError('user is not allowed to create host', {
          extensions: { code: 'FORBIDDEN' }
        })
      return host
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
      throw new GraphQLError('host not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Manage, subject('Host', host)))
      throw new GraphQLError('user is not allowed to update host', {
        extensions: { code: 'FORBIDDEN' }
      })
    if (input.title === null)
      throw new GraphQLError('host title cannot be set to null', {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    return await this.prismaService.host.update({
      where: { id },
      data: { ...input, title: input.title ?? undefined }
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
    if (!ability.can(Action.Manage, subject('Host', host)))
      throw new GraphQLError('user is not allowed to delete host', {
        extensions: { code: 'FORBIDDEN' }
      })
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
}
