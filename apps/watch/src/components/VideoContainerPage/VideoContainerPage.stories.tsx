import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { watchConfig } from '../../libs/storybook'
import { getVideoChildrenMock } from '../../libs/useVideoChildren/getVideoChildrenMock'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/__generated__/testData'

import { VideoContainerPage } from '.'

const VideoContainerPageStory: Meta<typeof VideoContainerPage> = {
  ...watchConfig,
  component: VideoContainerPage,
  title: 'Watch/VideoContainerPage',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof VideoContainerPage> = {
  render: () => (
    <MockedProvider mocks={[getVideoChildrenMock]}>
      <VideoProvider value={{ content: videos[0] }}>
        <VideoContainerPage />
      </VideoProvider>
    </MockedProvider>
  )
}
export const Default = { ...Template }

export default VideoContainerPageStory
