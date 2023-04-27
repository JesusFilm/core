import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'
import { noop } from 'lodash'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { CompactEvent } from '.'

const CompactEventStory = {
  ...simpleComponentConfig,
  title: 'Journeys-Admin/VisitorInfo/JourneyList/EventsCard/CompactEvent'
}

const Template: Story<ComponentProps<typeof CompactEvent>> = ({ ...args }) => (
  <CompactEvent {...args} />
)

export const Default = Template.bind({})
Default.args = {
  value: '3 more cards',
  onClick: noop
}

export default CompactEventStory as Meta
