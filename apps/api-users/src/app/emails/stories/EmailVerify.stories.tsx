import { Meta, StoryObj } from '@storybook/react'

import { apiUsersConfig } from '../../lib/apiUsersConfig/apiUsersConfig'
import { TeamInviteEmail } from '../templates/TeamInvite'

const TeamInviteEmailDemo: Meta<typeof TeamInviteEmail> = {
  ...apiUsersConfig,
  component: TeamInviteEmail,
  title: 'Api-Journeys/Emails/TeamInviteEmail'
}

const Template: StoryObj<typeof TeamInviteEmail> = {
  render: ({ ...args }) => (
    <TeamInviteEmail
      email={args.email}
      teamName={args.teamName}
      inviteLink="https://admin.nextstep.is/"
      sender={args.sender}
      story
    />
  )
}

export const Default = {
  ...Template,
  args: {
    sender: {
      firstName: 'Joe',
      lastName: 'Joeronimo',
      imageUrl: 'https://bit.ly/3Gth4Yf'
    },
    email: 'joeronimo@example.com',
    teamName: 'JFP Sol'
  }
}

export default TeamInviteEmailDemo
