import { MockedProvider } from '@apollo/client/testing'
import type { Meta, StoryObj } from '@storybook/nextjs'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'

import { watchConfig } from '../../libs/storybook'
import { getVideoChildrenMock } from '../../libs/useVideoChildren/getVideoChildrenMock'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/__generated__/testData'

import { PageVideoContainer } from '.'

const PageVideoContainerStory: Meta<typeof PageVideoContainer> = {
  ...watchConfig,
  component: PageVideoContainer,
  title: 'Watch/PageVideoContainer',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof PageVideoContainer> = {
  render: () => (
    <MockedProvider mocks={[getVideoChildrenMock]}>
      <VideoProvider value={{ content: videos[0] }}>
        <InstantSearchTestWrapper>
          <PageVideoContainer />
        </InstantSearchTestWrapper>
      </VideoProvider>
    </MockedProvider>
  )
}
export const Default = { ...Template }

export default PageVideoContainerStory
