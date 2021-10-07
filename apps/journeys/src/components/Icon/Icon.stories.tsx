import { ReactElement, ReactNode } from 'react'
import { Story, Meta } from '@storybook/react'
import { Icon } from '.'
import { Box } from '@mui/system'
import { Typography, useTheme } from '@mui/material'
import {
  IconName,
  IconSize,
  IconColor
} from '../../../__generated__/globalTypes'

import { ButtonFields_startIcon as IconType } from '../../../__generated__/ButtonFields'
import { journeysConfig } from '../../libs/storybook/decorators'

const IconDemo = {
  ...journeysConfig,
  component: Icon,
  title: 'Journeys/Icon'
}

interface IconStoryProps extends IconType {
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
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        p: theme.spacing(3),
        borderRadius: 4,
        mb: theme.spacing(3)
      }}
    >
      {children}
    </Box>
  )
}

const IconColors = ({ children }: CardProps): ReactElement => {
  const theme = useTheme()
  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        color: theme.palette.primary.main,
        p: theme.spacing(3),
        mb: theme.spacing(4),
        borderRadius: '12px',
        boxShadow: theme.shadows[3]
      }}
    >
      {children}
    </Box>
  )
}

const VariantTemplate: Story<IconStoryProps> = ({ ...args }) => (
  <Card>
    {args.variants.map((variant, i) => (
      <Box
        key={i}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between'
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
  <IconColors>
    {args.variants.map((variant, i) => (
      <Box
        key={i}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
      >
        <Typography>{`${variant}`}</Typography>
        <Icon {...args} color={variant as IconColor} />
      </Box>
    ))}
  </IconColors>
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
    IconColor.disabled
  ]
}

const SizeTemplate: Story<IconStoryProps> = ({ ...args }) => (
  <Card>
    {args.variants.map((variant, i) => (
      <Box
        key={i}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between'
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
    IconSize.xl
  ]
}

export default IconDemo as Meta
