import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '../../../../libs/storybook'

import { VideoFromCloudflare } from '.'

const VideoFromCloudflareStory: Meta<typeof VideoFromCloudflare> = {
  ...simpleComponentConfig,
  component: VideoFromCloudflare,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoFromCloudflare',
  argTypes: { onSelect: { action: 'clicked' } },
  parameters: {
    ...simpleComponentConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof VideoFromCloudflare> = {
  render: ({ onSelect }) => (
    <MockedProvider mocks={[]}>
      <Box sx={{ bgcolor: 'background.paper', pb: 5 }}>
        <VideoFromCloudflare onSelect={onSelect} />
      </Box>
    </MockedProvider>
  )
}

export const Default = { ...Template }

export default VideoFromCloudflareStory
