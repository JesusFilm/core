import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import noop from 'lodash/noop'

import { watchConfig } from '../../libs/storybook/config'
import { videos } from '../Videos/__generated__/testData'

import { VideoGrid } from './VideoGrid'

const VideoGridStory: ComponentMeta<typeof VideoGrid> = {
  ...watchConfig,
  component: VideoGrid,
  title: 'Watch/VideoGrid'
}

const Template: ComponentStory<typeof VideoGrid> = (args) => {
  return (
    <Stack spacing={2}>
      <Box>
        <VideoGrid {...args} hasNextPage />
      </Box>
      <Box>
        <VideoGrid {...args} videos={[]} loading />
      </Box>
      <Box>
        <VideoGrid {...args} variant="contained" />
      </Box>
      <Box>
        <VideoGrid {...args} videos={[]} variant="contained" loading />
      </Box>
    </Stack>
  )
}

export const Default = Template.bind({})
Default.args = {
  videos: videos.slice(0, 3)
}

export const Pagination = Template.bind({})
Pagination.args = {
  videos: videos.slice(0, 3),
  onLoadMore: noop
}

export default VideoGridStory
