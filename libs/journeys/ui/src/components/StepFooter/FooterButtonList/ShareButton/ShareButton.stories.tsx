import { Meta, StoryObj } from '@storybook/nextjs'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '../../../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../../../libs/JourneyProvider/__generated__/JourneyFields'
import { journeyUiConfig } from '../../../../libs/journeyUiConfig'

import { ShareButton } from './ShareButton'

const Demo: Meta<typeof ShareButton> = {
  ...journeyUiConfig,
  component: ShareButton,
  title: 'Journeys-Ui/StepFooter/FooterButtons/ShareButton'
}

const Template: StoryObj = {
  render: () => (
    <SnackbarProvider>
      <JourneyProvider
        value={{ journey: { slug: 'test-slug' } as unknown as Journey }}
      >
        <ShareButton />
      </JourneyProvider>
    </SnackbarProvider>
  )
}

export const Default = {
  ...Template
}

export default Demo
