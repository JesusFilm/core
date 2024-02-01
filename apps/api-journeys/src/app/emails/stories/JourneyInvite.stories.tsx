import { Meta, StoryObj } from '@storybook/react'

import { JourneyInviteEmail } from '../templates/JourneyInvite'
import { sharedUiConfig } from '@core/shared/ui/sharedUiConfig'

const JourneyInviteEmailDemo: Meta<typeof JourneyInviteEmail> = {
  ...sharedUiConfig,
  component: JourneyInviteEmail,
  title: 'Api-Journeys/Emails/JourneyInviteEmail'
}

const Template: StoryObj<typeof JourneyInviteEmail> = {
  render: ({ ...args }) => (
    <JourneyInviteEmail
      email={args.email}
      journeyTitle={args.journeyTitle}
      inviteLink="www.runescape.com"
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
