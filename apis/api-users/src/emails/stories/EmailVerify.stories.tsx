import { Meta, StoryObj } from '@storybook/nextjs'

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
      recipient={args.recipient}
      token={args.token}
      inviteLink="https://admin.nextstep.is/"
      story
    />
  )
}

export const Default = {
  ...Template,
  args: {
    email: 'joeronimo@example.com',
    token: '123456',
    recipient: {
      firstName: 'Joe',
      lastName: 'Ron-Imo',
      email: 'joe@example.com',
      imageUrl:
        'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
  }
}

export default EmailVerifyEmailDemo
