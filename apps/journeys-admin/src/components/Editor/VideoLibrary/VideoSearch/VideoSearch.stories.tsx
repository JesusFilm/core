import { useState } from 'react'
import { Story, Meta } from '@storybook/react'
import Box from '@mui/material/Box'
import { simpleComponentConfig } from '../../../../libs/storybook'
import { VideoSearch } from './VideoSearch'

const VideoSearchStory = {
  ...simpleComponentConfig,
  component: VideoSearch,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoSearch'
}

const Template: Story = () => {
  const [title, setTitle] = useState<string>()

  return (
    <Box
      sx={{
        width: '300px',
        height: '200px'
      }}
    >
      <VideoSearch title={title} setTitle={setTitle} />
    </Box>
  )
}

export const Default = Template.bind({})

export default VideoSearchStory as Meta
