import { Meta, StoryObj } from '@storybook/nextjs'
import { SnackbarProvider } from 'notistack'

import { simpleComponentConfig } from '@core/shared/ui/simpleComponentConfig'

import { JourneyQuickSettings } from './JourneyQuickSettings'

const JourneyQuickSettingsStory: Meta<typeof JourneyQuickSettings> = {
  ...simpleComponentConfig,
  component: JourneyQuickSettings,
  title: 'Journeys-Admin/JourneyQuickSettings'
}

const Template: StoryObj<typeof JourneyQuickSettings> = {
  render: () => (
    <SnackbarProvider>
      <JourneyQuickSettings />
    </SnackbarProvider>
  )
}

export const Default = {
  ...Template
}

export default JourneyQuickSettingsStory
