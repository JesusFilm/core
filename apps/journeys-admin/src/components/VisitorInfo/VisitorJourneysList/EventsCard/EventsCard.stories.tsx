import { Meta, StoryObj } from '@storybook/nextjs'
import { screen, userEvent } from 'storybook/test'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { journey } from '../utils/data'

import { EventsCard } from '.'

import '../../../../../test/i18n'

const EventsCardStory: Meta<typeof EventsCard> = {
  ...journeysAdminConfig,
  title: 'Journeys-Admin/VisitorInfo/VisitorJourneysList/EventsCard',
  component: EventsCard
}

const Template: StoryObj<typeof EventsCard> = {
  render: ({ ...args }) => <EventsCard {...args} />
}

export const Default = {
  ...Template,
  args: {
    journey
  }
}

export const Open = {
  ...Template,
  args: {
    journey
  },
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: '8 more events' }))
  }
}

export const Empty = {
  ...Template,
  args: {
    journey: {
      id: 'emptyJourney.id',
      subtitle: 'English',
      title: 'Another Journey',
      createdAt: '2022-11-02T03:20:26.368Z',
      events: [
        {
          __typename: 'JourneyViewEvent',
          id: 'epmtyJourneyViewEventId',
          journeyId: 'emptyJourney.id',
          createdAt: '2022-11-02T03:20:26.368Z',
          label: 'Another Journey',
          language: {
            __typename: 'Language',
            id: 'languageId',
            name: [
              {
                __typename: 'LanguageName',
                value: 'English'
              }
            ]
          },
          value: '529'
        }
      ]
    }
  }
}

export default EventsCardStory
