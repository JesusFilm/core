import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'
import { ComponentProps } from 'react'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'

import { watchConfig } from '../../../../libs/storybook'

import { StrategySection } from './StrategySection'
import { getStrategySectionHandlers } from './StrategySection.handlers'

const StrategySectionStory: Meta<typeof StrategySection> = {
  ...watchConfig,
  component: StrategySection,
  title: 'Watch/StrategiesView/StrategySections/StrategySection'
}

type Story = StoryObj<ComponentProps<typeof StrategySection>>

const Template: Story = {
  render: (args) => (
    <InstantSearchTestWrapper>
      <StrategySection {...args} />
    </InstantSearchTestWrapper>
  )
}

export const Default = {
  ...Template,
  args: {
    handleItemSearch: noop,
    index: 0
  },
  parameters: {
    msw: {
      handlers: [getStrategySectionHandlers]
    }
  }
}

export default StrategySectionStory
