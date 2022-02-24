import { Story, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../../libs/storybook'
import { VideoLibrary } from '.'

const VideoLibraryStory = {
  ...simpleComponentConfig,
  component: VideoLibrary,
  title: 'Journeys-Admin/Editor/VideoLibrary'
}

const Template: Story = ({ openLibrary, onClose, onSelect }) => (
  <VideoLibrary
    onSelect={onSelect}
  />
)

export const Default = Template.bind({})
Default.args = {
  openLibrary: true,
  onClose: () => console.log('onClose'),
  onSelect: (id: string) => console.log('onSelect', id)
}

export default VideoLibraryStory as Meta
