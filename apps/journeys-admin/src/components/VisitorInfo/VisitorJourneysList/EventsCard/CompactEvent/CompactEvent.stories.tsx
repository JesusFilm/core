import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'

import { simpleComponentConfig } from '../../../../../libs/storybook'

import { CompactEvent } from '.'

const CompactEventStory: Meta<typeof CompactEvent> = {
  ...simpleComponentConfig,
  title:
    'Journeys-Admin/VisitorInfo/VisitorJourneysList/EventsCard/CompactEvent'
}

const Template: StoryObj<typeof CompactEvent> = {
  render: ({ ...args }) => <CompactEvent {...args} />
}

export const Default = {
  ...Template,
  args: {
    value: '3 more cards',
    onClick: noop
  }
}

export default CompactEventStory
