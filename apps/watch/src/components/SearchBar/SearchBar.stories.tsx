import { Meta, StoryObj } from '@storybook/react'

import { userEvent, within } from '@storybook/testing-library'
import { watchConfig } from '../../libs/storybook'
import { SearchBar } from './SearchBar'

const SearchBarStory: Meta<typeof SearchBar> = {
  ...watchConfig,
  component: SearchBar,
  title: 'Watch/SearchBar'
}

const Template: StoryObj = {
  render: () => <SearchBar />
}

export const Default = {
  ...Template,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const searchInput = await canvas.getByTestId('SearchBar')
    await userEvent.click(searchInput)
    await userEvent.keyboard('Hello World!')
  }
}

export default SearchBarStory
