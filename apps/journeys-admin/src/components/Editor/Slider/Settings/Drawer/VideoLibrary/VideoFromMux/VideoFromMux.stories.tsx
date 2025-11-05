import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { VideoFromMux } from '.'

const VideoFromMuxStory: Meta<typeof VideoFromMux> = {
  ...simpleComponentConfig,
  component: VideoFromMux,
  title:
    'Journeys-Admin/Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromMux',
  argTypes: { onSelect: { action: 'clicked' } },
  parameters: {
    ...simpleComponentConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof VideoFromMux> = {
  render: ({ onSelect }) => (
    <MockedProvider mocks={[]}>
      <Box sx={{ bgcolor: 'background.paper', pb: 5 }}>
        <VideoFromMux onSelect={onSelect} />
      </Box>
    </MockedProvider>
  )
}

export const Default = { ...Template }

export default VideoFromMuxStory
