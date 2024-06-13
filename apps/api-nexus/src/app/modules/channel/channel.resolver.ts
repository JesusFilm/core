import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { Channel, Prisma } from '.prisma/api-nexus-client'
import { CaslAbility, CaslAccessible } from '@core/nest/common/CaslAuthModule'

import {
  ChannelCreateInput,
  ChannelFilter,
  ChannelUpdateInput,
  ConnectYoutubeChannelInput
} from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { GoogleYoutubeService } from '../../lib/google/youtube.service'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('Channel')
export class ChannelResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly googleYoutubeService: GoogleYoutubeService
  ) {}

  @Query()
  @UseGuards(AppCaslGuard)
  async channels(
    @CaslAccessible('Channel') accessibleChannels: Prisma.ChannelWhereInput,
    @Args('where') where?: ChannelFilter
  ): Promise<Channel[]> {
    const filter: Prisma.ChannelWhereInput = {}
    return await this.prismaService.channel.findMany({
      where: {
        AND: [accessibleChannels, filter]
      },
      take: where?.limit ?? undefined
    })
  }

  @Query()
  @UseGuards(AppCaslGuard)
  async channel(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<Channel | null> {
    const channel = await this.prismaService.channel.findUnique({
      where: { id }
    })
    if (channel == null)
      throw new GraphQLError('channel not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Read, subject('Channel', channel)))
      throw new GraphQLError('user is not allowed to view channel', {
        extensions: { code: 'FORBIDDEN' }
      })
    return channel
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async channelCreate(
    @CaslAbility() ability: AppAbility,
    @Args('input') input: ChannelCreateInput
  ): Promise<Channel | undefined> {
    const id = uuidv4()
    return await this.prismaService.$transaction(async (tx) => {
      await this.prismaService.channel.create({
        data: {
          ...input,
          id
        }
      })
      const channel = await tx.channel.findUnique({
        where: { id }
      })
      if (channel == null)
        throw new GraphQLError('channel not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      if (!ability.can(Action.Create, subject('Channel', channel)))
        throw new GraphQLError('user is not allowed to create channel', {
          extensions: { code: 'FORBIDDEN' }
        })
      return channel
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async channelUpdate(
    @CaslAbility() ability: AppAbility,
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
    if (ability.cannot(Action.Update, subject('Channel', channel)))
      throw new GraphQLError('user is not allowed to update channel', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.prismaService.channel.update({
      where: { id },
      data: {
        name: input.name ?? undefined,
        platform: input.platform ?? undefined
      }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async channelDelete(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<Channel> {
    const channel = await this.prismaService.channel.findUnique({
      where: { id }
    })
    if (channel == null)
      throw new GraphQLError('channel not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Delete, subject('Channel', channel)))
      throw new GraphQLError('user is not allowed to delete channel', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.prismaService.channel.update({
      where: {
        id
      },
      data: {
        connected: false,
        deletedAt: new Date()
      }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async channelConnect(
    @CaslAbility() ability: AppAbility,
    @Args('input') input: ConnectYoutubeChannelInput
  ): Promise<Channel | null> {
    const channel = await this.prismaService.channel.findUnique({
      where: { id: input.channelId }
    })
    if (channel == null)
      throw new GraphQLError('channel not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Manage, subject('Channel', channel)))
      throw new GraphQLError('user is not allowed to manage channel', {
        extensions: { code: 'FORBIDDEN' }
      })

    const youtubeChannels = await this.googleYoutubeService.getChannels({
      accessToken: input.accessToken
    })

    if (youtubeChannels?.items?.[0] == null)
      throw new GraphQLError('youtube channel not found', {
        extensions: { code: 'NOT_FOUND' }
      })

    if (
      youtubeChannels.items[0].id == null ||
      youtubeChannels.items[0].snippet == null ||
      youtubeChannels.items[0].snippet.title == null ||
      youtubeChannels.items[0].snippet.description == null ||
      youtubeChannels.items[0].snippet.thumbnails?.high?.url == null
    )
      throw new GraphQLError('youtube channel properties not found', {
        extensions: { code: 'NOT_FOUND' }
      })

    await this.prismaService.channel.update({
      where: {
        id: channel.id
      },
      data: {
        title: youtubeChannels.items[0].snippet.title,
        description: youtubeChannels.items[0].snippet.description,
        youtubeId: youtubeChannels.items[0].id,
        imageUrl: youtubeChannels.items[0].snippet.thumbnails.high.url
      }
    })

    return await this.prismaService.channel.update({
      where: { id: input.channelId },
      data: { connected: true }
    })
  }
}
