import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { StepBlockNodeAnalytics } from './StepBlockNodeAnalytics'

import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'
import { ComponentPropsWithoutRef } from 'react'

const StepBlockNodeAnalyticsDemo: Meta<typeof StepBlockNodeAnalytics> = {
  ...simpleComponentConfig,
  component: StepBlockNodeAnalytics,
  title:
    'Journeys-Admin/Editor/Slider/JourneyFlow/nodes/StepBlockNode/StepBlockNodeAnalytics'
}

const Template: StoryObj<
  ComponentPropsWithoutRef<typeof StepBlockNodeAnalytics>
> = {
  render: (args) => {
    const initialState = {
      analytics: {
        ...args
      }
    } as unknown as EditorState
    return (
      <Box sx={{ position: 'relative', top: 32 }}>
        <EditorProvider initialState={initialState}>
          <StepBlockNodeAnalytics stepId="step.id" />
        </EditorProvider>
      </Box>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    stepsStats: [
      {
        stepId: 'step.id',
        visitors: 1000,
        visitorsExitAtStep: 100,
        timeOnPage: 72
      }
    ]
  }
}

export const Fallback = {
  ...Template,
  args: {
    stepsStats: [
      {
        stepId: 'step.id',
        visitors: null,
        visitorsExitAtStep: null,
        timeOnPage: null
      }
    ]
  }
}

export default StepBlockNodeAnalyticsDemo
