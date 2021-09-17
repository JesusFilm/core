import { Story, Meta } from '@storybook/react'
import { Typography, TypographyProps } from './Typography'
import {
  TypographyVariant,
  TypographyColor,
  TypographyAlign
} from './../../../__generated__/globalTypes'

const TypographyDemo = {
  component: Typography,
  title: 'shared-ui/Typography'
}

interface TypographyStoryProps extends TypographyProps {
  variants: string[]
}

const VariantTemplate: Story<TypographyStoryProps> = (args) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    {args.variants.map((variant) => (
      <Typography
        {...args}
        variant={variant as TypographyVariant}
        content={`${variant}`}
      />
    ))}
  </div>
)

export const Variants = VariantTemplate.bind({})
Variants.args = {
  variants: [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'subtitle1',
    'subtitle2',
    'body1',
    'body2',
    'button',
    'caption',
    'overline'
  ]
}

const ColorTemplate: Story<TypographyStoryProps> = (args) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    {args.variants.map((variant) => (
      <Typography
        {...args}
        color={variant as TypographyColor}
        content={`${variant}`}
      />
    ))}
  </div>
)

export const Colors = ColorTemplate.bind({})
Colors.args = {
  variants: ['primary', 'secondary', 'error', 'warning', 'info', 'success']
}

const AlignmentTemplate: Story<TypographyStoryProps> = (args) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    {args.variants.map((variant) => (
      <Typography
        {...args}
        align={variant as TypographyAlign}
        content={`${variant}`}
      />
    ))}
  </div>
)

export const Alignment = AlignmentTemplate.bind({})
Alignment.args = {
  variants: ['left', 'center', 'right']
}

export default TypographyDemo as Meta
