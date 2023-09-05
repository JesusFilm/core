import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { journeysAdminConfig } from '../../../libs/storybook'

import { journey } from './data'

import { ActionDetails } from '.'

const ActionDetailsStory: Meta<typeof ActionDetails> = {
  ...journeysAdminConfig,
  component: ActionDetails,
  title: 'Journeys-Admin/Editor/ActionDetails',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: StoryObj<ComponentProps<typeof ActionDetails>> = {
  render: (args) => (
    <MockedProvider>
      <JourneyProvider value={{ journey, variant: 'admin' }}>
        <Box sx={{ backgroundColor: 'background.paper' }}>
          <ActionDetails {...args} />
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

export default ActionDetailsStory
