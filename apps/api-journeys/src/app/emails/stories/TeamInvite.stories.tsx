import { Meta, StoryObj } from '@storybook/react'

import { TeamInviteEmail } from '../templates/TeamInvite'
import { apiJourneysConfig } from '../../lib/apiJourneysConfig/apiJourneysConfig'

const TeamInviteEmailDemo: Meta<typeof TeamInviteEmail> = {
  ...apiJourneysConfig,
  component: TeamInviteEmail,
  title: 'Api-Journeys/Emails/TeamInviteEmail'
}

const Template: StoryObj<typeof TeamInviteEmail> = {
  render: ({ ...args }) => (
    <TeamInviteEmail
      email={args.email}
      teamName={args.teamName}
      inviteLink="www.runescape.com"
      sender={args.sender}
    />
  )
}

export const Default = {
  ...Template,
  args: {
    sender: {
      __typename: 'User',
      id: '1',
      firstName: 'Joe',
      lastName: 'Joeronimo',
      imageUrl: 'https://bit.ly/3Gth4Yf'
    },
    email: 'joeronimo@example.com',
    teamName: 'JFP Sol'
  }
}

export default TeamInviteEmailDemo
