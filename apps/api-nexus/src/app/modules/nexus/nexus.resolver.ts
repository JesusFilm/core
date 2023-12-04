import { Args, Mutation, Query , Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { Nexus, Prisma } from '.prisma/api-nexus-client'

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
  async nexuses(@Args('where') where?: NexusFilter): Promise<Nexus[]> {
    const filter: Prisma.NexusWhereInput = {}
    if (where?.ids != null) filter.id = { in: where?.ids }

    return await this.prismaService.nexus.findMany({
      where: filter,
      take: where?.limit ?? undefined,
      orderBy: where?.orderByRecent === true ? { createdAt: 'desc' } : undefined
    })
  }

  @Query()
  async nexus(@Args('id') id: string): Promise<Nexus | null> {
    const filter: Prisma.NexusWhereUniqueInput = { id }
    const nexus = await this.prismaService.nexus.findUnique({
      where: filter
    })
    if (nexus == null)
      throw new GraphQLError('nexus not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    return nexus
  }

  @Mutation()
  async nexusCreate(
    @Args('input') input: NexusCreateInput
  ): Promise<Nexus | undefined> {
    const id = input.id ?? uuidv4()
    // eslint-disable-next-line no-useless-catch
    try {
      const nexus = await this.prismaService.$transaction(async (tx) => {
        await tx.nexus.create({
          data: {
            id,
            name: input.name
          }
        })
        if (nexus == null)
          throw new GraphQLError('nexus not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        return nexus
      })
      return nexus
    } catch (err) {
      throw err
    }
  }

  @Mutation()
  async nexusUpdate(
    @Args('id') id: string,
    @Args('input') input: NexusUpdateInput
  ): Promise<Nexus> {
    const nexus = await this.prismaService.nexus.findUnique({
      where: { id }
    })
    if (nexus == null)
      throw new GraphQLError('nexus not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    // eslint-disable-next-line no-useless-catch
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const updatedNexus = await tx.nexus.update({
          where: { id },
          data: {
            name: input.name ?? undefined,
            description: input.description ?? undefined
          }
        })
        return updatedNexus
      })
    } catch (err) {
      throw err
    }
  }

//   @Mutation()
//   async nexusDelete(): Promise<Nexus> {}
}
