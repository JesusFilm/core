import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { object, string } from 'yup'
import fetch from 'node-fetch'
import { GraphQLError } from 'graphql'
import { Block, VideoBlockSource } from '.prisma/api-journeys-client'
import omit from 'lodash/omit'

import { BlockService } from '../block.service'
import {
  Action,
  Role,
  UserJourneyRole,
  VideoBlock,
  VideoBlockCreateInput,
  VideoBlockUpdateInput
} from '../../../__generated__/graphql'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'
import { PrismaService } from '../../../lib/prisma.service'

const videoBlockYouTubeSchema = object().shape({
  videoId: string().matches(
    /^[-\w]{11}$/,
    'videoId must be a valid YouTube videoId'
  )
})
const videoBlockCloudflareSchema = object().shape({
  videoId: string().nullable()
})
const videoBlockInternalSchema = object().shape({
  videoId: string().nullable(),
  videoVariantLanguageId: string().nullable()
})

export interface YoutubeVideosData {
  items: Array<{
    id: string
    snippet: {
      title: string
      description: string
      thumbnails: { high: { url: string } }
    }
    contentDetails: {
      duration: string
    }
  }>
}

// https://developers.cloudflare.com/api/operations/stream-videos-retrieve-video-details
export interface CloudflareRetrieveVideoDetailsResponse {
  result: CloudflareRetrieveVideoDetailsResponseResult | null
  success: boolean
  errors: Array<{ code: number; message: string }>
  messages: Array<{ code: number; message: string }>
}

interface CloudflareRetrieveVideoDetailsResponseResult {
  uid: string
  size: number
  readyToStream: boolean
  thumbnail: string
  duration: number
  preview: string
  input: {
    width: number
    height: number
  }
  playback: {
    hls: string
  }
  meta: {
    [key: string]: string
  }
}

function parseISO8601Duration(duration: string): number {
  const match = duration.match(/P(\d+Y)?(\d+W)?(\d+D)?T(\d+H)?(\d+M)?(\d+S)?/)

  if (match == null) {
    console.error(`Invalid duration: ${duration}`)
    return 0
  }
  const [years, weeks, days, hours, minutes, seconds] = match
    .slice(1)
    .map((period) => (period != null ? parseInt(period.replace(/\D/, '')) : 0))
  return (
    (((years * 365 + weeks * 7 + days) * 24 + hours) * 60 + minutes) * 60 +
    seconds
  )
}

@Resolver('VideoBlock')
export class VideoBlockResolver {
  constructor(
    private readonly blockService: BlockService,
    private readonly prismaService: PrismaService
  ) {}

  @ResolveField()
  action(@Parent() block: VideoBlock): Action | null {
    if (block.action == null) return null

    return {
      ...block.action,
      parentBlockId: block.id
    }
  }

