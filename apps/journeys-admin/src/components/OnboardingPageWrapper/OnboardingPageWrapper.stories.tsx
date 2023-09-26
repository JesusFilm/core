import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '../../libs/storybook'

import { OnboardingPageWrapper } from '.'

const OnboardingPageWrapperStory: Meta<typeof OnboardingPageWrapper> = {
  ...simpleComponentConfig,
  component: OnboardingPageWrapper,
  title: 'Journeys-Admin/OnboardingPageWrapper'
}

const Template: StoryObj<typeof OnboardingPageWrapper> = {
  render: ({ ...args }) => {
    return <OnboardingPageWrapper {...args} />
  }
}

export const Default = {
  ...Template,
  args: {
    children: (
      <Box
        sx={{
          height: '400px',
          width: '400px',
          border: '1px solid black',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white'
        }}
      >
        Child Content
      </Box>
    )
  }
}

export default OnboardingPageWrapperStory
