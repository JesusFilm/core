import { Args, Mutation, Query , Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { Channel, Prisma } from '.prisma/api-nexus-client'

import {
  ChannelCreateInput,
  ChannelFilter,
  ChannelUpdateInput
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('Channel')
export class ChannelResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async channels(@Args('where') where?: ChannelFilter): Promise<Channel[]> {
    const filter: Prisma.ChannelWhereInput = {}
    if (where?.ids != null) filter.id = { in: where?.ids }

    return await this.prismaService.channel.findMany({
      where: filter,
      take: where?.limit ?? undefined,
    })
  }

  @Query()
  async channel(@Args('id') id: string): Promise<Channel | null> {
    const filter: Prisma.ChannelWhereUniqueInput = { id }
    const channel = await this.prismaService.channel.findUnique({
      where: filter
    })
    if (channel == null)
      throw new GraphQLError('channel not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    return channel
  }

  @Mutation()
  async channelCreate(
    @Args('input') input: ChannelCreateInput
  ): Promise<Channel | undefined> {
    const id = input.id ?? uuidv4()
    // eslint-disable-next-line no-useless-catch
    try {
      const channel = await this.prismaService.$transaction(async (tx) => {
        await tx.channel.create({
          data: {
            id,
            name: input.name,
            nexusId: input.nexusId,
            platform: input.platform
          }
        })
        if (channel == null)
          throw new GraphQLError('channel not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        return channel
      })
      return channel
    } catch (err) {
      throw err
    }
  }

  @Mutation()
  async channelUpdate(
    @Args('id') id: string,
    @Args('input') input: ChannelUpdateInput
  ): Promise<Channel> {
    const channel = await this.prismaService.channel.findUnique({
      where: { id }
    })
    if (channel == null)
      throw new GraphQLError('channel not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    // eslint-disable-next-line no-useless-catch
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const updatedChannel = await tx.channel.update({
          where: { id },
          data: {
            name: input.name ?? undefined,
            nexusId: input.nexusId ?? undefined,
            platform: input.platform ?? undefined
          }
        })
        return updatedChannel
      })
    } catch (err) {
      throw err
    }
  }

//   @Mutation()
//   async channelDelete(): Promise<Channel> {}
}
