import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { journeysAdminConfig } from '../../../../../libs/storybook'

import { journey } from './data'

import { GoalDetails } from '.'

const GoalDetailsStory: Meta<typeof GoalDetails> = {
  ...journeysAdminConfig,
  component: GoalDetails,
  title: 'Journeys-Admin/Editor/GoalDetails',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: StoryObj<ComponentProps<typeof GoalDetails>> = {
  render: (args) => (
    <MockedProvider>
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <Box sx={{ backgroundColor: 'background.paper' }}>
          <GoalDetails />
        </Box>
      </JourneyProvider>
    </MockedProvider>
  )
}
export const Default = {
  ...Template,
  args: {
    url: 'https://www.google.com/',
    goalLabel: () => 'Visit a website'
  }
}

export const Placeholder = {
  ...Template,
  args: {
    url: null
  }
}

export default GoalDetailsStory
