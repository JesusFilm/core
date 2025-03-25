import { MuxMetadata } from '@core/shared/ui/muxMetadataType'

import { TreeBlock } from '../../../../libs/block'
import { VideoFields as VideoBlock } from '../../__generated__/VideoFields'

export interface GetMuxMetadataProps {
  journeyId: string
  videoBlock: Pick<
    TreeBlock<VideoBlock>,
    'mediaVideo' | 'title' | 'endAt' | 'id' | 'videoVariantLanguageId'
  >
}

export function getMuxMetadata({
  journeyId,
  videoBlock
}: GetMuxMetadataProps): MuxMetadata {
  // Retrieve the environment keys from the environment variables
  const userGeneratedKey =
    process.env.NEXT_PUBLIC_MUX_USER_GENERATED_REPORTING_KEY || ''
  const defaultKey = process.env.NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY || ''

  const env_key =
    videoBlock.mediaVideo?.__typename === 'MuxVideo'
      ? userGeneratedKey
      : defaultKey

  let videoData = {}
  switch (videoBlock.mediaVideo?.__typename) {
    case 'MuxVideo':
      videoData = {
        video_id: videoBlock.mediaVideo.assetId ?? '',
        video_title: videoBlock.title
      }
      break
    case 'Video':
      videoData = {
        video_id: videoBlock.mediaVideo.id,
        video_title: videoBlock.mediaVideo.title[0].value,
        video_language_code: videoBlock.videoVariantLanguageId
      }
      break
    case 'YouTube':
      videoData = {
        video_id: videoBlock.mediaVideo.id,
        video_title: videoBlock.title
      }
      break
  }

  return {
    env_key,
    video_duration: videoBlock.endAt ?? undefined,
    custom_1: journeyId,
    custom_2: videoBlock.id,
    player_name: 'journeys',
    ...videoData
  }
}
