import { Meta, StoryObj } from '@storybook/nextjs'

import { TeamInviteEmail } from '../templates/TeamInvite'

import { apiJourneysConfig } from './apiJourneysConfig'

const TeamInviteEmailDemo: Meta<typeof TeamInviteEmail> = {
  ...apiJourneysConfig,
  component: TeamInviteEmail,
  title: 'Api-Journeys/Emails/TeamInviteEmail'
}

const Template: StoryObj<typeof TeamInviteEmail> = {
  render: ({ ...args }) => (
    <TeamInviteEmail
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
    email: 'joeronimo@example.com',
    teamName: 'JFP Sol',
    recipient: {
      firstName: 'Nee',
      email: 'neesail@example.com',
      lastName: 'Sail',
      imageUrl: undefined
    }
  }
}

export default TeamInviteEmailDemo
