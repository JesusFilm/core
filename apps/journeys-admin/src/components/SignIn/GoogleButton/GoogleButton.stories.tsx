import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '../../../libs/storybook'

import { GoogleButton } from './GoogleButton'

const GoogleButtonStory: Meta<typeof GoogleButton> = {
  ...journeysAdminConfig,
  component: GoogleButton,
  title: 'Journeys-Admin/SignIn/GoogleButton'
}

export const Default: StoryObj<typeof GoogleButton> = {
  render: () => {
    return (
      <MockedProvider>
        <GoogleButton />
      </MockedProvider>
    )
  }
}

export default GoogleButtonStory
