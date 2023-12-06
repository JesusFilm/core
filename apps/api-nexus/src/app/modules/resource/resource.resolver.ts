import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { Prisma, Resource } from '.prisma/api-nexus-client'

import {
  ResourceCreateInput,
  ResourceFilter,
  ResourceUpdateInput
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('Resource')
export class ResourceResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async resources(@Args('where') where?: ResourceFilter): Promise<Resource[]> {
    const filter: Prisma.ResourceWhereInput = {}
    if (where?.ids != null) filter.id = { in: where?.ids }

    const resources = await this.prismaService.resource.findMany({
      where: filter,
      take: where?.limit ?? undefined
    })

    return resources
  }

  @Query()
  async resource(@Args('id') id: string): Promise<Resource | null> {
    const filter: Prisma.ResourceWhereUniqueInput = { id }
    const resource = await this.prismaService.resource.findUnique({
      where: filter
    })
    if (resource == null)
      throw new GraphQLError('resource not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    return resource
  }

  @Mutation()
  async resourceCreate(
    @Args('input') input: ResourceCreateInput
  ): Promise<Resource | undefined> {
    // eslint-disable-next-line no-useless-catch
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const resource = await tx.resource.create({
          data: {
            id: uuidv4(),
            ...input,
          }
        })
        return resource
      })
    } catch (err) {
      throw err
    }
  }

  @Mutation()
  async resourceUpdate(
    @Args('id') id: string,
    @Args('input') input: ResourceUpdateInput
  ): Promise<Resource> {
    const resource = await this.prismaService.resource.findUnique({
      where: { id }
    })
    if (resource == null)
      throw new GraphQLError('resource not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    // eslint-disable-next-line no-useless-catch
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const updatedResource = await tx.resource.update({
          where: { id },
          data: {
            name: input.name ?? undefined,
            refLink: input.refLink ?? undefined,
            videoId: input.videoId ?? undefined
          }
        })
        return updatedResource
      })
    } catch (err) {
      throw err
    }
  }

  @Mutation()
  async resourceDelete(@Args('id') id: string): Promise<Resource> {
    const resource = await this.prismaService.resource.findUnique({
      where: { id }
    })

    if (resource == null)
      throw new GraphQLError('resource not found', {
        extensions: { code: 'NOT_FOUND' }
      })

    // eslint-disable-next-line no-useless-catch
    try {
      return await this.prismaService.resource.delete({
        where: { id }
      })
    } catch (err) {
      throw err
    }
  }
}
