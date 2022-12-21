import { ComponentMeta, ComponentStory } from '@storybook/react'
import { watchConfig } from '../../libs/storybook'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/testData'
import { VideoContainerPage } from '.'

const VideoContainerPageStory: ComponentMeta<typeof VideoContainerPage> = {
  ...watchConfig,
  component: VideoContainerPage,
  title: 'Watch/VideoContainerPage',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: ComponentStory<typeof VideoContainerPage> = () => (
  <VideoProvider value={{ content: videos[0] }}>
    <VideoContainerPage />
  </VideoProvider>
)

export const Default = Template.bind({})

export default VideoContainerPageStory
