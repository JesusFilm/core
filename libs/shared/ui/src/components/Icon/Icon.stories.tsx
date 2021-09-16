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

const Template: Story<IconStoryProps> = (args) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column'
  }}>
    {args.variants.map((variant) => (
      <Icon icon={variant} />
    ))}
  </div>
)

export const Icons = Template.bind({})
Icons.args = {
  variants: [IconName.ArrowForward, IconName.CheckCircle, IconName.FormatQuote, IconName.LiveTv, IconName.LockOpen, IconName.MenuBook, IconName.PlayArrow, IconName.RadioButtonUnchecked, IconName.Translate]
}

export default IconDemo as Meta
