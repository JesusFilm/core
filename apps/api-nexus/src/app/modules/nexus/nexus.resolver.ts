import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { Nexus, NexusStatus, Prisma } from '.prisma/api-nexus-client'
import { CaslAbility, CaslAccessible } from '@core/nest/common/CaslAuthModule'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'

import {
  NexusCreateInput,
  NexusFilter,
  NexusUpdateInput
} from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('Nexus')
export class NexusResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  @UseGuards(AppCaslGuard)
  async nexuses(
    @CaslAccessible('Nexus') accessibleNexuses: Prisma.NexusWhereInput,
    @Args('where') where?: NexusFilter
  ): Promise<Nexus[]> {
    const filter: Prisma.NexusWhereInput = {}
    if (where?.ids != null) filter.id = { in: where?.ids }

    return await this.prismaService.nexus.findMany({
      where: {
        AND: [accessibleNexuses, filter]
      },
      take: where?.limit ?? undefined,
      orderBy: where?.orderByRecent === true ? { createdAt: 'desc' } : undefined
    })
  }

  @Query()
  @UseGuards(AppCaslGuard)
  async nexus(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<Nexus | null> {
    const nexus = await this.prismaService.nexus.findUnique({
      where: { id },
      include: { userNexuses: true }
    })
    if (nexus == null)
      throw new GraphQLError('nexus not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Read, subject('Nexus', nexus)))
      throw new GraphQLError('user is not allowed to view nexus', {
        extensions: { code: 'FORBIDDEN' }
      })
    return nexus
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async nexusCreate(
    @CaslAbility() ability: AppAbility,
    @Args('input') input: NexusCreateInput,
    @CurrentUserId() userId: string
  ): Promise<Nexus | undefined> {
    const id = uuidv4()
    return await this.prismaService.$transaction(async (tx) => {
      await this.prismaService.nexus.create({
        data: {
          ...input,
          id,
          status: NexusStatus.published,
          userNexuses: {
            create: {
              userId,
              role: 'owner'
            }
          }
        }
      })
      const nexus = await tx.nexus.findUnique({
        where: { id },
        include: {
          userNexuses: true
        }
      })
      if (nexus == null)
        throw new GraphQLError('nexus not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      if (!ability.can(Action.Create, subject('Nexus', nexus)))
        throw new GraphQLError('user is not allowed to create nexus', {
          extensions: { code: 'FORBIDDEN' }
        })
      return nexus
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async nexusUpdate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('input') input: NexusUpdateInput
  ): Promise<Nexus> {
    const nexus = await this.prismaService.nexus.findUnique({
      where: { id },
      include: {
        userNexuses: true
      }
    })
    if (nexus == null)
      throw new GraphQLError('nexus not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.cannot(Action.Update, subject('Nexus', nexus)))
      throw new GraphQLError('user is not allowed to update nexus', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.prismaService.nexus.update({
      where: { id },
      data: {
        name: input.name ?? undefined,
        description: input.description ?? undefined
      }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async nexusDelete(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<Nexus> {
    const nexus = await this.prismaService.nexus.findUnique({
      where: { id },
      include: {
        userNexuses: true
      }
    })
    if (nexus == null)
      throw new GraphQLError('nexus not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Delete, subject('Nexus', nexus)))
      throw new GraphQLError('user is not allowed to delete nexus', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.prismaService.nexus.update({
      where: { id },
      data: { status: NexusStatus.deleted }
    })
  }
}
