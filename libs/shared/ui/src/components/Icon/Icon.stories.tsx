import { Story, Meta } from '@storybook/react'
import {
  IconName,
  IconSize,
  IconColor
} from '../../../__generated__/globalTypes'
import { Icon, IconProps } from '.'

const IconDemo = {
  component: Icon,
  title: 'shared-ui/Icon'
}

interface IconStoryProps extends IconProps {
  variants: string[]
}

const VariantTemplate: Story<IconStoryProps> = ({ ...args }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    {args.variants.map((variant) => (
      <Icon {...args} name={variant as IconName} />
    ))}
  </div>
)

export const Variant = VariantTemplate.bind({})
Variant.args = {
  __typename: 'Icon',
  color: null,
  size: null,
  variants: [
    IconName.ArrowForward,
    IconName.ChatBubbleOutline,
    IconName.CheckCircle,
    IconName.FormatQuote,
    IconName.LiveTv,
    IconName.LockOpen,
    IconName.MenuBook,
    IconName.PlayArrow,
    IconName.RadioButtonUnchecked,
    IconName.Translate
  ]
}

const ColorTemplate: Story<IconStoryProps> = ({ ...args }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    {args.variants.map((variant) => (
      <Icon {...args} color={variant as IconColor} />
    ))}
  </div>
)

export const Color = ColorTemplate.bind({})
Color.args = {
  __typename: 'Icon',
  name: IconName.CheckCircle,
  size: IconSize.md,
  variants: [
    IconColor.primary,
    IconColor.secondary,
    IconColor.error,
    IconColor.action,
    IconColor.disabled,
    IconColor.inherit
  ]
}

const SizeTemplate: Story<IconStoryProps> = ({ ...args }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    {args.variants.map((variant) => (
      <Icon {...args} size={variant as IconSize} />
    ))}
  </div>
)

export const Size = SizeTemplate.bind({})
Size.args = {
  __typename: 'Icon',
  name: IconName.CheckCircle,
  color: null,
  variants: [
    IconSize.sm,
    IconSize.md,
    IconSize.lg,
    IconSize.xl,
    IconSize.inherit
  ]
}

export default IconDemo as Meta
