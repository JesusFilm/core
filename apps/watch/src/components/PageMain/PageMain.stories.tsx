import type { Meta, StoryObj } from '@storybook/react'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'

import { watchConfig } from '../../libs/storybook'
import {
  emptyResultsHandler,
  getAlgoliaVideosHandlers
} from '../PageVideos/PageVideos.handlers'
import { videos } from '../Videos/__generated__/testData'

import { PageMain } from '.'

const PageMainStory: Meta<typeof PageMain> = {
  ...watchConfig,
  component: PageMain,
  title: 'Watch/PageMain',
  parameters: {
    ...watchConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof PageMain> = {
  render: ({ ...args }) => (
    <InstantSearchTestWrapper>
      <PageMain {...args} />
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

export default PageMainStory
