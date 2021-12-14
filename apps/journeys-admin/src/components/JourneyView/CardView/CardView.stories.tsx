import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../libs/storybook'
import { CardView, CardViewProps } from './CardView'
import { steps } from './data'

const CardViewDemo = {
  ...journeysAdminConfig,
  component: CardView,
  title: 'Journeys-Admin/JourneyView/CardView'
}

const Template: Story<Omit<CardViewProps, 'slug'>> = ({ ...args }) => (
  <MockedProvider>
    <CardView slug={'my-journey'} {...args} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  blocks: steps
}

export const NoCards = Template.bind({})
NoCards.args = {
  blocks: []
}

export const ManyCards = Template.bind({})
ManyCards.args = {
  blocks: steps.concat(steps).concat(steps)
}

export default CardViewDemo as Meta
