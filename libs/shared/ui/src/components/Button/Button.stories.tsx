import { Story, Meta } from '@storybook/react'
import { Button, ButtonProps, ButtonVariant, ButtonColor, ButtonSize } from './Button'

const ButtonDemo = {
  component: Button,
  title: 'shared-ui/Button'
}

interface ButtonStoryProps extends ButtonProps {
  variants: string[]
  colors: string[]
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

const VariantTemplate: Story<ButtonStoryProps> = (args) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column'
  }}>
    {args.variants.map((variant) => (
      <Button label={`${variant}`} variant={variant as ButtonVariant}/>
    ))}
  </div>
)

export const Variant = VariantTemplate.bind({})
Variant.args = {
  variants: ['contained', 'outlined', 'text']
}

const ColorTemplate: Story<ButtonStoryProps> = (args) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column'
  }}>
    {args.variants.map((variant) => (
      <Button label={`${variant}`} color={variant as ButtonColor} variant="contained"/>
    ))}
  </div>
)

export const Color = ColorTemplate.bind({})
Color.args = {
  variants: ['primary', 'secondary']
}

const SizeTemplate: Story<ButtonStoryProps> = (args) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column'
  }}>
    {args.variants.map((variant) => (
      <Button label={`${variant}`} size={variant as ButtonSize} variant="outlined"/>
    ))}
  </div>
)

export const Size = SizeTemplate.bind({})
Size.args = {
  variants: ['small', 'medium', 'large']
}

export default ButtonDemo as Meta
