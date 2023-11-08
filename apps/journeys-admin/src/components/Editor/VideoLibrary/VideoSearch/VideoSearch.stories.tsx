import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { ReactElement, useState } from 'react'

import { simpleComponentConfig } from '../../../../libs/storybook'

import { VideoSearch } from './VideoSearch'

const VideoSearchStory: Meta<typeof VideoSearch> = {
  ...simpleComponentConfig,
  component: VideoSearch,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoSearch'
}

const VideoSearchComponent = (args): ReactElement => {
  const [title, setTitle] = useState<string>()

  return (
    <Box
      sx={{
        width: '300px',
        height: '200px'
      }}
    >
      <VideoSearch value={title} onChange={setTitle} {...args} />
    </Box>
  )
}

const Template: StoryObj<typeof VideoSearch> = {
  render: (args) => <VideoSearchComponent {...args} />
}

export const Default = { ...Template }

export const CustomLabel = {
  ...Template,
  args: {
    label: 'Paste any YouTube Link'
  }
}

export default VideoSearchStory
