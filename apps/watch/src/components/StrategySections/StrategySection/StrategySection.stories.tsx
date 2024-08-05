import Box from '@mui/material/Box'
import { jest } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'
import { SearchBar } from '@core/journeys/ui/SearchBar'

import { watchConfig } from '../../../libs/storybook'

import { StrategySection } from './StrategySection'
import { getStrategyCardDataHandlers } from './StrategySection.handlers'

const StrategySectionStory: Meta<typeof StrategySection> = {
  ...watchConfig,
  component: StrategySection,
  title: 'Watch/StrategySections/StrategySection'
}

type Story = StoryObj<ComponentProps<typeof StrategySection>>

const Template: Story = {
  render: (args) => (
    <InstantSearchTestWrapper indexName="indexName">
      <Box sx={{ display: 'none' }}>
        <SearchBar />
      </Box>
      <StrategySection {...args} />
    </InstantSearchTestWrapper>
  )
}

export const Default = {
  ...Template,
  args: {
    handleItemSearch: jest.fn(),
    index: 0
  },
  parameters: {
    msw: {
      handlers: [getStrategyCardDataHandlers]
    }
  }
}

export default StrategySectionStory
