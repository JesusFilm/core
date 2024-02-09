import { Meta, StoryObj } from '@storybook/react'

import { apiJourneysConfig } from '../../lib/apiJourneysConfig/apiJourneysConfig'
import { JourneyAccessRequestEmail } from '../templates/JourneyAccessRequest'

const JourneyAccessRequestEmailDemo: Meta<typeof JourneyAccessRequestEmail> = {
  ...apiJourneysConfig,
  component: JourneyAccessRequestEmail,
  title: 'Api-Journeys/Emails/JourneyAccessRequestEmail'
}

const Template: StoryObj<typeof JourneyAccessRequestEmail> = {
  render: ({ ...args }) => (
    <JourneyAccessRequestEmail
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

export default JourneyAccessRequestEmailDemo
