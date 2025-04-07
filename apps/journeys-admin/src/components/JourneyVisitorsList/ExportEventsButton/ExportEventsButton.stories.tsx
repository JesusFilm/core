import { ComponentPropsWithoutRef } from 'react'
import { ExportEventsButton } from './ExportEventsButton'
import { Meta, StoryObj } from '@storybook/react/*'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

type StoryArgs = ComponentPropsWithoutRef<typeof ExportEventsButton>

const meta = {
  ...journeysAdminConfig,
  title: 'Journeys-Admin/JourneyVisitorsList/ExportEventsButton',
  component: ExportEventsButton,
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    journeyId: 'journey1'
  }
}
