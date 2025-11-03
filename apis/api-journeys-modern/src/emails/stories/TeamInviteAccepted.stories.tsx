import { Meta, StoryObj } from '@storybook/nextjs'

import { TeamInviteAcceptedEmail } from '../templates/TeamInviteAccepted'

import { apiJourneysConfig } from './apiJourneysConfig'

const TeamInviteAcceptedEmailDemo: Meta<typeof TeamInviteAcceptedEmail> = {
  ...apiJourneysConfig,
  component: TeamInviteAcceptedEmail,
  title: 'Api-Journeys/Emails/TeamInviteAcceptedEmail'
}

const Template: StoryObj<typeof TeamInviteAcceptedEmail> = {
  render: ({ ...args }) => (
    <TeamInviteAcceptedEmail
      teamName={args.teamName}
      inviteLink="https://admin.nextstep.is/"
      sender={args.sender}
      recipient={args.recipient}
      story
    />
  )
}

export const Default = {
  ...Template,
  args: {
    sender: {
      firstName: 'Joe',
      lastName: 'Ro-Nimo',
      imageUrl: 'https://bit.ly/3Gth4Yf'
    },
    recipient: {
      firstName: 'Nee',
      email: 'neesail@example.com',
      lastName: 'Sail',
      imageUrl:
        'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    teamName: 'JFP Sol'
  }
}

export default TeamInviteAcceptedEmailDemo
