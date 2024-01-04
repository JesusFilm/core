import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { v4 as uuidv4 } from 'uuid'

import { Nexus, Prisma } from '.prisma/api-nexus-client'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'

import {
  NexusCreateInput,
  NexusFilter,
  NexusUpdateInput
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('Nexus')
export class NexusResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async nexuses(
    @CurrentUserId() userId: string,
    @Args('where') where?: NexusFilter
  ): Promise<Nexus[]> {
    const filter: Prisma.NexusWhereInput = {}
    if (where?.ids != null) filter.id = { in: where?.ids }

    return await this.prismaService.nexus.findMany({
      where: {
        AND: [
          filter,
          { userNexuses: { every: { userId } } },
          { status: 'published' }
        ]
      },
      take: where?.limit ?? undefined,
      orderBy: where?.orderByRecent === true ? { createdAt: 'desc' } : undefined
    })
  }

  @Query()
  async nexus(
    // @CurrentUserId() userId: string,
    @Args('id') id: string
  ): Promise<Nexus | null> {
    return await this.prismaService.nexus.findFirst({
      where: { id, userNexuses: { 
        // every: { userId } 
      }, 
        status: 'published' 
      }
    })
  }

  @Mutation()
  async nexusCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: NexusCreateInput
  ): Promise<Nexus | undefined> {
    const nexus = await this.prismaService.nexus.create({
      data: { id: uuidv4(), ...input }
    })
    await this.prismaService.userNexus.create({
      data: { id: uuidv4(), userId, nexusId: nexus.id, role: 'owner' }
    })
    return nexus
  }

  @Mutation()
  async nexusUpdate(
    @CurrentUserId() userId: string,
    @Args('id') id: string,
    @Args('input') input: NexusUpdateInput
  ): Promise<Nexus> {
    return await this.prismaService.nexus.update({
      where: { id, userNexuses: { every: { userId } } },
      data: {
        name: input.name ?? undefined,
        description: input.description ?? undefined
      }
    })
  }

  @Mutation()
  async nexusDelete(
    @CurrentUserId() userId: string,
    @Args('id') id: string
  ): Promise<boolean> {
    await this.prismaService.nexus.update({
      where: { id, userNexuses: { every: { userId } } },
      data: { status: 'deleted' }
    })
    return true
  }
}