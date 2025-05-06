import { Meta, StoryObj } from '@storybook/react'
import { ReactElement, useState } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { TranslateJourneyDialog } from './TranslateJourneyDialog'

const TranslateJourneyDialogStory: Meta<typeof TranslateJourneyDialog> = {
  ...journeysAdminConfig,
  component: TranslateJourneyDialog,
  title: 'Journeys-Admin/JourneyList/TranslateJourneyDialog',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const TranslateJourneyDialogComponent = (): ReactElement => {
  const [open, setOpen] = useState(true)

  return (
    <JourneyProvider
      value={{
        journey: defaultJourney,
        variant: 'admin'
      }}
    >
      <TranslateJourneyDialog open={open} onClose={() => setOpen(false)} />
    </JourneyProvider>
  )
}

const Template: StoryObj<typeof TranslateJourneyDialog> = {
  render: () => <TranslateJourneyDialogComponent />
}

export const Default = {
  ...Template
}

export default TranslateJourneyDialogStory
