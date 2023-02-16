import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { watchConfig } from '../../libs/storybook'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/__generated__/testData'
import { getSubtitleMock } from '../SubtitleDialog/testData'
import { getLanguagesSlugMock } from '../AudioLanguageDialog/testData'
import { getVideoChildrenMock } from '../../libs/useVideoChildren/getVideoChildrenMock'
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

const Template: Story<ComponentProps<typeof VideoContentPage>> = () => (
  <MockedProvider
    mocks={[getLanguagesSlugMock, getSubtitleMock, getVideoChildrenMock]}
  >
    <VideoProvider value={{ content: videos[0] }}>
      <VideoContentPage />
    </VideoProvider>
  </MockedProvider>
)

export const Default = Template.bind({})

export default VideoContentPageStory as Meta
