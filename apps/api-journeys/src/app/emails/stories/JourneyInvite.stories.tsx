import { Meta, StoryObj } from '@storybook/react'

import { apiJourneysConfig } from '../../lib/apiJourneysConfig/apiJourneysConfig'
import { JourneyInviteEmail } from '../templates/JourneyInvite'

const JourneyInviteEmailDemo: Meta<typeof JourneyInviteEmail> = {
  ...apiJourneysConfig,
  component: JourneyInviteEmail,
  title: 'Api-Journeys/Emails/JourneyInviteEmail'
}

const Template: StoryObj<typeof JourneyInviteEmail> = {
  render: ({ ...args }) => (
    <JourneyInviteEmail
      email={args.email}
      journeyTitle={args.journeyTitle}
      inviteLink="www.runescape.com"
      story
    />
  )
}

export const Default = {
  ...Template,
  args: {
    email: 'joeronimo@example.com',
    journeyTitle: 'Fact or Fiction'
  }
}

export default JourneyInviteEmailDemo
