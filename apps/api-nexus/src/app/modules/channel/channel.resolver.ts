import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { v4 as uuidv4 } from 'uuid';

import { Channel, Prisma } from '.prisma/api-nexus-client';
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId/CurrentUserId';

import {
  ChannelCreateInput,
  ChannelFilter,
  ChannelUpdateInput,
  ConnectYoutubeChannelInput,
} from '../../__generated__/graphql';
import { GoogleYoutubeService } from '../../lib/googleAPI/googleYoutubeService';
import { GoogleOAuthService } from '../../lib/googleOAuth/googleOAuth';
import { PrismaService } from '../../lib/prisma.service';

@Resolver('Channel')
export class ChannelResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly googleOAuth: GoogleOAuthService,
    private readonly googleYoutube: GoogleYoutubeService,
  ) {}

  @Query()
  async channels(@Args('where') where?: ChannelFilter): Promise<Channel[]> {
    const filter: Prisma.ChannelWhereInput = {};
    if (where?.ids != null) filter.id = { in: where?.ids };
    filter.status = where?.status ?? 'published';
    filter.nexusId = where?.nexusId ?? undefined;

    const channels = await this.prismaService.channel.findMany({
      where: {
        AND: [filter, { nexus: { userNexuses: {} } }],
      },
      take: where?.limit ?? undefined,
      include: {
        youtube: true,
      },
    });
    return channels;
  }

  @Query()
  async channel(
    @CurrentUserId() userId: string,
    @Args('id') id: string,
  ): Promise<Channel | null> {
    const filter: Prisma.ChannelWhereUniqueInput = { id };
    const channel = await this.prismaService.channel.findUnique({
      where: {
        id,
        AND: [filter, { nexus: { userNexuses: { every: { userId } } } }],
      },
      include: {
        youtube: true,
      },
    });
    return channel;
  }

  @Mutation()
  async channelCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: ChannelCreateInput,
  ): Promise<Channel | undefined> {
    const nexus = await this.prismaService.nexus.findUnique({
      where: { id: input.nexusId, userNexuses: { every: { userId } } },
    });
    if (nexus == null) {
      throw new GraphQLError('Nexus not found.');
    }
    const channel = await this.prismaService.channel.create({
      data: {
        id: uuidv4(),
        ...input,
        nexusId: nexus.id,
      },
      include: {
        youtube: true,
      },
    });
    return channel;
  }

  @Mutation()
  async channelUpdate(
    @CurrentUserId() userId: string,
    @Args('id') id: string,
    @Args('input') input: ChannelUpdateInput,
  ): Promise<Channel> {
    const channel = await this.prismaService.channel.update({
      where: {
        id,
        nexus: { userNexuses: { every: { userId } } },
      },
      data: {
        name: input.name ?? undefined,
        nexusId: input.nexusId ?? undefined,
        platform: input.platform ?? undefined,
      },
      include: {
        youtube: true,
      },
    });
    return channel;
  }

  @Mutation()
  async channelDelete(
    @CurrentUserId() userId: string,
    @Args('id') id: string,
  ): Promise<Channel> {
    const channel = await this.prismaService.channel.update({
      where: {
        id,
        nexus: { userNexuses: { every: { userId } } },
      },
      data: {
        status: 'deleted',
        connected: false,
      },
    });
    return channel;
  }

  @Mutation()
  async connectYoutubeChannel(
    @CurrentUserId() userId: string,
    @Args('input') input: ConnectYoutubeChannelInput,
  ): Promise<Channel | null> {
    const authResponse = await this.googleOAuth.getAccessToken({
      code: input.authCode,
      grant_type: 'authorization_code',
      redirect_uri: input.redirectUri,
    });
    const youtubeChannels = await this.googleYoutube.getChannels({
      accessToken: authResponse.access_token,
    });

    const channel = await this.prismaService.channel.findUnique({
      where: {
        id: input.channelId,
        // nexus: { userNexuses: { every: { userId } } },
      },
    });
    if (channel == null) {
      throw new GraphQLError('Channel not found.');
    }
    const youtubeChannel = await this.prismaService.channelYoutube.create({
      data: {
        channelId: channel?.id,
        title: youtubeChannels.items[0].snippet.title,
        description: youtubeChannels.items[0].snippet.description,
        youtubeId: youtubeChannels.items[0].id,
        imageUrl: youtubeChannels.items[0].snippet.thumbnails.high.url,
        refreshToken: authResponse.refresh_token,
      },
    });

    const _channel = await this.prismaService.channel.update({
      where: {
        id: youtubeChannel.channelId,
        nexus: { userNexuses: { every: { userId } } },
      },
      data: {
        connected: true,
      },
      include: {
        youtube: true,
      },
    });
    return _channel;
  }
}
