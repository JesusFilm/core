import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import FormData from 'form-data'
import { GraphQLError } from 'graphql'
import fetch, { Response } from 'node-fetch'
import { v4 as uuidv4 } from 'uuid'

import { Channel, Prisma } from '.prisma/api-nexus-client'

import {
  ChannelCreateInput,
  ChannelFilter,
  ChannelUpdateInput,
  ConnectYoutubeChannelInput
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
      take: where?.limit ?? undefined,
      include: {
        channelYoutubeCredential: true
      }
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
      where: filter,
      include: {
        channelYoutubeCredential: true
      }
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

  @Mutation()
  async connectYoutubeChannel(
    @Args('input') input: ConnectYoutubeChannelInput
  ): Promise<Channel | null> {
    try {
      const tokenResponse = await getRefreshToken(
        input.authCode,
        input.redirectUri
      )

      const tokenData: { refresh_token: string; access_token: string } =
        await tokenResponse.json()

      const youtubeChannel: {
        id: string
        snippet: { thumbnails: { high: { url: string } } }
      } = await getYouTubeChannel(tokenData.access_token)

      await this.prismaService.channelYoutubeCredential.create({
        data: {
          channelId: input.channelId,
          youtubeId: youtubeChannel.id,
          imageUrl: youtubeChannel.snippet.thumbnails.high.url,
          redirectUrl: input.redirectUri,
          refreshToken: tokenData.refresh_token
        }
      })
    } catch (error) {
      console.error('Error getting token:', error.message)
    }

    return await this.prismaService.channel.findUnique({
      where: { id: input.channelId }
    })
  }
}

async function getRefreshToken(
  authCode: string,
  redirectUri: string
): Promise<Response> {
  const body = new FormData()
  body.append('code', authCode)
  body.append('client_id', process.env.GOOGLE_CLIENT_ID ?? '')
  body.append('client_secret', process.env.GOOGLE_CLIENT_SECRET ?? '')
  body.append('redirect_uri', redirectUri)
  body.append('grant_type', 'authorization_code')

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body
    })

    return response
  } catch (error) {
    console.error('Error fetching refresh token:', error.message)
    throw error
  }
}

async function getAccessToken(refreshToken: string): Promise<Response> {
  const body = new FormData()
  body.append('client_id', process.env.GOOGLE_CLIENT_ID ?? '')
  body.append('client_secret', process.env.GOOGLE_CLIENT_SECRET ?? '')
  body.append('refresh_token', refreshToken)
  body.append('grant_type', 'refresh_token')

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body
    })

    return response
  } catch (error) {
    console.error('Error fetching access token:', error.message)
    throw error
  }
}

async function getYouTubeChannel(accessToken: string): Promise<{
  id: string
  snippet: { thumbnails: { high: { url: string } } }
}> {
  try {
    const response = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    )

    const responseData = await response.json()

    if (responseData.items.length === 0) {
      throw new Error('No channel data found.')
    }

    // returns the first channel
    return responseData.items[0]
  } catch (error) {
    console.error('Error fetching YouTube channel:', error.message)
    throw error
  }
}
