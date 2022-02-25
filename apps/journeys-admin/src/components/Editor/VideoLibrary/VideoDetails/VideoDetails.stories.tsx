import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { VideoDetails } from '.'

const VideoDetailsStory = {
  ...journeysAdminConfig,
  component: VideoDetails,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoDetails'
}

const Template: Story = ({ open, onClose, onSelect }) => (
  <VideoDetails open={open} onClose={onClose} onSelect={onSelect} />
)

export const Default = Template.bind({})
Default.args = {
  open: true,
  onClose: () => console.log('onClose'),
  onSelect: (id: string) => console.log('onSelect', id)
}

export default VideoDetailsStory as Meta
