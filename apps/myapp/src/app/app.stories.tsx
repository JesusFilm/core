import { Story, Meta } from '@storybook/react'
import { App } from './app'

const Demo = {
  component: App,
  title: 'MyApp/app'
}

const Template: Story = () => <App />

export const Primary = Template.bind({})
Primary.args = {}

export default Demo as Meta
