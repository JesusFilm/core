import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { CountryCodeAutoComplete } from './CountryCodeAutoComplete'
import { Country } from './countriesList'

const CountryCodeAutoCompleteStory: Meta<typeof CountryCodeAutoComplete> = {
  ...journeysAdminConfig,
  component: CountryCodeAutoComplete,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/controls/Action/PhoneAction/CountryCodeAutoComplete'
}

const mockCountries: Country[] = [
  {
    countryCode: 'US',
    label: 'United States',
    callingCode: '+1'
  },
  {
    countryCode: 'CA',
    label: 'Canada',
    callingCode: '+1'
  },
  {
    countryCode: 'GB',
    label: 'United Kingdom',
    callingCode: '+44'
  },
  {
    countryCode: 'FR',
    label: 'France',
    callingCode: '+33'
  },
  {
    countryCode: 'DE',
    label: 'Germany',
    callingCode: '+49'
  }
]

export const Default: StoryObj<typeof CountryCodeAutoComplete> = {
  args: {
    countries: mockCountries,
    selectedCountry: mockCountries[0]
  }
}

export default CountryCodeAutoCompleteStory
