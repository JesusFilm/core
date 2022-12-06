import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'
import { watchConfig } from '../../../libs/storybook'
import { videos } from '../../Videos/testData'
import { VideoContent } from './VideoContent'

const VideoContentStory = {
  ...watchConfig,
  component: VideoContent,
  title: 'Watch/Video/VideoContent'
}

const Template: Story<ComponentProps<typeof VideoContent>> = ({ ...args }) => (
  <VideoContent {...args} />
)

export const Default = Template.bind({})
Default.args = {
  video: videos[0]
}

export default VideoContentStory as Meta
