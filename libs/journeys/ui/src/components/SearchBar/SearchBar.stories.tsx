import { expect } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent, waitFor, within } from '@storybook/testing-library'
import { ComponentProps } from 'react'

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
        <SearchBar showLanguageButton={args.showLanguageButton} />
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

export const Language = {
  ...Template,
  args: {
    showLanguageButton: true
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    await waitFor(async () => {
      await expect(screen.getByTestId('LanguageSelect')).toBeInTheDocument()
    })
    const languageButton = await canvas.getByTestId('LanguageSelect')
    await userEvent.click(languageButton)
  }
}

export const Search = {
  ...Template,
  args: {
    query: 'Easter'
  }
}

export default SearchBarStory
