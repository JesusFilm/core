import { MuxMetadata } from '@core/shared/ui/muxMetadataType'

import { TreeBlock } from '../../../../libs/block'
import { StepFields as StepBlock } from '../../../Step/__generated__/StepFields'
import {
  VideoFields as VideoBlock,
  VideoFields_mediaVideo
} from '../../__generated__/VideoFields'

interface GetMuxMetadataProps {
  journeyId: string
  videoBlock: TreeBlock<VideoBlock>
}

export function getMuxMetadata({
  journeyId,
  videoBlock
}: GetMuxMetadataProps): MuxMetadata {
  const env_key = getEnv(videoBlock.mediaVideo)
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
        video_id: videoBlock.videoId,
        video_title: videoBlock.mediaVideo.title[0].value,
        video_language_code: videoBlock.videoVariantLanguageId
      }
      break
    case 'YouTube':
      videoData = {
        video_id: videoBlock.videoId,
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

function getEnv(mediaVideo: VideoFields_mediaVideo | null): string {
  if (mediaVideo == null) return ''

  const envKeys: { [key: string]: { userGenerated: string; default: string } } =
    {
      'localhost:4100': {
        userGenerated: '2b4rekmvdrkudlnbsqr9uuqnl',
        default: 'glfgn69ai7ah81no2oro3t58m'
      },
      'your-stage.nextstep.is': {
        userGenerated: '6cdf6sod4lsa3d58m220f63qn',
        default: 'gbse3q6nkpb1kug1ropc7uacg'
      },
      'your.nextstep.is': {
        userGenerated: 'bmthvokooapuadu6ti0ld5r57',
        default: 'e2thjm49ulacc6tgf56laoeak'
      }
    }

  const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || ''
  const envKey = envKeys[domain]

  if (!envKey) return ''

  return mediaVideo.__typename === 'MuxVideo'
    ? envKey.userGenerated
    : envKey.default
}
