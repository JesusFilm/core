import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps, ReactElement, ReactNode, useEffect } from 'react'

import { watchConfig } from '@core/shared/ui/storybook'

import { SearchBarProvider } from '../../../../libs/algolia/SearchBarProvider'
import { getCountryMock } from '../../../../libs/useCountryQuery/useCountryQuery.mock'
import { languageRefinements } from '../../data'

import { CountryLanguageSelector } from './CountryLanguageSelector'
import { NEXT_COUNTRY } from './data'

const CountryLanguageSelectorStory: Meta<typeof CountryLanguageSelector> = {
  ...watchConfig,
  component: CountryLanguageSelector,
  title: 'Journeys-Ui/SearchBar/SearchDropdown/CountryLanguageSelector'
}

function CookieWrapper({ children }: { children: ReactNode }): ReactElement {
  useEffect(() => {
    document.cookie = `${NEXT_COUNTRY}; path=/; max-age=3600`
    return () => {
      document.cookie =
        'NEXT_COUNTRY=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    }
  }, [])
  return <>{children}</>
}

const Template: StoryObj<ComponentProps<typeof CountryLanguageSelector>> = {
  render: (args) => (
    <SearchBarProvider>
      <CookieWrapper>
        <CountryLanguageSelector {...args} />
      </CookieWrapper>
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
