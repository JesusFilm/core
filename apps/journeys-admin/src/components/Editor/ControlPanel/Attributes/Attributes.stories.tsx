import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { Attributes } from '.'

const AttributesStory = {
  ...journeysAdminConfig,
  component: Attributes,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes'
}

const Template: Story = () => <Attributes />

export const Default = Template.bind({})

export default AttributesStory as Meta
