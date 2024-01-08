import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '../../../libs/storybook'

import { FacebookButton } from './FacebookButton'

const FacebookButtonStory: Meta<typeof FacebookButton> = {
  ...journeysAdminConfig,
  component: FacebookButton,
  title: 'Journeys-Admin/SignIn/FacebookButton'
}

export const Default: StoryObj<typeof FacebookButton> = {
  render: () => {
    return (
      <MockedProvider>
        <FacebookButton />
      </MockedProvider>
    )
  }
}

export default FacebookButtonStory
