import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'

import { watchConfig } from '../../libs/storybook'
import { getVideoChildrenMock } from '../../libs/useVideoChildren/getVideoChildrenMock'
import { VideoProvider } from '../../libs/videoContext'
import { getLanguagesSlugMock } from '../AudioLanguageDialog/testData'
import { getSubtitleMock } from '../SubtitleDialog/testData'
import { videos } from '../Videos/__generated__/testData'

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
        <InstantSearchTestWrapper>
          <VideoContentPage />
        </InstantSearchTestWrapper>
      </VideoProvider>
    </MockedProvider>
  )
}

export const Default = { ...Template }

export default VideoContentPageStory
