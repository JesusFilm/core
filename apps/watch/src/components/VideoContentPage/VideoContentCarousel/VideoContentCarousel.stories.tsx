import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { watchConfig } from '../../../libs/storybook'
import { VideoProvider } from '../../../libs/videoContext'
import { VideoContentFields } from '../../../../__generated__/VideoContentFields'
import { videos } from '../../Videos/testData'
import { VideoContentCarousel } from '.'

const VideoContentCarouselStory = {
  ...watchConfig,
  component: VideoContentCarousel,
  title: 'Watch/VideoContentCarousel',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<
  ComponentProps<typeof VideoContentCarousel> & {
    content: VideoContentFields
    container?: VideoContentFields
  }
> = ({ ...args }) => (
  <VideoProvider value={{ ...args }}>
    <VideoContentCarousel />
  </VideoProvider>
)

export const Default = Template.bind({})
Default.args = {
  content: videos[0]
}

export const WithContainer = Template.bind({})
WithContainer.args = {
  content: videos[19],
  container: videos[0]
}

export const Playing = Template.bind({})
Playing.args = {
  ...WithContainer.args
}

export default VideoContentCarouselStory as Meta
