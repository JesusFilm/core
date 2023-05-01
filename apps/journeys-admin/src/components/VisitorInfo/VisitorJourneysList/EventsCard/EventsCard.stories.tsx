import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'
import { screen, userEvent, waitFor } from '@storybook/testing-library'
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
  await waitFor(() => {
    userEvent.click(screen.getByRole('button', { name: '3 more events' }))
  })
}

export default EventsCardStory as Meta
