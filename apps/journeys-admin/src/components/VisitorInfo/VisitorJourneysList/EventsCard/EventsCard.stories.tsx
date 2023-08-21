import { Meta, Story } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '../../../../libs/storybook'
import { journey } from '../utils/data'

import { EventsCard } from '.'

const EventsCardStory = {
  ...journeysAdminConfig,
  title: 'Journeys-Admin/VisitorInfo/VisitorJourneysList/EventsCard'
}

const Template: Story<ComponentProps<typeof EventsCard>> = ({ ...args }) => (
  <EventsCard {...args} />
)

export const Default = Template.bind({})
Default.args = {
  journey
}

export const Open = Template.bind({})
Open.args = {
  journey
}
Open.play = async () => {
  await userEvent.click(screen.getByRole('button', { name: '8 more events' }))
}

export const Empty = Template.bind({})
Empty.args = {
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
              __typename: 'Translation',
              value: 'English'
            }
          ]
        },
        value: '529'
      }
    ]
  }
}

export default EventsCardStory as Meta
