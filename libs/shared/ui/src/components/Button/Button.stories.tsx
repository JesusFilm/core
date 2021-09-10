import { Story, Meta } from '@storybook/react'
import { Button, ButtonProps } from './Button'

const ButtonDemo = {
  component: Button,
  title: 'shared-ui/Button'
}

interface ButtonStoryProps extends ButtonProps {
  variants: string[]
}

const Template: Story<ButtonStoryProps> = (args) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column'
  }}>
    <Button label="this is text" variant="outlined" color="primary" size="small"/>
  </div>
)

export const Primary = Template.bind({})
Primary.args = {
  label: 'Button Text'
}

export default ButtonDemo as Meta
