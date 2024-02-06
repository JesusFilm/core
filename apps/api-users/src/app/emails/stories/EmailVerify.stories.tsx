import { Meta, StoryObj } from '@storybook/react'

import { apiUsersConfig } from '../../lib/apiUsersConfig/apiUsersConfig'
import { EmailVerifyEmail } from '../templates/EmailVerify'

const EmailVerifyEmailDemo: Meta<typeof EmailVerifyEmail> = {
  ...apiUsersConfig,
  component: EmailVerifyEmail,
  title: 'Api-Users/Emails/EmailVerifyEmail'
}

const Template: StoryObj<typeof EmailVerifyEmail> = {
  render: ({ ...args }) => (
    <EmailVerifyEmail
      email={args.email}
      inviteLink="https://admin.nextstep.is/"
      story
    />
  )
}

export const Default = {
  ...Template,
  args: {
    email: 'joeronimo@example.com'
  }
}

export default EmailVerifyEmailDemo
