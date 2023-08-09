import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, Story } from '@storybook/react'

import { simpleComponentConfig } from '../../../../libs/storybook'

import { VideoFromCloudflare } from '.'

const VideoFromCloudflareStory = {
  ...simpleComponentConfig,
  component: VideoFromCloudflare,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoFromCloudflare',
  argTypes: { onSelect: { action: 'clicked' } },
  parameters: {
    ...simpleComponentConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = ({ onSelect }) => (
  <MockedProvider mocks={[]}>
    <Box sx={{ bgcolor: 'background.paper', pb: 5 }}>
      <VideoFromCloudflare onSelect={onSelect} />
    </Box>
  </MockedProvider>
)

export const Default = Template.bind({})

export default VideoFromCloudflareStory as Meta
