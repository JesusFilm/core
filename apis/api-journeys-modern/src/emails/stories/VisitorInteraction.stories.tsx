import { Meta, StoryObj } from '@storybook/nextjs'

import { Event } from '@core/prisma/journeys/client'

import { VisitorInteraction } from '../templates/VisitorInteraction'

import { apiJourneysConfig } from './apiJourneysConfig'

const VisitorInteractionDemo: Meta<typeof VisitorInteraction> = {
  ...apiJourneysConfig,
  component: VisitorInteraction,
  title: 'Api-Journeys/Emails/VisitorInteraction'
}

const Template: StoryObj<typeof VisitorInteraction> = {
  render: ({ ...args }) => (
    <VisitorInteraction
      title={args.title}
      analyticsUrl={args.analyticsUrl}
      unsubscribeUrl={args.unsubscribeUrl}
      visitor={args.visitor}
      recipient={args.recipient}
      story
    />
  )
}

const event: Event = {
  id: 'event 1',
  typename: 'event',
  journeyId: 'bd62980f-3302-481d-8d66-a6ad2bdc936a',
  blockId: '67094b1c-4446-44ec-8aa3-e3213ae6db34',
  stepId: 'a9a10c4e-dfbc-4efd-ac98-7eea5ec615ad',
  createdAt: new Date('2024-05-27T23:39:28.000Z'),
  label: 'Step 1',
  value: 'Test',
  visitorId: 'dcb4aa5f-5672-4350-af5a-c08946a3560a',
  action: null,
  actionValue: null,
  messagePlatform: null,
  languageId: null,
  radioOptionBlockId: null,
  email: null,
  nextStepId: null,
  previousStepId: null,
  position: null,
  source: null,
  progress: null,
  userId: null,
  journeyVisitorJourneyId: null,
  journeyVisitorVisitorId: null,
  updatedAt: new Date('2024-05-27T23:39:28.000Z')
}

export const Default = {
  ...Template,
  args: {
    title: 'Journey Title',
    visitor: {
      createdAt: new Date('2024-05-27T23:39:28.000Z'),
      duration: 10,
      events: [
        {
          ...event,
          typename: 'TextResponseSubmissionEvent',
          id: 'event 1',
          label: 'Text Response Submission Event',
          value: 'My mom is sick'
        },
        {
          ...event,
          typename: 'ChatOpenEvent',
          id: 'event 2',
          label: 'Chat Open Event',
          value: '12:00 PM'
        },
        {
          ...event,
          typename: 'RadioQuestionSubmissionEvent',
          id: 'event 3',
          label: 'Radio Question Submission Event',
          value: 'Health'
        },
        {
          ...event,
          typename: 'StepViewEvent',
          id: 'event 4',
          label: 'Step View Event'
        }
      ]
    },
    recipient: {
      firstName: 'Joe',
      lastName: 'Ro-Nimo',
      email: 'jron@example.com',
      imageUrl:
        'https://images.unsplash.com/photo-1706565026381-29cd21eb9a7c?q=80&w=5464&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    analyticsUrl: 'localhost:4200/journeys/journeyId/reports/visitors',
    unsubscribeUrl: 'localhost:4200/journeys/journeyId?manageAccess'
  }
}

export default VisitorInteractionDemo
