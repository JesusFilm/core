import { Meta } from '@storybook/react'
import { ReactElement, useState } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { JourneyFields as Journey } from '../../../../../../../../../../__generated__/JourneyFields'

import { ThemeBuilderDialog } from './ThemeBuilderDialog'
import { FontFamily } from './ThemeSettings'

const ThemeBuilderDialogStory: Meta<typeof ThemeBuilderDialog> = {
  ...journeysAdminConfig,
  component: ThemeBuilderDialog,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Typography/ThemeBuilderDialog',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const ThemeBuilderDialogComponent = (): ReactElement => {
  const [open, setOpen] = useState(true)

  return (
    <JourneyProvider
      value={{
        journey: {
          language: {
            __typename: 'Language',
            id: 'language-id',
            bcp47: 'en'
          },
          journeyTheme: null
        } as unknown as Journey,
        variant: 'admin'
      }}
    >
      <ThemeBuilderDialog open={open} onClose={() => setOpen(false)} />
    </JourneyProvider>
  )
}

const WithExistingThemeComponent = (): ReactElement => {
  const [open, setOpen] = useState(true)

  return (
    <JourneyProvider
      value={{
        journey: {
          id: 'journey-id',
          language: {
            __typename: 'Language',
            id: 'language-id',
            bcp47: 'en'
          },
          journeyTheme: {
            __typename: 'JourneyTheme',
            id: 'theme-id',
            headerFont: FontFamily.Montserrat,
            bodyFont: FontFamily.Inter,
            labelFont: FontFamily.Nunito
          }
        } as unknown as Journey,
        variant: 'admin'
      }}
    >
      <ThemeBuilderDialog open={open} onClose={() => setOpen(false)} />
    </JourneyProvider>
  )
}

export const NoTheme = {
  render: () => <ThemeBuilderDialogComponent />
}

export const WithTheme = {
  render: () => <WithExistingThemeComponent />
}

export default ThemeBuilderDialogStory
