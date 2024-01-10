import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '../../../libs/storybook'

import { SignInServiceButton } from './SignInServiceButton'

const SignInServiceButtonStory: Meta<typeof SignInServiceButton> = {
  ...journeysAdminConfig,
  component: SignInServiceButton,
  title: 'Journeys-Admin/SignIn/SignInServiceButton'
}

const Template: StoryObj<typeof SignInServiceButton> = {
  render: ({ ...args }) => {
    return (
      <MockedProvider>
        <SignInServiceButton variant={args.variant} />
      </MockedProvider>
    )
  }
}

export const Google = { ...Template, args: { variant: 'Google' } }
export const Facebook = { ...Template, args: { variant: 'Facebook' } }

export default SignInServiceButtonStory
