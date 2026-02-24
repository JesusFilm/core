import { Meta, StoryObj } from '@storybook/nextjs'

import { TeamRemovedEmail } from '../templates/TeamRemoved'

import { apiJourneysConfig } from './apiJourneysConfig'

const TeamRemovedEmailDemo: Meta<typeof TeamRemovedEmail> = {
  ...apiJourneysConfig,
  component: TeamRemovedEmail,
  title: 'Api-Journeys/Emails/TeamRemovedEmail'
}

const Template: StoryObj<typeof TeamRemovedEmail> = {
  render: ({ ...args }) => (
    <TeamRemovedEmail
      teamName={args.teamName}
      recipient={args.recipient}
      story
    />
  )
}

export const Default = {
  ...Template,
  args: {
    recipient: {
      firstName: 'Joe',
      lastName: 'Ro-Nimo',
      email: 'jron@example.com',
      imageUrl:
        'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    teamName: 'JFP Sol'
  }
}

export default TeamRemovedEmailDemo
