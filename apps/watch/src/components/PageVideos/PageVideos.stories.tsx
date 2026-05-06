import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'

import { watchConfig } from '../../libs/storybook'

import { PageVideos } from './PageVideos'
import {
  emptyResultsHandler,
  getAlgoliaVideosHandlers
} from './PageVideos.handlers'

const VideosStory: Meta<typeof PageVideos> = {
  ...watchConfig,
  component: PageVideos,
  title: 'Watch/PageVideos'
}

const Template: StoryObj<
  ComponentProps<typeof PageVideos> & { limit: number }
> = {
  render: () => (
    <InstantSearchTestWrapper>
      <PageVideos />
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
