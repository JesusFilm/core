import { ComponentMeta, ComponentStory } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { watchConfig } from '../../libs/storybook'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/__generated__/testData'
import { getVideoChildrenMock } from '../../libs/useVideoChildren/getVideoChildrenMock'
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
  <MockedProvider mocks={[getVideoChildrenMock]}>
    <VideoProvider value={{ content: videos[0] }}>
      <VideoContainerPage />
    </VideoProvider>
  </MockedProvider>
)

export const Default = Template.bind({})

export default VideoContainerPageStory
