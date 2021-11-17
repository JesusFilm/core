import { Story, Meta } from '@storybook/react'
import { journeyAdminConfig } from '../../../../libs/storybook'
import { Attributes } from '.'

const AttributesStory = {
  ...journeyAdminConfig,
  component: Attributes,
  title: 'JourneyAdmin/Editor/ControlPanel/Attributes'
}

const Template: Story = () => <Attributes />

export const Default = Template.bind({})

export default AttributesStory as Meta
