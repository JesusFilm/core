import { Story, Meta } from '@storybook/react'
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
  variants: ['playArrow', 'translate', 'checkCircle', 'radioButtonUnchecked', 'formatQuote', 'lockOpen', 'arrowForward', 'chatBubbleOutline', 'liveTv', 'menuBook']
}

export default IconDemo as Meta
