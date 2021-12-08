import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'

import { journeysAdminConfig } from '../../../libs/storybook'
import CardOverview from '.'
import { CardOverviewProps } from './CardOverview'
import { steps } from './CardOverviewData'

const CardOverviewDemo = {
  ...journeysAdminConfig,
  component: CardOverview,
  title: 'Journeys-Admin/SingleJourney/CardOverview'
}

const Template: Story<CardOverviewProps> = ({ ...args }) => (
  <MockedProvider>
    <CardOverview {...args} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  slug: 'my-journey',
  blocks: steps
}

export default CardOverviewDemo as Meta
