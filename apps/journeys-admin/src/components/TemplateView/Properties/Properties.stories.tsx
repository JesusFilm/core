import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../libs/storybook'
import { Properties } from './Properties'

const PropertiesStory = {
  ...journeysAdminConfig,
  component: Properties,
  title: 'Journeys-Admin/TemplateView/Properties',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = () => <Properties />

export const Default = Template.bind({})

export default PropertiesStory as Meta
