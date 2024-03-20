import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../../libs/storybook'

import { Footer } from './Footer'

const Demo: Meta<typeof Footer> = {
  ...simpleComponentConfig,
  component: Footer,
  title: 'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Footer'
}

const Template: StoryObj<typeof Footer> = {
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
        <Stack
          direction="row"
          spacing={4}
          sx={{
            overflowX: 'auto',
            py: 5,
            px: 6
          }}
        >
          <Footer />
        </Stack>
      </JourneyProvider>
    )
  }
}

export const Default = { ...Template, args: { host: null } }

export default Demo
