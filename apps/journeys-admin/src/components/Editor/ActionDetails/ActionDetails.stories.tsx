import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { ComponentProps } from 'react'
import Box from '@mui/material/Box'
import { journeysAdminConfig } from '../../../libs/storybook'
import { journey } from './data'
import { ActionDetails } from '.'

const ActionDetailsStory = {
  ...journeysAdminConfig,
  component: ActionDetails,
  title: 'Journeys-Admin/Editor/ActionDetails',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: Story<ComponentProps<typeof ActionDetails>> = (args) => (
  <MockedProvider>
    <JourneyProvider value={{ journey }}>
      <Box sx={{ backgroundColor: 'background.paper' }}>
        <ActionDetails {...args} />
      </Box>
    </JourneyProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  url: 'https://www.google.com/',
  goalLabel: () => 'Visit a website'
}

export const Placeholder = Template.bind({})
Placeholder.args = {
  url: null
}

export default ActionDetailsStory as Meta
