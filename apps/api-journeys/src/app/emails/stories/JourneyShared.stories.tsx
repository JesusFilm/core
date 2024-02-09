import { Meta, StoryObj } from '@storybook/react'

import { apiJourneysConfig } from '../../lib/apiJourneysConfig/apiJourneysConfig'
import { JourneySharedEmail } from '../templates/JourneyShared'

const JourneySharedEmailDemo: Meta<typeof JourneySharedEmail> = {
  ...apiJourneysConfig,
  component: JourneySharedEmail,
  title: 'Api-Journeys/Emails/JourneySharedEmail'
}

const Template: StoryObj<typeof JourneySharedEmail> = {
  render: ({ ...args }) => (
    <JourneySharedEmail
      journeyTitle={args.journeyTitle}
      inviteLink="https://admin.nextstep.is/journeys/journeyId"
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
    journeyTitle: 'Why Jesus?'
  }
}

export default JourneySharedEmailDemo
