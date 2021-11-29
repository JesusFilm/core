import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { CardNavigation } from '.'

const CardNavigationStory = {
  ...journeysAdminConfig,
  component: CardNavigation,
  title: 'Journeys-Admin/Editor/ControlPanel/CardNavigation'
}

const Template: Story = () => <CardNavigation />

export const Default = Template.bind({})

export default CardNavigationStory as Meta
