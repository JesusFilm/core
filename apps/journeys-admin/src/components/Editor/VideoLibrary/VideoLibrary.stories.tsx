import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../libs/storybook'
import { VideoLibrary } from '.'

const VideoLibraryStory = {
  ...journeysAdminConfig,
  component: VideoLibrary,
  title: 'Journeys-Admin/Editor/VideoLibrary'
}

const Template: Story = ({ open, onClose, onSelect }) => (
  <VideoLibrary open={open} onClose={onClose} onSelect={onSelect} />
)

export const Default = Template.bind({})
Default.args = {
  open: true,
  onClose: () => console.log('onClose'),
  onSelect: (id: string) => console.log('onSelect', id)
}

export default VideoLibraryStory as Meta
