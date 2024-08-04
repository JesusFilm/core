import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'

import { watchConfig } from '../../libs/storybook/config'
import { videos } from '../Videos/__generated__/testData'

import { VideoGrid } from './VideoGrid'

const VideoGridStory: Meta<typeof VideoGrid> = {
  ...watchConfig,
  component: VideoGrid,
  title: 'Watch/VideoGrid'
}

const Template: StoryObj<typeof VideoGrid> = {
  render: (args) => {
    return (
      <InstantSearchTestWrapper indexName="video-variants-stg">
        <Stack spacing={2}>
          <Box>
            <VideoGrid {...args} />
          </Box>
          <Box>
            <VideoGrid {...args} videos={[]} />
          </Box>
          <Box>
            <VideoGrid {...args} variant="contained" />
          </Box>
          <Box>
            <VideoGrid {...args} videos={[]} variant="contained" />
          </Box>
        </Stack>
      </InstantSearchTestWrapper>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    videos: videos.slice(0, 3)
  }
}

export const Pagination = {
  ...Template,
  args: {
    videos: videos.slice(0, 3),
    onLoadMore: noop
  }
}

export default VideoGridStory
