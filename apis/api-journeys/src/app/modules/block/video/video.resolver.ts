import { Parent, ResolveField, Resolver } from '@nestjs/graphql'

import { Block, VideoBlockSource } from '@core/prisma/journeys/client'

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

@Resolver('VideoBlock')
export class VideoBlockResolver {
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
}
