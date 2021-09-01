import { Story, Meta } from '@storybook/react'
import { Test } from './Test'

const Demo = {
  component: Test,
  title: 'Journeys/Blocks/Test'
}

const Template: Story = () => <Test />

export const Primary = Template.bind({})
Primary.args = {}

export default Demo as Meta
