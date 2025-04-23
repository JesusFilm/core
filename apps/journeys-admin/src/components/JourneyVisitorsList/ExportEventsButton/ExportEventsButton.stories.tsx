import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { ExportEventsButton } from './ExportEventsButton'

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
    journeyId: 'journey1',
    disabled: false
  }
}

export const Disabled: Story = {
  args: {
    journeyId: 'journey1',
    disabled: true
  }
}
