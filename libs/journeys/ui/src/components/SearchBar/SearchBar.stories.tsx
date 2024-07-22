import { Meta, StoryObj } from '@storybook/react'

import { watchConfig } from '@core/shared/ui/storybook'
import { userEvent, within } from '@storybook/testing-library'
import { SearchBar } from './SearchBar'

const SearchBarStory: Meta<typeof SearchBar> = {
  ...watchConfig,
  component: SearchBar,
  title: 'Journeys-Ui/SearchBar'
}

const Template: StoryObj = {
  render: () => <SearchBar />
}

export const Default = {
  ...Template,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    const searchInput = await canvas.getByTestId('SearchBar')
    await userEvent.click(searchInput)
    await userEvent.keyboard('Hello World!')
  }
}

export const Language = {
  ...Template,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    const languageButton = await canvas.getByTestId('LanguageSelect')
    await userEvent.click(languageButton)
  }
}

export default SearchBarStory
