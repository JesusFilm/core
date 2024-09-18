import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
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
    <MockedProvider mocks={[getLanguagesContinentsMock]}>
      <InstantSearchTestWrapper>
        <SearchBarProvider>
          <CountryLanguageSelector {...args} />
        </SearchBarProvider>
      </InstantSearchTestWrapper>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    refinements: {
      items: languageRefinements
    }
  },
  parameters: {
    apolloClient: {
      mocks: [getCountryMock]
    },
    msw: {
      handlers: [emptyResultsHandler]
    }
  }
}

export default CountryLanguageSelectorStory
