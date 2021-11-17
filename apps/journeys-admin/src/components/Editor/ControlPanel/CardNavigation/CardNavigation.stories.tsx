import { Story, Meta } from '@storybook/react'
import { journeyAdminConfig } from '../../../../libs/storybook'
import { CardNavigation } from '.'

const CardNavigationStory = {
  ...journeyAdminConfig,
  component: CardNavigation,
  title: 'JourneyAdmin/Editor/ControlPanel/CardNavigation'
}

const Template: Story = () => <CardNavigation />

export const Default = Template.bind({})

export default CardNavigationStory as Meta
