import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'

import { watchConfig } from '../../libs/storybook'

import {
  emptyResultsHandler,
  getResourceSectionHandlers
} from './ResourceSections/ResourceSection/ResourceSection.handlers'
import { ResourcesView } from './ResourcesView'

const ResourcesViewStory: Meta<typeof ResourcesView> = {
  ...watchConfig,
  component: ResourcesView,
  title: 'Watch/ResourcesView'
}

type Story = StoryObj<ComponentProps<typeof ResourcesView> & { query: string }>

const Template: Story = {
  render: () => (
    <InstantSearchTestWrapper>
      <ResourcesView />
    </InstantSearchTestWrapper>
  )
}

export const Default = {
  ...Template,
  parameters: {
    msw: {
      handlers: [getResourceSectionHandlers]
    }
  }
}

export const NoResultsFound = {
  ...Template,
  args: {
    query: 'Hello'
  },
  parameters: {
    msw: {
      handlers: [emptyResultsHandler]
    }
  }
}

export default ResourcesViewStory
