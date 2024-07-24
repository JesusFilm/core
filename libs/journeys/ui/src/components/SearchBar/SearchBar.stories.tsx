import { Meta, StoryObj } from '@storybook/react'

import { watchConfig } from '@core/shared/ui/storybook'
import { expect } from '@storybook/jest'
import { screen, userEvent, waitFor } from '@storybook/testing-library'
import { ComponentProps } from 'react'
import { InstantSearchTestWrapper } from '../../libs/algolia/InstantSearchWrapper'
import { SearchBar } from './SearchBar'

const SearchBarStory: Meta<typeof SearchBar> = {
  ...watchConfig,
  component: SearchBar,
  title: 'Journeys-Ui/SearchBar'
}

const Template: StoryObj<ComponentProps<typeof SearchBar> & { query: string }> =
  {
    render: (args) => (
      <InstantSearchTestWrapper
        query={args.query}
        indexName="api-journeys-journeys-dev"
      >
        <SearchBar />
      </InstantSearchTestWrapper>
    )
  }

export const Default = {
  ...Template,
  play: async () => {
    await waitFor(async () => {
      await expect(screen.getByTestId('SearchBar')).toBeInTheDocument()
    })
    await userEvent.click(screen.getByTestId('SearchBar'))
    await userEvent.keyboard('Hello World!')
  }
}

export const Search = {
  ...Template,
  args: {
    query: 'Easter'
  }
}

export default SearchBarStory
