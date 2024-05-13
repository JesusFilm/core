import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { videos } from '@core/watch/ui/testDataGenerator/__generated__/testData'

import { watchConfig } from '../../libs/storybook'
import { getVideoChildrenMock } from '../../libs/useVideoChildren/getVideoChildrenMock'
import { VideoProvider } from '../../libs/videoContext'
import { getLanguagesSlugMock } from '../AudioLanguageDialog/testData'
import { getSubtitleMock } from '../SubtitleDialog/testData'

import { VideoContentPage } from '.'

const VideoContentPageStory: Meta<typeof VideoContentPage> = {
  ...watchConfig,
  component: VideoContentPage,
  title: 'Watch/VideoContentPage',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof VideoContentPage> = {
  render: () => (
    <MockedProvider
      mocks={[getLanguagesSlugMock, getSubtitleMock, getVideoChildrenMock]}
    >
      <VideoProvider value={{ content: videos[0] }}>
        <VideoContentPage />
      </VideoProvider>
    </MockedProvider>
  )
}

export const Default = { ...Template }

export default VideoContentPageStory
