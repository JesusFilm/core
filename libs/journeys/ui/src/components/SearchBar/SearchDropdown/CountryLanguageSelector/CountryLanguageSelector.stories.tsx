import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { watchConfig } from '@core/shared/ui/storybook'

import { InstantSearchTestWrapper } from '../../../../libs/algolia/InstantSearchTestWrapper'
import { SearchBarProvider } from '../../../../libs/algolia/SearchBarProvider'
import { getCountryMock } from '../../../../libs/useCountryQuery/useCountryQuery.mock'
import { getLanguagesContinentsMock } from '../../../../libs/useLanguagesContinentsQuery/useLanguagesContinentsQuery.mock'
import { languageRefinements } from '../../data'
import { emptyResultsHandler } from '../../SearchBar.handlers'

import { CountryLanguageSelector } from './CountryLanguageSelector'

const CountryLanguageSelectorStory: Meta<typeof CountryLanguageSelector> = {
  ...watchConfig,
  component: CountryLanguageSelector,
  title: 'Journeys-Ui/SearchBar/SearchDropdown/CountryLanguageSelector'
}

const Template: StoryObj<ComponentProps<typeof CountryLanguageSelector>> = {
  render: (args) => (
    <InstantSearchTestWrapper>
      <SearchBarProvider>
        <CountryLanguageSelector {...args} />
      </SearchBarProvider>
    </InstantSearchTestWrapper>
  )
}

export const Default = {
  ...Template,
  args: {
    refinements: {
      items: languageRefinements
    },
    countryCode: 'US'
  },
  parameters: {
    apolloClient: {
      mocks: [getCountryMock, getLanguagesContinentsMock]
    },
    msw: {
      handlers: [emptyResultsHandler]
    }
  }
}

export default CountryLanguageSelectorStory
