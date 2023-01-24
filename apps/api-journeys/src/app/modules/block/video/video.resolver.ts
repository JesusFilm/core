import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { object, string } from 'yup'
import fetch from 'node-fetch'
import { UserInputError } from 'apollo-server-errors'
import { BlockService } from '../block.service'
import {
  Action,
  CardBlock,
  Role,
  UserJourneyRole,
  VideoBlock,
  VideoBlockCreateInput,
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../__generated__/graphql'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'

const videoBlockYouTubeSchema = object().shape({
  videoId: string().matches(
    /^[-\w]{11}$/,
    'videoId must be a valid YouTube videoId'
  )
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
  constructor(private readonly blockService: BlockService) {}

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
  ): Promise<VideoBlock> {
    switch (input.source) {
      case VideoBlockSource.youTube:
        await videoBlockYouTubeSchema.validate(input)
        input = {
          ...input,
          ...(await this.fetchFieldsFromYouTube(input.videoId as string)),
          objectFit: null
        }
        break
      case VideoBlockSource.internal:
        await videoBlockInternalSchema.validate(input)
        break
    }

    if (input.isCover === true) {
      const coverBlock: VideoBlock = await this.blockService.save({
        ...input,
        __typename: 'VideoBlock',
        parentOrder: null
      })
      const parentBlock: CardBlock = await this.blockService.get(
        input.parentBlockId
      )

      await this.blockService.update(input.parentBlockId, {
        coverBlockId: coverBlock.id
      })

      if (parentBlock.coverBlockId != null) {
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

    const block: VideoBlock = await this.blockService.save({
      ...input,
      __typename: 'VideoBlock',
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

    return await this.blockService.update(block.id, { ...block, action })
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
    const block = await this.blockService.get<VideoBlock>(id)
    switch (input.source ?? block.source) {
      case VideoBlockSource.youTube:
        await videoBlockYouTubeSchema.validate({ ...block, ...input })
        if (input.videoId != null) {
          input = {
            ...input,
            ...(await this.fetchFieldsFromYouTube(input.videoId)),
            objectFit: null
          }
        }
        break
      case VideoBlockSource.internal:
        input = {
          ...input,
          ...{
            title: null,
            description: null,
            image: null,
            duration: null
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
      throw new UserInputError('videoId cannot be found on YouTube', {
        videoId: ['videoId cannot be found on YouTube']
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
}
