import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { watchConfig } from '@core/shared/ui/storybook'

import { SearchBarProvider } from '../../../../libs/algolia/SearchBarProvider'
import { getCountryMock } from '../../../../libs/useCountryQuery/useCountryQuery.mock'
import { languageRefinements } from '../../data'

import { CountryLanguageSelector } from './CountryLanguageSelector'

const CountryLanguageSelectorStory: Meta<typeof CountryLanguageSelector> = {
  ...watchConfig,
  component: CountryLanguageSelector,
  title: 'Journeys-Ui/SearchBar/SearchDropdown/CountryLanguageSelector'
}

const Template: StoryObj<ComponentProps<typeof CountryLanguageSelector>> = {
  render: (args) => (
    <SearchBarProvider>
      <CountryLanguageSelector {...args} />
    </SearchBarProvider>
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
    }
  }
}

export default CountryLanguageSelectorStory
