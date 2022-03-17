import { Story, Meta } from '@storybook/react'
import { TreeBlock } from '@core/journeys/ui'
import Stack from '@mui/material/Stack'

import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../../__generated__/GetJourney'
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
    title: '',
    startAt: 0,
    endAt: null,
    muted: true,
    autoplay: true,
    fullsize: true,
    videoContent: {
      __typename: 'VideoGeneric',
      src: ''
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
export const Filled: Story = () => {
  const video: TreeBlock<VideoBlock> = {
    id: 'video1.id',
    __typename: 'VideoBlock',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    title: 'Video Name',
    startAt: 0,
    endAt: null,
    muted: true,
    autoplay: true,
    fullsize: true,
    videoContent: {
      __typename: 'VideoGeneric',
      src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
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
