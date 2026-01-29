import { Meta, StoryObj } from '@storybook/nextjs'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'

import { JourneyAppearance } from './JourneyAppearance'

const Demo: Meta<typeof JourneyAppearance> = {
  ...simpleComponentConfig,
  component: JourneyAppearance,
  title: 'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/JourneyAppearance'
}

const Template: StoryObj<typeof JourneyAppearance> = {
  render: () => {
    return (
      <JourneyProvider
        value={{
          journey: {
            id: 'journeyId',
            themeMode: ThemeMode.dark,
            themeName: ThemeName.base,
            language: {
              __typename: 'Language',
              id: '529',
              bcp47: 'en',
              iso3: 'eng'
            }
          } as unknown as Journey,
          variant: 'admin'
        }}
      >
        <JourneyAppearance />
      </JourneyProvider>
    )
  }
}

export const Default = { ...Template }

export default Demo
