import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'
import { watchConfig } from '../../libs/storybook'
import { getStrategyCardDataHandlers } from '../StrategySections/StrategySection/StrategySection.handlers'
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
      <StrategiesView index={args.index} />
    </InstantSearchTestWrapper>
  )
}

export const Default = {
  ...Template,
  args: {
    query: '',
    index: false
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
    query: 'Hello',
    index: true
  },
  parameters: {
    msw: {
      handlers: [getStrategyCardDataHandlers]
    }
  }
}

export default StrategiesViewStory
