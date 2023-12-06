import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
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

    // return []

    const channels = await this.prismaService.channel.findMany({
      where: filter,
      take: where?.limit ?? undefined
    })

    console.log('channels', channels)

    // if(channels == null) {
    //   return []
    // }

    return channels
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
    // eslint-disable-next-line no-useless-catch
    try {
      return await this.prismaService.$transaction(async (tx) => {
        const channel = await tx.channel.create({
          data: {
            id: uuidv4(),
            ...input
          }
        })
        return channel
      })
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

  @Mutation()
  async channelDelete(@Args('id') id: string): Promise<Channel> {
    const channel = await this.prismaService.channel.findUnique({
      where: { id }
    })

    if (channel == null)
      throw new GraphQLError('channel not found', {
        extensions: { code: 'NOT_FOUND' }
      })

    // eslint-disable-next-line no-useless-catch
    try {
      return await this.prismaService.channel.delete({
        where: { id }
      })
    } catch (err) {
      throw err
    }
  }
}
