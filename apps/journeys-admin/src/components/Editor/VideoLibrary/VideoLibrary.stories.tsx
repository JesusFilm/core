import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { journeysAdminConfig } from '../../../libs/storybook'
import { VideoLibrary } from '.'

const VideoLibraryStory = {
  ...journeysAdminConfig,
  component: VideoLibrary,
  title: 'Journeys-Admin/Editor/VideoLibrary',
  argTypes: { onSelect: { action: 'clicked' } }
}

const Template: Story = ({ onSelect }) => {
  const [open, setOpen] = useState(true)

  return (
    <VideoLibrary
      open={open}
      onClose={() => setOpen(false)}
      onSelect={onSelect}
    />
  )
}

export const Default = Template.bind({})

export default VideoLibraryStory as Meta
