import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'

import { watchConfig } from '../../libs/storybook'

import { VideosPage } from './VideosPage'
import {
  emptyResultsHandler,
  getAlgoliaVideosHandlers
} from './VideosPage.handlers'

const VideosStory: Meta<typeof VideosPage> = {
  ...watchConfig,
  component: VideosPage,
  title: 'Watch/VideosPage'
}

const Template: StoryObj<
  ComponentProps<typeof VideosPage> & { limit: number }
> = {
  render: () => (
    <InstantSearchTestWrapper>
      <VideosPage />
    </InstantSearchTestWrapper>
  )
}

export const Default = {
  ...Template,
  parameters: {
    msw: {
      handlers: [getAlgoliaVideosHandlers]
    }
  }
}

export const NoResultsFound = {
  ...Template,
  parameters: {
    msw: {
      handlers: [emptyResultsHandler]
    }
  }
}

export default VideosStory
