import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { watchConfig } from '../../libs/storybook'
import { videos } from '../VideosPage/testData'
import { VideoContentPage } from '.'

const VideoContentPageStory = {
  ...watchConfig,
  component: VideoContentPage,
  title: 'Watch/VideoContentPage',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<ComponentProps<typeof VideoContentPage>> = ({
  ...args
}) => <VideoContentPage {...args} />

export const Default = Template.bind({})
Default.args = {
  content: videos[0]
}

export default VideoContentPageStory as Meta
