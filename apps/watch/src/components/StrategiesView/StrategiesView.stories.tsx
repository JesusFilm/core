import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'

import { watchConfig } from '../../libs/storybook'

import { StrategiesView } from './StrategiesView'
import {
  emptyResultsHandler,
  getStrategySectionHandlers
} from './StrategySections/StrategySection/StrategySection.handlers'

const StrategiesViewStory: Meta<typeof StrategiesView> = {
  ...watchConfig,
  component: StrategiesView,
  title: 'Watch/StrategiesView'
}

type Story = StoryObj<ComponentProps<typeof StrategiesView> & { query: string }>

const Template: Story = {
  render: () => (
    <InstantSearchTestWrapper>
      <StrategiesView />
    </InstantSearchTestWrapper>
  )
}

export const Default = {
  ...Template,
  parameters: {
    msw: {
      handlers: [getStrategySectionHandlers]
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

export default StrategiesViewStory
