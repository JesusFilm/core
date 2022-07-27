import { MockedProvider } from '@apollo/client/testing'
import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../libs/storybook'
import { CardView } from './CardView'
import { steps } from './data'

const CardViewStory = {
  ...journeysAdminConfig,
  component: CardView,
  title: 'Journeys-Admin/TemplateView/CardView',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }) => (
  <MockedProvider>
    <CardView {...args} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  blocks: steps
}

export default CardViewStory as Meta
