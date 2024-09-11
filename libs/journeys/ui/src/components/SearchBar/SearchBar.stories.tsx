import type { Meta, StoryObj } from '@storybook/react'
import { expect, screen, userEvent, waitFor } from '@storybook/test'
import type { ComponentProps } from 'react'

import { watchConfig } from '@core/shared/ui/storybook'

import { InstantSearchTestWrapper } from '../../libs/algolia/InstantSearchTestWrapper'

import { SearchBar } from './SearchBar'

const SearchBarStory: Meta<typeof SearchBar> = {
  ...watchConfig,
  component: SearchBar,
  title: 'Journeys-Ui/SearchBar'
}

const Template: StoryObj<ComponentProps<typeof SearchBar> & { query: string }> =
  {
    render: (args) => (
      <InstantSearchTestWrapper query={args.query}>
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
