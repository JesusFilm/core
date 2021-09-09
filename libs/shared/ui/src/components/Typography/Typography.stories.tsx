import { Story, Meta } from '@storybook/react'
import { Typography, TypographyProps } from './Typography'

const TypographyDemo = {
  component: Typography,
  title: 'shared-ui/Typography'
}

const Template: Story<TypographyProps> = (args) => <Typography {...args} />

export const Primary = Template.bind({})
Primary.args = {
  content: 'hello world'
}

export default TypographyDemo as Meta
