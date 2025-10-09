import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

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
        <SignInServiceButton service={args.service} />
      </MockedProvider>
    )
  }
}

export const Google = { ...Template, args: { service: 'google.com' } }
export const Facebook = { ...Template, args: { service: 'facebook.com' } }

export default SignInServiceButtonStory
