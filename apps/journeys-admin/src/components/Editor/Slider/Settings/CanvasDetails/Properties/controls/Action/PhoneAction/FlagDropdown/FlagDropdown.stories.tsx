import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { Country } from './countriesList'
import { FlagDropdown } from './FlagDropdown'

const FlagDropdownStory: Meta<typeof FlagDropdown> = {
  ...journeysAdminConfig,
  component: FlagDropdown,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/controls/Action/PhoneAction/FlagDropdown'
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

export const Default: StoryObj<typeof FlagDropdown> = {
  args: {
    countries: mockCountries,
    selectedCountry: mockCountries[0],
    onChange: () => {}
  }
}

export const WithDifferentCountry: StoryObj<typeof FlagDropdown> = {
  args: {
    countries: mockCountries,
    selectedCountry: mockCountries[2], // United Kingdom
    onChange: () => {}
  }
}

export default FlagDropdownStory
