import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { watchConfig } from '../../libs/storybook'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/testData'
import { VideoContainerPage } from '.'

const VideoContainerPageStory = {
  ...watchConfig,
  component: VideoContainerPage,
  title: 'Watch/VideoContainerPage',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<ComponentProps<typeof VideoContainerPage>> = ({
  ...args
}) => (
  <VideoProvider value={{ content: videos[0] }}>
    <VideoContainerPage {...args} />
  </VideoProvider>
)

export const Default = Template.bind({})
Default.args = {
  content: videos[0]
}

export default VideoContainerPageStory as Meta
