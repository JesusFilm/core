import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { Channel, NexusStatus, Prisma } from '.prisma/api-nexus-client'
import { CaslAbility, CaslAccessible } from '@core/nest/common/CaslAuthModule'

import {
  ChannelCreateInput,
  ChannelFilter,
  ChannelUpdateInput,
  ConnectYoutubeChannelInput
} from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { GoogleOAuthService } from '../../lib/google/oauth.service'
import { GoogleYoutubeService } from '../../lib/google/youtube.service'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('Channel')
export class ChannelResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly googleOAuth: GoogleOAuthService,
    private readonly googleYoutube: GoogleYoutubeService
  ) {}

  @Query()
  @UseGuards(AppCaslGuard)
  async channels(
    @CaslAccessible('Channel') accessibleChannels: Prisma.ChannelWhereInput,
    @Args('where') where?: ChannelFilter
  ): Promise<Channel[]> {
    const filter: Prisma.ChannelWhereInput = {}
    if (where?.nexusId != null) filter.nexusId = where.nexusId

    return await this.prismaService.channel.findMany({
      where: {
        AND: [accessibleChannels, filter]
      },
      take: where?.limit ?? undefined,
      include: { youtube: true }
    })
  }

  @Query()
  @UseGuards(AppCaslGuard)
  async channel(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<Channel | null> {
    const channel = await this.prismaService.channel.findUnique({
      where: { id },
      include: { youtube: true, nexus: { include: { userNexuses: true } } }
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
          id,
          status: NexusStatus.published
        }
      })
      const channel = await tx.channel.findUnique({
        where: { id },
        include: { youtube: true, nexus: { include: { userNexuses: true } } }
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
      where: { id },
      include: { youtube: true, nexus: { include: { userNexuses: true } } }
    })
    if (channel == null)
      throw new GraphQLError('channel not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.cannot(Action.Update, subject('Channel', channel)))
      throw new GraphQLError('user is not allowed to update nexus', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.prismaService.channel.update({
      where: { id },
      data: {
        name: input.name ?? undefined,
        nexusId: input.nexusId ?? undefined,
        platform: input.platform ?? undefined
      },
      include: { youtube: true }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async channelDelete(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<Channel> {
    const channel = await this.prismaService.channel.findUnique({
      where: { id },
      include: { nexus: { include: { userNexuses: true } } }
    })
    if (channel == null)
      throw new GraphQLError('channel not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Delete, subject('Channel', channel)))
      throw new GraphQLError('user is not allowed to delete nexus', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.prismaService.channel.update({
      where: {
        id
      },
      data: {
        status: NexusStatus.deleted,
        connected: false
      },
      include: { youtube: true }
    })
  }

  @Mutation()
  async connectYoutubeChannel(
    @CaslAbility() ability: AppAbility,
    @Args('input') input: ConnectYoutubeChannelInput
  ): Promise<Channel | null> {
    const channel = await this.prismaService.channel.findUnique({
      where: { id: input.channelId },
      include: { nexus: { include: { userNexuses: true } } }
    })
    if (channel == null)
      throw new GraphQLError('channel not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Manage, subject('Channel', channel)))
      throw new GraphQLError('user is not allowed to manage channel', {
        extensions: { code: 'FORBIDDEN' }
      })

    const authResponse = await this.googleOAuth.getAccessToken({
      code: input.authCode,
      grant_type: 'authorization_code',
      redirect_uri: input.redirectUri
    })

    const youtubeChannels = await this.googleYoutube.getChannels({
      accessToken: authResponse.access_token
    })

    console.log('youtubeChannels', youtubeChannels)
    await this.prismaService.channelYoutube.create({
      data: {
        channelId: channel.id,
        title: youtubeChannels.items[0].snippet.title,
        description: youtubeChannels.items[0].snippet.description,
        youtubeId: youtubeChannels.items[0].id,
        imageUrl: youtubeChannels.items[0].snippet.thumbnails.high.url,
        refreshToken: authResponse.refresh_token
      }
    })

    return await this.prismaService.channel.update({
      where: { id: input.channelId },
      data: { connected: true },
      include: { youtube: true }
    })
  }
}
