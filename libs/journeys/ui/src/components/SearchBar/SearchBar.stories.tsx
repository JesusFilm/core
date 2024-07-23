import { Meta, StoryObj } from '@storybook/react'

import { watchConfig } from '@core/shared/ui/storybook'
import { userEvent, within } from '@storybook/testing-library'
import { InstantSearchWrapper } from '../TemplateSections/InstantSearchProvider'
import { SearchBar } from './SearchBar'

const SearchBarStory: Meta<typeof SearchBar> = {
  ...watchConfig,
  component: SearchBar,
  title: 'Watch/SearchBar'
}

const Template: StoryObj = {
  render: () => (
    <InstantSearchWrapper query="" indexName="api-journeys-journeys-dev">
      <SearchBar />
    </InstantSearchWrapper>
  )
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

export default SearchBarStory
