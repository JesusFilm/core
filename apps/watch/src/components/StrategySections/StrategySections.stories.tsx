import { SearchBar } from '@core/journeys/ui/SearchBar'
import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'
import { watchConfig } from '../../libs/storybook'
import { getStrategyCardDataHandlers } from './StrategySection/StrategySection.handlers'
import { StrategySections } from './StrategySections'

const StrategySectionsStory: Meta<typeof StrategySections> = {
  ...watchConfig,
  component: StrategySections,
  title: 'Watch/StrategySections'
}

type Story = StoryObj<ComponentProps<typeof StrategySections>>

const Template: Story = {
  render: (args) => (
    <InstantSearchTestWrapper indexName="new-index-name">
      <Box sx={{ display: 'none' }}>
        <SearchBar />
      </Box>
      <StrategySections />
    </InstantSearchTestWrapper>
  )
}

export const Default = {
  ...Template,
  parameters: {
    msw: {
      handlers: [getStrategyCardDataHandlers]
    }
  }
}

export default StrategySectionsStory
