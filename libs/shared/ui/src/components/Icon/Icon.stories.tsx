import { Story, Meta } from '@storybook/react'
import { IconName } from '../../../__generated__/globalTypes'
import { Icon, IconProps } from '.'

const IconDemo = {
  component: Icon,
  title: 'shared-ui/Icon'
}

interface IconStoryProps extends IconProps {
  variants: string[]
}

const VariantTemplate: Story<IconStoryProps> = ({ ...args }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column'
  }}>
    {args.variants.map((variant) => (
      <Icon {...args} name={variant as IconName} />
    ))}
  </div>
)

export const Variant = VariantTemplate.bind({})
Variant.args = {
  __typename: 'Icon',
  color: null,
  fontSize: null,
  variants: [IconName.ArrowForward, IconName.ChatBubbleOutline, IconName.CheckCircle, IconName.FormatQuote, IconName.LiveTv, IconName.LockOpen, IconName.MenuBook, IconName.PlayArrow, IconName.RadioButtonUnchecked, IconName.Translate]
}

const SizeTemplate: Story<IconStoryProps> = ({ ...args }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column'
  }}>
    {args.variants.map((variant) => (
      <Icon {...args} fontSize={variant} />
    ))}
  </div>
)

export const Size = SizeTemplate.bind({})
Size.args = {
  __typename: 'Icon',
  name: IconName.CheckCircle,
  color: null,
  variants: ['40px', '20px', '10px']
}

export default IconDemo as Meta
