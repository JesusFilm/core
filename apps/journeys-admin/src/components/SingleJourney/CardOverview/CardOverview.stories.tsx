import { Story, Meta } from '@storybook/react'

import { journeysAdminConfig } from '../../../libs/storybook'
import CardOverview, { CardOverviewProps } from '.'

const CardOverviewDemo = {
  ...journeysAdminConfig,
  component: CardOverview,
  title: 'Journeys-Admin/SingleJourney/CardOverview'
}

const Template: Story<CardOverviewProps> = ({ ...args }) => (
  <CardOverview {...args} />
)

export const Default = Template.bind({})
Default.args = {
  slug: 'my-journey'
}

export default CardOverviewDemo as Meta
