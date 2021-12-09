import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'

import { journeysAdminConfig } from '../../../libs/storybook'
import CardOverview from '.'
import { steps } from './CardOverviewData'

const CardOverviewDemo = {
  ...journeysAdminConfig,
  component: CardOverview,
  title: 'Journeys-Admin/SingleJourney/CardOverview'
}

const Template: Story = ({ ...args }) => (
  <MockedProvider>
    <CardOverview slug={'my-journey'} {...args} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  blocks: steps
}

export const NoCards = Template.bind({})
Default.args = {
  blocks: []
}

export const ManyCards = Template.bind({})
ManyCards.args = {
  blocks: steps.concat(steps).concat(steps)
}

export default CardOverviewDemo as Meta
