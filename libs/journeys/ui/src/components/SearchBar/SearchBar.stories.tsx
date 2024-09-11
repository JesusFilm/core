import { MockedProvider } from '@apollo/client/testing'
import type { Meta, StoryObj } from '@storybook/react'
import { expect, screen, userEvent, waitFor, within } from '@storybook/test'
import type { ComponentProps } from 'react'

import { watchConfig } from '@core/shared/ui/storybook'

import { InstantSearchTestWrapper } from '../../libs/algolia/InstantSearchTestWrapper'
import { getLanguagesContinentsMock } from '../../libs/useLanguagesContinentsQuery/useLanguagesContinentsQuery.mock'

import { SearchBar } from './SearchBar'
import {
  emptyLanguageFacetHandlers,
  emptyResultsHandler,
  getLanguageFacetHandlers
} from './SearchBar.handlers'

const SearchBarStory: Meta<typeof SearchBar> = {
  ...watchConfig,
  component: SearchBar,
  title: 'Journeys-Ui/SearchBar'
}

const Template: StoryObj<ComponentProps<typeof SearchBar> & { query: string }> =
  {
    render: (args) => (
      <InstantSearchTestWrapper query={args.query}>
        <MockedProvider mocks={[getLanguagesContinentsMock]}>
          <SearchBar showLanguageButton={args.showLanguageButton} />
        </MockedProvider>
      </InstantSearchTestWrapper>
    )
  }

export const Default = {
  ...Template,
  parameters: {
    msw: {
      handlers: [emptyResultsHandler]
    }
  },
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
  },
  parameters: {
    msw: {
      handlers: [emptyResultsHandler]
    }
  }
}

export const Language = {
  ...Template,
  args: {
    showLanguageButton: true
  },
  parameters: {
    msw: {
      handlers: [getLanguageFacetHandlers]
    }
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    await waitFor(async () => {
      await expect(canvas.getByText('Language')).toBeInTheDocument()
    })
    await userEvent.click(canvas.getByText('Language'))
  }
}

export const NoLanguages = {
  ...Template,
  args: {
    query: 'abcdefghijklmnopqrstuvwxyz',
    showLanguageButton: true
  },
  parameters: {
    msw: {
      handlers: [emptyLanguageFacetHandlers]
    }
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement)
    await waitFor(async () => {
      await expect(canvas.getByText('Language')).toBeInTheDocument()
    })
    await userEvent.click(canvas.getByText('Language'))
    expect(
      screen.getByText(
        'Sorry, there are no languages available for this search. Try removing some of your search criteria!'
      )
    )
  }
}

export default SearchBarStory
