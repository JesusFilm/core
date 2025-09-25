import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { CountryFlag } from './CountryFlag'

const CountryFlagStory: Meta<typeof CountryFlag> = {
  ...journeysAdminConfig,
  component: CountryFlag,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/controls/Action/PhoneAction/CountryCodeAutoComplete/CountryFlag'
}

export const Default: StoryObj<typeof CountryFlag> = {
  args: {
    code: 'US',
    countryName: 'United States'
  }
}

export default CountryFlagStory
