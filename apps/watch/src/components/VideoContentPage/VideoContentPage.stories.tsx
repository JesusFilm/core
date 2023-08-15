import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'

import { watchConfig } from '../../libs/storybook'
import { getVideoChildrenMock } from '../../libs/useVideoChildren/getVideoChildrenMock'
import { VideoProvider } from '../../libs/videoContext'
import { getLanguagesSlugMock } from '../AudioLanguageDialog/testData'
import { getSubtitleMock } from '../SubtitleDialog/testData'
import { videos } from '../Videos/__generated__/testData'

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
