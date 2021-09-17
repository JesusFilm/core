import { Story, Meta } from '@storybook/react'
import { Button, ButtonProps } from '.'
import { ButtonBlockVariant, ButtonColor, ButtonSize, IconColor, IconName } from '../../../__generated__/globalTypes'

const ButtonDemo = {
  component: Button,
  title: 'shared-ui/Button'
}

interface ButtonStoryProps extends ButtonProps {
  variants: string[]
}

const VariantTemplate: Story<ButtonStoryProps> = ({ ...args }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column'
  }}>
    {args.variants.map((variant) => (
      <Button {...args} label={`${variant}`} variant={variant as ButtonBlockVariant} />
    ))}
  </div>
)

export const Variant = VariantTemplate.bind({})
Variant.args = {
  __typename: 'ButtonBlock',
  id: 'button',
  parentBlockId: 'question',
  startIcon: null,
  endIcon: null,
  variants: [ButtonBlockVariant.contained, ButtonBlockVariant.outlined, ButtonBlockVariant.text]
}

const ColorTemplate: Story<ButtonStoryProps> = ({ ...args }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column'
  }}>
    {args.variants.map((variant) => (
      <Button {...args} label={`${variant}`} color={variant as ButtonColor} />
    ))}
  </div>
)

export const Color = ColorTemplate.bind({})
Color.args = {
  __typename: 'ButtonBlock',
  id: 'button',
  variant: ButtonBlockVariant.contained,
  parentBlockId: 'question',
  startIcon: null,
  endIcon: null,
  variants: [ButtonColor.primary, ButtonColor.secondary, ButtonColor.success, ButtonColor.warning, ButtonColor.error, ButtonColor.info]
}

const SizeTemplate: Story<ButtonStoryProps> = ({ ...args }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column'
  }}>
    {args.variants.map((variant) => (
      <Button {...args} label={`${variant}`} size={variant as ButtonSize} />
    ))}
  </div>
)

export const Size = SizeTemplate.bind({})
Size.args = {
  __typename: 'ButtonBlock',
  id: 'button',
  parentBlockId: 'question',
  variant: ButtonBlockVariant.contained,
  startIcon: null,
  endIcon: null,
  variants: [ButtonSize.small, ButtonSize.medium, ButtonSize.large]
}

const IconTemplate: Story<ButtonStoryProps> = ({ ...args }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column'
  }}>
    <Button {...args} />
  </div>
)

export const startIcon = IconTemplate.bind({})
startIcon.args = {
  __typename: 'ButtonBlock',
  id: 'button',
  parentBlockId: 'question',
  label: 'Start Icon',
  variant: ButtonBlockVariant.contained,
  startIcon: {
    __typename: 'Icon',
    name: IconName.CheckCircle,
    color: IconColor.inherit,
    fontSize: '48px'
  },
  endIcon: null
}

export const endIcon = IconTemplate.bind({})
endIcon.args = {
  __typename: 'ButtonBlock',
  id: 'button',
  parentBlockId: 'question',
  label: 'End Icon',
  variant: ButtonBlockVariant.contained,
  startIcon: null,
  endIcon: {
    __typename: 'Icon',
    name: IconName.CheckCircle,
    color: IconColor.inherit,
    fontSize: '48px'
  }
}

const Template: Story<ButtonStoryProps> = ({ ...args }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column'
  }}>
    <Button {...args} />
  </div>
)

export const Loading = Template.bind({})
Loading.args = {
  __typename: 'ButtonBlock',
  id: 'button',
  parentBlockId: 'question',
  label: 'End Icon',
  variant: ButtonBlockVariant.contained,
  startIcon: null,
  endIcon: null,
  loading: false
}

export const Disabled = Template.bind({})
Disabled.args = {
  __typename: 'ButtonBlock',
  id: 'button',
  parentBlockId: 'question',
  label: 'End Icon',
  variant: ButtonBlockVariant.contained,
  startIcon: null,
  endIcon: null,
  disabled: true
}

export default ButtonDemo as Meta
