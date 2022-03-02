import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { journeysAdminConfig } from '../../../libs/storybook'
import { VideoDetails } from '.'

const VideoDetailsStory = {
  ...journeysAdminConfig,
  component: VideoDetails,
  title: 'Journeys-Admin/Editor/VideoDetails',
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
  videoId: 'nua1-uuid'
}

export default VideoDetailsStory as Meta
