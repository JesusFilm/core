import { Story, Meta } from '@storybook/react'
import { Button, ButtonProps } from '.'
import {
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  IconColor,
  IconName,
  IconSize
} from '../../../__generated__/globalTypes'
import { sharedUiConfig } from '../../libs/storybook/decorators'

const ButtonDemo = {
  ...sharedUiConfig,
  component: Button,
  title: 'shared-ui/Button'
}

interface ButtonStoryProps extends ButtonProps {
  variants: string[]
}

const DefaultTemplate: Story<ButtonStoryProps> = ({ ...args }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    <Button {...args} color={'error' as ButtonColor} />
  </div>
)

export const Default = DefaultTemplate.bind({})
Default.args = {
  variant: ButtonVariant.contained,
  label: ButtonVariant.contained,
  size: ButtonSize.large
}

const VariantTemplate: Story<ButtonStoryProps> = ({ ...args }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    {args.variants.map((variant) => (
      <Button
        {...args}
        label={`${variant}`}
        variant={variant as ButtonVariant}
      />
    ))}
  </div>
)

export const Variant = VariantTemplate.bind({})
Variant.args = {
  variants: [ButtonVariant.contained, ButtonVariant.text]
}

const ColorTemplate: Story<ButtonStoryProps> = ({ ...args }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    {args.variants.map((variant) => (
      <Button {...args} label={`${variant}`} color={variant as ButtonColor} />
    ))}
  </div>
)

export const Color = ColorTemplate.bind({})
Color.args = {
  variant: ButtonVariant.contained,
  variants: [ButtonColor.primary, ButtonColor.secondary, ButtonColor.error]
}

const SizeTemplate: Story<ButtonStoryProps> = ({ ...args }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    {args.variants.map((variant) => (
      <Button {...args} label={`${variant}`} size={variant as ButtonSize} />
    ))}
  </div>
)

export const Size = SizeTemplate.bind({})
Size.args = {
  variant: ButtonVariant.contained,
  variants: [ButtonSize.small, ButtonSize.medium, ButtonSize.large]
}

const IconTemplate: Story<ButtonStoryProps> = ({ ...args }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    <Button {...args} />
  </div>
)

export const startIcon = IconTemplate.bind({})
startIcon.args = {
  label: 'Start Icon',
  variant: ButtonVariant.contained,
  startIcon: {
    __typename: 'Icon',
    name: IconName.CheckCircle,
    color: IconColor.inherit,
    size: IconSize.md
  }
}

export const endIcon = IconTemplate.bind({})
endIcon.args = {
  label: 'End Icon',
  variant: ButtonVariant.contained,
  endIcon: {
    __typename: 'Icon',
    name: IconName.CheckCircle,
    color: IconColor.inherit,
    size: IconSize.md
  }
}

const Template: Story<ButtonStoryProps> = ({ ...args }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    <Button {...args} />
  </div>
)

export const Loading = Template.bind({})
Loading.args = {
  label: 'Loading',
  variant: ButtonVariant.contained,
  loading: false
}

export const Disabled = Template.bind({})
Disabled.args = {
  label: 'Disabled',
  variant: ButtonVariant.contained,
  disabled: true
}

export default ButtonDemo as Meta
