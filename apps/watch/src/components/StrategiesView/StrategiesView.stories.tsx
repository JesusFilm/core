import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'

import { watchConfig } from '../../libs/storybook'
import {
  emptyResultsHandler,
  getStrategyCardDataHandlers
} from '../StrategySections/StrategySection/StrategySection.handlers'

import { StrategiesView } from './StrategiesView'

const StrategiesViewStory: Meta<typeof StrategiesView> = {
  ...watchConfig,
  component: StrategiesView,
  title: 'Watch/StrategiesView'
}

type Story = StoryObj<ComponentProps<typeof StrategiesView> & { query: string }>

const Template: Story = {
  render: (args) => (
    <InstantSearchTestWrapper indexName="new-index-name" query={args.query}>
      <StrategiesView />
    </InstantSearchTestWrapper>
  )
}

export const Default = {
  ...Template,
  args: {
    query: ''
  },
  parameters: {
    msw: {
      handlers: [getStrategyCardDataHandlers]
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
