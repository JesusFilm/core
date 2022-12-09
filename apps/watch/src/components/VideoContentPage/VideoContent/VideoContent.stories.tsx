import { Meta, Story } from '@storybook/react'
import { VideoProvider } from '../../../libs/videoContext'
import { watchConfig } from '../../../libs/storybook'
import { videos } from '../../Videos/testData'
import { VideoContent } from './VideoContent'

const VideoContentStory = {
  ...watchConfig,
  component: VideoContent,
  title: 'Watch/VideoContentPage/VideoContent'
}

const Template: Story = () => (
  <VideoProvider value={{ content: videos[0] }}>
    <VideoContent />
  </VideoProvider>
)

export const Default = Template.bind({})

export default VideoContentStory as Meta
