import { SearchBar } from '@core/journeys/ui/SearchBar'
import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'
import { Box } from '@mui/material'
import { jest } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'
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
    <InstantSearchTestWrapper indexName="wp_dev_posts_mission-trip">
      <Box>
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
