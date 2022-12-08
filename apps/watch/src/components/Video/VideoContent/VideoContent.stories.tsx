import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'
import { VideoProvider } from '../../../libs/videoContext'
import { watchConfig } from '../../../libs/storybook'
import { videos } from '../../Videos/testData'
import { VideoContent } from './VideoContent'

const VideoContentStory = {
  ...watchConfig,
  component: VideoContent,
  title: 'Watch/Video/VideoContent'
}

const Template: Story<ComponentProps<typeof VideoContent>> = () => (
  <VideoProvider value={{ content: videos[0] }}>
    <VideoContent />
  </VideoProvider>
)

export const Default = Template.bind({})

export default VideoContentStory as Meta
