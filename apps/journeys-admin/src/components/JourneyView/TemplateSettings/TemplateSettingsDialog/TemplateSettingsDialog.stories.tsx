import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { simpleComponentConfig } from '../../../../libs/storybook'
import { defaultJourney } from '../../data'

import { TemplateSettingsDialog } from './TemplateSettingsDialog'

const TemplateSettingsDialogStory: Meta<typeof TemplateSettingsDialog> = {
  ...simpleComponentConfig,
  component: TemplateSettingsDialog,
  title: 'Journeys-Admin/TemplateSettingsDialog',
  parameters: {
    ...simpleComponentConfig.parameters
  }
}

const Template: StoryObj<typeof TemplateSettingsDialog> = {
  render: (args) => (
    <JourneyProvider
      value={{
        journey: defaultJourney,
        variant: 'admin'
      }}
    >
      <TemplateSettingsDialog open onClose={() => undefined} />
    </JourneyProvider>
  )
}

export const Default = {
  ...Template
}

export const Categories = {
  ...Template,
  play: async () => {
    await userEvent.click(screen.getByRole('tab', { name: 'Categories' }))
  }
}

export const About = {
  ...Template,
  play: async () => {
    await userEvent.click(screen.getByRole('tab', { name: 'About' }))
  }
}

export default TemplateSettingsDialogStory
