import { Story, Meta } from '@storybook/react'

import { journeysAdminConfig } from '../../../libs/storybook'
import CardOverview from '.'

const CardOverviewDemo = {
  ...journeysAdminConfig,
  component: CardOverview,
  title: 'Journeys-Admin/SingleJourney/CardOverview'
}

const Template: Story = ({ ...args }) => <CardOverview slug={''} {...args} />

export const Default = Template.bind({})
Default.args = {
  slug: 'my-journey'
}

export default CardOverviewDemo as Meta