  @Mutation()
  @UseGuards(
    RoleGuard('input.journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async videoBlockCreate(
    @Args('input') input: VideoBlockCreateInput
  ): Promise<Block & { action?: Action }> {
    switch (input.source) {
      case VideoBlockSource.youTube:
        await videoBlockYouTubeSchema.validate(input)
        input = {
          ...input,
          ...(await this.fetchFieldsFromYouTube(input.videoId as string)),
          objectFit: null
        }
        break
      case VideoBlockSource.cloudflare:
        await videoBlockInternalSchema.validate(input)
        input = {
          ...input,
          ...(await this.fetchFieldsFromCloudflare(input.videoId as string)),
          objectFit: null
        }
        break
      case VideoBlockSource.internal:
        await videoBlockInternalSchema.validate(input)
        break
    }

    if (input.isCover === true) {
      const parentBlock = await this.prismaService.block.findUnique({
        where: { id: input.parentBlockId },
        include: { action: true }
      })

      const coverBlock = await this.blockService.save<Block>({
        ...omit(input, 'parentBlockId'),
        id: input.id ?? undefined,
        typename: 'VideoBlock',
        journey: {
          connect: { id: input.journeyId }
        },
        parentBlock: { connect: { id: input.parentBlockId } },
        coverBlockParent: { connect: { id: input.parentBlockId } },
        parentOrder: null
      })

      if (parentBlock?.coverBlockId != null) {
        await this.blockService.removeBlockAndChildren(
          parentBlock.coverBlockId,
          input.journeyId
        )
      }

      return coverBlock
    }

    const siblings = await this.blockService.getSiblings(
      input.journeyId,
      input.parentBlockId
    )

    const block = await this.blockService.save<Block>({
      ...omit(input, 'parentBlockId'),
      id: input.id ?? undefined,
      typename: 'VideoBlock',
      journey: { connect: { id: input.journeyId } },
      parentBlock: { connect: { id: input.parentBlockId } },
      parentOrder: siblings.length
    })

    const action = {
      parentBlockId: block.id,
      gtmEventName: 'NavigateAction',
      blockId: null,
      journeyId: null,
      url: null,
      target: null
    }

    await this.prismaService.action.create({
      data: action
    })
    return {
      ...block,
      action
    }
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async videoBlockUpdate(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: VideoBlockUpdateInput
  ): Promise<VideoBlock> {
    const block = await this.prismaService.block.findUnique({
      where: { id },
      include: { action: true }
    })
    switch (input.source ?? block?.source) {
      case VideoBlockSource.youTube:
        await videoBlockYouTubeSchema.validate({ ...block, ...input })
        if (input.videoId != null) {
          input = {
            ...input,
            ...(await this.fetchFieldsFromYouTube(input.videoId))
          }
        }
        break
      case VideoBlockSource.cloudflare:
        await videoBlockCloudflareSchema.validate({
          ...block,
          ...input
        })
        if (input.videoId != null) {
          input = {
            ...(await this.fetchFieldsFromCloudflare(input.videoId)),
            ...input
          }
        }
        break
      case VideoBlockSource.internal:
        input = {
          ...{
            duration: null
          },
          ...input,
          ...{
            title: null,
            description: null,
            image: null
          }
        }
        await videoBlockInternalSchema.validate({ ...block, ...input })
        break
    }
    return await this.blockService.update(id, input)
  }

  @ResolveField('video')
  video(
    @Parent()
    block: VideoBlock
  ): {
    __typename: 'Video'
    id: string
    primaryLanguageId?: string | null
  } | null {
    if (
      block.videoId == null ||
      block.videoVariantLanguageId == null ||
      (block.source != null && block.source !== VideoBlockSource.internal)
    )
      return null

    return {
      __typename: 'Video',
      id: block.videoId,
      primaryLanguageId: block.videoVariantLanguageId
    }
  }

  @ResolveField('source')
  source(
    @Parent()
    block: VideoBlock
  ): VideoBlockSource {
    return block.source ?? VideoBlockSource.internal
  }

  private async fetchFieldsFromYouTube(
    videoId: string
  ): Promise<Pick<VideoBlock, 'title' | 'description' | 'image' | 'duration'>> {
    const query = new URLSearchParams({
      part: 'snippet,contentDetails',
      key: process.env.FIREBASE_API_KEY ?? '',
      id: videoId
    }).toString()
    const videosData: YoutubeVideosData = await (
      await fetch(`https://www.googleapis.com/youtube/v3/videos?${query}`)
    ).json()
    if (videosData.items[0] == null) {
      throw new GraphQLError('videoId cannot be found on YouTube', {
        extensions: { code: 'NOT_FOUND' }
      })
    }
    return {
      title: videosData.items[0].snippet.title,
      description: videosData.items[0].snippet.description,
      image: videosData.items[0].snippet.thumbnails.high.url,
      duration: parseISO8601Duration(
        videosData.items[0].contentDetails.duration
      )
    }
  }

  private async fetchFieldsFromCloudflare(
    videoId: string
  ): Promise<Pick<VideoBlock, 'title' | 'image' | 'duration' | 'endAt'>> {
    const response: CloudflareRetrieveVideoDetailsResponse = await (
      await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${
          process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
        }/stream/${videoId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_TOKEN ?? ''}`
          }
        }
      )
    ).json()

    if (response.result == null) {
      throw new GraphQLError('videoId cannot be found on Cloudflare', {
        extensions: { code: 'NOT_FOUND' }
      })
    }
    return {
      title: response.result.meta.name ?? response.result.uid,
      image: `${response.result.thumbnail}?time=2s`,
      duration: Math.round(response.result.duration),
      endAt: Math.round(response.result.duration)
    }
  }
}
