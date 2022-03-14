import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { VideoDetails } from '.'

const VideoDetailsStory = {
  ...journeysAdminConfig,
  component: VideoDetails,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoDetails',
  argTypes: { onSelect: { action: 'clicked' } }
}

const Template: Story = ({ videoId, onSelect }) => {
  const [open, setOpen] = useState(true)

  return (
    <VideoDetails
      videoId={videoId}
      open={open}
      handleOpen={() => setOpen(!open)}
      onSelect={onSelect}
    />
  )
}

export const Default = Template.bind({})
Default.args = {
  videoId: '2_0-AndreasStory'
}

export default VideoDetailsStory as Meta
