import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey } from '@core/journeys/ui/TemplateView/TemplateFooter/data'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { GoalDetails } from '.'

const GoalDetailsStory: Meta<typeof GoalDetails> = {
  ...journeysAdminConfig,
  component: GoalDetails,
  title: 'Journeys-Admin/Editor/Slider/Settings/GoalDetails',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: StoryObj<ComponentProps<typeof GoalDetails> & { url: string }> =
  {
    render: (args) => (
      <MockedProvider>
        <EditorProvider initialState={{ selectedGoalUrl: args.url }}>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <Box sx={{ backgroundColor: 'background.paper' }}>
              <GoalDetails />
            </Box>
          </JourneyProvider>
        </EditorProvider>
      </MockedProvider>
    )
  }
export const Default = {
  ...Template,
  args: {
    url: null
  }
}

export const Filled = {
  ...Template,
  args: {
    url: 'https://www.google.com/'
  }
}

export default GoalDetailsStory
