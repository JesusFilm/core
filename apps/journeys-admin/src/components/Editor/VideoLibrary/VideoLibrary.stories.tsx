import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { journeysAdminConfig } from '../../../libs/storybook'
import { VideoLibrary } from '.'

const VideoLibraryStory = {
  ...journeysAdminConfig,
  component: VideoLibrary,
  title: 'Journeys-Admin/Editor/VideoLibrary'
}

const Template: Story = ({ open, onClose }) => {
  const [selectedVideo, setSelectedVideo] = useState<string>()

  // this is not the actual onSelect function
  const onSelect = (id: string): void => {
    setSelectedVideo(id)
    console.log('Selected Video: ', selectedVideo)
  }

  return <VideoLibrary open={open} onClose={onClose} onSelect={onSelect} />
}

export const Default = Template.bind({})
Default.args = {
  open: true,
  onClose: () => console.log('onClose')
}

export default VideoLibraryStory as Meta
