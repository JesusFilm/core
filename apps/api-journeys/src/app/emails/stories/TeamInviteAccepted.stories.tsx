import { Meta, StoryObj } from '@storybook/react'

import { apiJourneysConfig } from '../../lib/apiJourneysConfig/apiJourneysConfig'
import { TeamInviteAcceptedEmail } from '../templates/TeamInviteAccepted'

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
    teamName: 'JFP Sol'
  }
}

export default TeamInviteAcceptedEmailDemo
