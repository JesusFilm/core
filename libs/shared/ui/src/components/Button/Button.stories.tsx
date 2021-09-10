import { Story, Meta } from '@storybook/react'
import { Button, ButtonProps } from './Button'

const ButtonDemo = {
  component: Button,
  title: 'shared-ui/Button'
}

const Template: Story<ButtonProps> = (args) => <Button {...args}/>

export const Primary = Template.bind({})
Primary.args = {
  label: 'Button Text'
}

export default ButtonDemo as Meta
