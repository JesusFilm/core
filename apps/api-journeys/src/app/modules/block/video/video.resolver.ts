import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'
import fetch from 'node-fetch'
import { object, string } from 'yup'
import Mux from '@mux/mux-node'

import { Block, VideoBlockSource } from '.prisma/api-journeys-client'
import { CaslAbility } from '@core/nest/common/CaslAuthModule'

import {
  VideoBlock,
  VideoBlockCreateInput,
  VideoBlockUpdateInput
} from '../../../__generated__/graphql'
import { Action, AppAbility } from '../../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../../lib/casl/caslGuard'
import { PrismaService } from '../../../lib/prisma.service'
import { INCLUDE_JOURNEY_ACL } from '../../journey/journey.acl'
import { BlockService } from '../block.service'

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
const videoBlockMuxSchema = object().shape({
  videoId: string().nullable()
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
    .map((period) =>
      period != null ? Number.parseInt(period.replace(/\D/, '')) : 0
    )
  return (
    (((years * 365 + weeks * 7 + days) * 24 + hours) * 60 + minutes) * 60 +
    seconds
  )
}

function getClient(): Mux {
  if (process.env.MUX_ACCESS_TOKEN_ID == null)
    throw new Error('Missing MUX_ACCESS_TOKEN_ID')

  if (process.env.MUX_SECRET_KEY == null)
    throw new Error('Missing MUX_SECRET_KEY')

  return new Mux({
    tokenId: process.env.MUX_ACCESS_TOKEN_ID,
    tokenSecret: process.env.MUX_SECRET_KEY
  })
}

@Resolver('VideoBlock')
export class VideoBlockResolver {
  constructor(
    private readonly blockService: BlockService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  @UseGuards(AppCaslGuard)
  async videoBlockCreate(
    @CaslAbility() ability: AppAbility,
    @Args('input') input: VideoBlockCreateInput
  ): Promise<Block> {
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
      case VideoBlockSource.mux:
        await videoBlockMuxSchema.validate(input)
        input = {
          ...input,
          ...(await this.fetchFieldsFromMux(input.videoId as string)),
          objectFit: null
        }
    }
    return await this.prismaService.$transaction(async (tx) => {
      if (input.isCover === true) {
        const parentBlock = await tx.block.findUnique({
          where: { id: input.parentBlockId },
          include: { coverBlock: true }
        })
        if (parentBlock == null)
          throw new GraphQLError('parent block not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        if (parentBlock.coverBlock != null)
          await this.blockService.removeBlockAndChildren(parentBlock.coverBlock)
      }

      const block = await tx.block.create({
        data: {
          ...omit(
            input,
            'parentBlockId',
            'journeyId',
            'posterBlockId',
            'isCover'
          ),
          id: input.id ?? undefined,
          typename: 'VideoBlock',
          journey: { connect: { id: input.journeyId } },
          parentBlock: { connect: { id: input.parentBlockId } },
          posterBlock:
            input.posterBlockId != null
              ? { connect: { id: input.posterBlockId } }
              : undefined,
          parentOrder:
            input.isCover === true
              ? null
              : (
                  await this.blockService.getSiblings(
                    input.journeyId,
                    input.parentBlockId
                  )
                ).length,
          coverBlockParent:
            input.isCover === true && input.parentBlockId != null
              ? { connect: { id: input.parentBlockId } }
              : undefined
        },
        include: {
          action: true,
          ...INCLUDE_JOURNEY_ACL
        }
      })
      await this.blockService.setJourneyUpdatedAt(tx, block)
      if (!ability.can(Action.Update, subject('Journey', block.journey)))
        throw new GraphQLError('user is not allowed to create block', {
          extensions: { code: 'FORBIDDEN' }
        })
      // dupilicate and race condition check
      const existingVideoOnParent = await tx.block.findFirst({
        where: {
          parentBlockId: input.parentBlockId,
          typename: 'VideoBlock',
          id: { not: block.id },
          deletedAt: null
        }
      })
      if (existingVideoOnParent != null)
        throw new GraphQLError(
          'Parent block already has an existing video block',
          {
            extensions: { code: 'BAD_USER_INPUT' }
          }
        )
      return block
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async videoBlockUpdate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('input') input: VideoBlockUpdateInput
  ): Promise<Block> {
    const block = await this.prismaService.block.findUnique({
      where: { id },
      include: {
        action: true,
        journey: {
          include: {
            team: { include: { userTeams: true } },
            userJourneys: true
          }
        }
      }
    })
    if (block == null)
      throw new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Update, subject('Journey', block.journey)))
      throw new GraphQLError('user is not allowed to update block', {
        extensions: { code: 'FORBIDDEN' }
      })
    switch (input.source ?? block.source) {
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
          duration: null,
          ...input,
          ...{
            title: null,
            description: null,
            image: null
          }
        }
        await videoBlockInternalSchema.validate({ ...block, ...input })
        break
      case VideoBlockSource.mux:
        await videoBlockMuxSchema.validate({
          ...block,
          ...input
        })
        if (input.videoId != null) {
          input = {
            ...(await this.fetchFieldsFromMux(input.videoId)),
            ...input
          }
        }
        break
    }
    return await this.blockService.update(id, input)
  }

  @ResolveField('video')
  video(
    @Parent()
    block: Block
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
    block: Block
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
      image: `${response.result.thumbnail}?time=2s&height=768`,
      duration: Math.round(response.result.duration),
      endAt: Math.round(response.result.duration)
    }
  }

  private async fetchFieldsFromMux(
    videoId: string
  ): Promise<Pick<VideoBlock, 'title' | 'image' | 'duration' | 'endAt'>> {
    const response = await await getClient().video.assets.retrieve(videoId)

    if (response == null) {
      throw new GraphQLError('videoId cannot be found on Mux', {
        extensions: { code: 'NOT_FOUND' }
      })
    }
    return {
      title: response.id,
      image: `${response.static_renditions?.[0].url}`,
      duration: Math.round(response.duration ?? 0),
      endAt: Math.round(response.duration ?? 0)
    }
  }
}
