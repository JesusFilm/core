import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { StepBlockNodeAnalytics } from './StepBlockNodeAnalytics'

import { ComponentPropsWithoutRef } from 'react'
import { simpleComponentConfig } from '../../../../../../../libs/storybook'

const StepBlockNodeAnalyticsDemo: Meta<typeof StepBlockNodeAnalytics> = {
  ...simpleComponentConfig,
  component: StepBlockNodeAnalytics,
  title:
    'Journeys-Admin/Editor/Slider/JourneyFlow/nodes/StepBlockNode/StepBlockNodeAnalytics'
}

const Template: StoryObj<
  ComponentPropsWithoutRef<typeof StepBlockNodeAnalytics>
> = {
  render: (args) => (
    <Box sx={{ position: 'relative', top: 32 }}>
      <StepBlockNodeAnalytics {...args} />
    </Box>
  )
}

export const Default = {
  ...Template,
  args: {
    visitors: 1000,
    visitorsExitAtStep: 100,
    timeOnPage: 72
  }
}

export const Fallback = {
  ...Template,
  args: {}
}

export default StepBlockNodeAnalyticsDemo
