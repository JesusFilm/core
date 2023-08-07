import Stack from '@mui/material/Stack'
import { Meta, Story } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../../__generated__/GetJourney'
import { VideoBlockSource } from '../../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../../libs/storybook'

import { Video } from './Video'

const VideoStory = {
  ...simpleComponentConfig,
  component: Video,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Video'
}

export const Default: Story = () => {
  const video: TreeBlock<VideoBlock> = {
    id: 'video1.id',
    __typename: 'VideoBlock',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    startAt: 0,
    endAt: null,
    muted: true,
    autoplay: true,
    fullsize: true,
    action: null,
    videoId: null,
    videoVariantLanguageId: null,
    source: VideoBlockSource.internal,
    title: null,
    description: null,
    duration: null,
    image: null,
    video: null,
    posterBlockId: null,
    objectFit: null,
    children: []
  }
  return (
    <Stack
      direction="row"
      spacing={4}
      sx={{
        overflowX: 'auto',
        py: 5,
        px: 6
      }}
    >
      <Video {...video} />
    </Stack>
  )
}

export const Filled: Story = () => {
  const video: TreeBlock<VideoBlock> = {
    id: 'video1.id',
    __typename: 'VideoBlock',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    startAt: 0,
    endAt: null,
    muted: true,
    autoplay: true,
    fullsize: true,
    action: null,
    videoId: '2_0-FallingPlates',
    videoVariantLanguageId: '529',
    source: VideoBlockSource.internal,
    title: null,
    description: null,
    duration: null,
    image: null,
    objectFit: null,
    video: {
      __typename: 'Video',
      id: '2_0-FallingPlates',
      title: [
        {
          __typename: 'Translation',
          value: 'FallingPlates'
        }
      ],
      image:
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
      variant: {
        __typename: 'VideoVariant',
        id: '2_0-FallingPlates-529',
        hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
      }
    },
    posterBlockId: null,
    children: []
  }

  return (
    <Stack
      direction="row"
      spacing={4}
      sx={{
        overflowX: 'auto',
        py: 5,
        px: 6
      }}
    >
      <Video {...video} />
    </Stack>
  )
}

export default VideoStory as Meta
