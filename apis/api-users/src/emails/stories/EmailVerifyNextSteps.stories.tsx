import { Meta, StoryObj } from '@storybook/nextjs'

import { apiUsersConfig } from '../../lib/apiUsersConfig/apiUsersConfig'
import { EmailVerifyNextSteps } from '../templates/EmailVerifyNextSteps'

const EmailVerifyNextStepsDemo: Meta<typeof EmailVerifyNextSteps> = {
  ...apiUsersConfig,
  component: EmailVerifyNextSteps,
  title: 'Api-Users/Emails/EmailVerifyNextSteps'
}

const Template: StoryObj<typeof EmailVerifyNextSteps> = {
  render: ({ ...args }) => (
    <EmailVerifyNextSteps
      recipient={args.recipient}
      token={args.token}
      inviteLink="https://admin.nextstep.is/"
      story
    />
  )
}

export const NextSteps = {
  ...Template,
  args: {
    email: 'joe@example.com',
    token: '123456',
    recipient: {
      firstName: 'Joe',
      lastName: 'Ron-Imo',
      email: 'joe@example.com'
    }
  }
}

export default EmailVerifyNextStepsDemo
