import { SearchBar } from '@core/journeys/ui/SearchBar'
import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'
import { Box } from '@mui/material'
import { jest } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'
import algoliasearch from 'algoliasearch'
import { ComponentProps } from 'react'
import { watchConfig } from '../../../libs/storybook'
import { StrategySection } from './StrategySection'

const StrategySectionStory: Meta<typeof StrategySection> = {
  ...watchConfig,
  component: StrategySection,
  title: 'Watch/StrategySections/StrategySection'
}

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '',
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ?? ''
)

type Story = StoryObj<ComponentProps<typeof StrategySection>>

const Template: Story = {
  render: (args) => (
    // hello
    //   <InstantSearch
    //   searchClient={searchClient}
    //   indexName="wp_dev_posts_mission-trip"
    //   >
    <InstantSearchTestWrapper indexName="wp_dev_posts_mission-trip">
      <Box>
        <SearchBar />
      </Box>
      <StrategySection {...args} />
    </InstantSearchTestWrapper>
    // </InstantSearch>
  )
}

export const Default = {
  ...Template,
  args: {
    handleItemSearch: jest.fn(),
    index: 0
  }
}

export default StrategySectionStory
