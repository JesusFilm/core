import { Meta, StoryObj } from '@storybook/react'

import { apiJourneysConfig } from '../../lib/apiJourneysConfig/apiJourneysConfig'
import { TeamRemovedEmail } from '../templates/TeamRemoved'

const TeamRemovedEmailDemo: Meta<typeof TeamRemovedEmail> = {
  ...apiJourneysConfig,
  component: TeamRemovedEmail,
  title: 'Api-Journeys/Emails/TeamRemovedEmail'
}

const Template: StoryObj<typeof TeamRemovedEmail> = {
  render: ({ ...args }) => (
    <TeamRemovedEmail teamName={args.teamName} sender={args.sender} story />
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

export default TeamRemovedEmailDemo
