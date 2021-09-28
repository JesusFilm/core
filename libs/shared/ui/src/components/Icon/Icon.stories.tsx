import { ReactElement, ReactNode } from 'react'
import { Story, Meta } from '@storybook/react'
import { Icon, IconProps } from '.'
import { Box } from '@mui/system'
import { Typography, useTheme } from '@mui/material'
import {
  IconName,
  IconSize,
  IconColor
} from '../../../__generated__/globalTypes'

import { sharedUiConfig } from '../../libs/storybook/decorators'

const IconDemo = {
  ...sharedUiConfig,
  component: Icon,
  title: 'shared-ui/Icon'
}

interface IconStoryProps extends IconProps {
  variants: string[]
}

// TODO: Replace with real card component
interface CardProps {
  children: ReactNode
}

const Card = ({ children }: CardProps): ReactElement => {
  const theme = useTheme()
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.surface.main,
        color: theme.palette.surface.contrastText,
        p: theme.space.lg,
        borderRadius: 4,
        mb: theme.space.lg
      }}
    >
      {children}
    </Box>
  )
}

const VariantTemplate: Story<IconStoryProps> = ({ ...args }) => (
  <Card>
    {args.variants.map((variant) => (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Typography>{`${variant}`}</Typography>
        <Icon {...args} name={variant as IconName} />
      </Box>
    ))}
  </Card>
)

export const Variant = VariantTemplate.bind({})
Variant.args = {
  __typename: 'Icon',
  color: null,
  size: IconSize.lg,
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
  <Card>
    {args.variants.map((variant) => (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Typography>{`${variant}`}</Typography>
        <Icon {...args} color={variant as IconColor} />
      </Box>
    ))}
  </Card>
)

export const Color = ColorTemplate.bind({})
Color.args = {
  __typename: 'Icon',
  name: IconName.CheckCircle,
  size: IconSize.lg,
  variants: [
    IconColor.inherit,
    IconColor.primary,
    IconColor.secondary,
    IconColor.error,
    IconColor.action,
    IconColor.disabled,
  ]
}

const SizeTemplate: Story<IconStoryProps> = ({ ...args }) => (
  <Card>
    {args.variants.map((variant) => (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Typography>{`${variant}`}</Typography>
        <Icon {...args} size={variant as IconSize} />
      </Box>
    ))}
  </Card>
)

export const Size = SizeTemplate.bind({})
Size.args = {
  __typename: 'Icon',
  name: IconName.CheckCircle,
  color: null,
  variants: [
    IconSize.inherit,
    IconSize.sm,
    IconSize.md,
    IconSize.lg,
    IconSize.xl,
  ]
}

export default IconDemo as Meta
