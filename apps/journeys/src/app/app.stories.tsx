import { Story, Meta } from '@storybook/react'
import { App } from './app'

const Demo = {
  component: App,
  title: 'AppJourney'
}

const Template: Story = (args) => <App {...args} />

export const Primary = Template.bind({})
Primary.args = {}

export default Demo as Meta
