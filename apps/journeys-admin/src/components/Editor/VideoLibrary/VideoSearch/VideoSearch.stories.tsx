import Box from '@mui/material/Box'
import { Meta, Story } from '@storybook/react'
import { useState } from 'react'

import { simpleComponentConfig } from '../../../../libs/storybook'

import { VideoSearch } from './VideoSearch'

const VideoSearchStory = {
  ...simpleComponentConfig,
  component: VideoSearch,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoSearch'
}

const Template: Story = (args) => {
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

export const Default = Template.bind({})

export const CustomLabel = Template.bind({})
CustomLabel.args = {
  label: 'Paste any YouTube Link'
}

export default VideoSearchStory as Meta
