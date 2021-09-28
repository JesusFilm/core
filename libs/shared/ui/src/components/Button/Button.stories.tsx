import { ReactElement, ReactNode } from 'react'
import { Story, Meta } from '@storybook/react'
import { Button, ButtonProps } from '.'
import { useTheme, Box, Typography } from '@mui/material'
import {
  ButtonVariant,
  ButtonColor,
  ButtonSize,
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
  variants: Array<string | null>
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

const VariantTemplate: Story<ButtonStoryProps> = ({ ...args }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    <Button
      {...args}
    />
  </div>
)

export const Variant = VariantTemplate.bind({})
Variant.args = {
  variant: ButtonVariant.contained,
  label: ButtonVariant.contained
}

const ColorTemplate: Story<ButtonStoryProps> = ({ ...args }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    {args.variants.map((variant) => (
      <Button {...args} label={variant === null ? '' : `${variant}`} color={variant as ButtonColor} />
    ))}
  </div>
)

export const Color = ColorTemplate.bind({})
Color.args = {
  variant: ButtonVariant.contained,
  variants: [null, ButtonColor.primary, ButtonColor.secondary, ButtonColor.error]
}

const SizeTemplate: Story<ButtonStoryProps> = ({ ...args }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    {args.variants.map((variant) => (
      <Button {...args} label={`${variant ?? ''}`} size={variant as ButtonSize} />
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
    color: null,
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
    color: null,
    size: IconSize.md
  }
}

const Template: Story<ButtonStoryProps> = ({ ...args }) => (
  <Card>
    <Typography>{args.label}</Typography>
    <Button {...args} />
  </Card>
)

export const Loading = Template.bind({})
Loading.args = {
  label: 'Loading Button',
  variant: ButtonVariant.contained,
  loading: false
}

export const Disabled = Template.bind({})
Disabled.args = {
  label: 'Disabled Button',
  variant: ButtonVariant.contained,
  disabled: true
}

export default ButtonDemo as Meta
