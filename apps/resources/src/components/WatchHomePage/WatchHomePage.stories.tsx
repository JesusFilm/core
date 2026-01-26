import type { Meta, StoryObj } from '@storybook/nextjs'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'

import { watchConfig } from '../../libs/storybook'
import { videos } from '../Videos/__generated__/testData'
import {
  emptyResultsHandler,
  getAlgoliaVideosHandlers
} from '../VideosPage/VideosPage.handlers'

import { WatchHomePage } from '.'

const WatchHomePageStory: Meta<typeof WatchHomePage> = {
  ...watchConfig,
  component: WatchHomePage,
  title: 'Watch/WatchHomePage',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof WatchHomePage> = {
  render: ({ ...args }) => (
    <InstantSearchTestWrapper>
      <WatchHomePage {...args} />
    </InstantSearchTestWrapper>
  )
}

export const Default = {
  ...Template,
  args: { videos },
  parameters: {
    msw: {
      handlers: [getAlgoliaVideosHandlers]
    }
  }
}

export const NoResultsFound = {
  ...Template,
  args: { videos },
  parameters: {
    msw: {
      handlers: [emptyResultsHandler]
    }
  }
}

export default WatchHomePageStory
