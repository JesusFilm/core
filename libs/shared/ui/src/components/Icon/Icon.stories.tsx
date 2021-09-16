import { Story, Meta } from '@storybook/react'
import { IconColor, IconName, IconSize } from '../../../__generated__/globalTypes'
import { Icon, IconProps } from '.'

const IconDemo = {
  component: Icon,
  title: 'shared-ui/Icon'
}

interface IconStoryProps extends IconProps {
  variants: string[]
}

const VariantTemplate: Story<IconStoryProps> = (args) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column'
  }}>
    {args.variants.map((variant) => (
      <Icon name={variant} />
    ))}
  </div>
)

export const Variant = VariantTemplate.bind({})
Variant.args = {
  variants: [IconName.ArrowForward, IconName.ChatBubbleOutline, IconName.CheckCircle, IconName.FormatQuote, IconName.LiveTv, IconName.LockOpen, IconName.MenuBook, IconName.PlayArrow, IconName.RadioButtonUnchecked, IconName.Translate]
}

const ColorTemplate: Story<IconStoryProps> = (args) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column'
  }}>
    {args.variants.map((variant) => (
      <Icon name={IconName.CheckCircle} color={variant} />
    ))}
  </div>
)

export const Color = ColorTemplate.bind({})
Color.args = {
  variants: [IconColor.primary, IconColor.secondary, IconColor.error, IconColor.action, IconColor.disabled]
}

const SizeTemplate: Story<IconStoryProps> = (args) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column'
  }}>
    {args.variants.map((variant) => (
      <Icon name={IconName.CheckCircle} size={variant} />
    ))}
  </div>
)

export const Size = SizeTemplate.bind({})
Size.args = {
  variants: [IconSize.small, IconSize.medium, IconSize.large, IconSize.inherit]
}

export default IconDemo as Meta
