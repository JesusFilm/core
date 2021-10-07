import { ReactElement, ReactNode } from 'react'
import { Story, Meta } from '@storybook/react'
import { Box } from '@mui/system'
import { Button } from '.'
import {
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  IconName,
  IconSize
} from '../../../../__generated__/globalTypes'
import { journeysConfig } from '../../../libs/storybook/config'
import { ButtonFields } from '../../../../__generated__/ButtonFields'
import { Typography } from '@mui/material'

const ButtonDemo = {
  ...journeysConfig,
  component: Button,
  title: 'Journeys/Blocks/Button'
}

interface ButtonStoryProps extends ButtonFields {
  variants: Array<string | null>
}

interface CardProps {
  background?: string
  children: ReactNode
}

const Card = ({ children }: CardProps): ReactElement => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {children}
    </Box>
  )
}

const VariantTemplate: Story<ButtonStoryProps> = ({ ...args }) => (
  <Card>
    <Button {...args} />
  </Card>
)

export const Variant = VariantTemplate.bind({})
Variant.args = {
  buttonVariant: ButtonVariant.contained,
  label: ButtonVariant.contained
}

const ColorTemplate: Story<ButtonStoryProps> = ({ ...args }) => (
  <Card>
    {args.variants.map((variant, i) => (
      <Button
        {...args}
        key={i}
        label={variant === null ? 'default' : `${variant}`}
        buttonColor={variant as ButtonColor}
      />
    ))}
  </Card>
)

export const Color = ColorTemplate.bind({})
Color.args = {
  buttonVariant: ButtonVariant.contained,
  variants: [
    null,
    ButtonColor.primary,
    ButtonColor.secondary,
    ButtonColor.error
  ]
}

const SizeTemplate: Story<ButtonStoryProps> = ({ ...args }) => (
  <Card>
    {args.variants.map((variant, i) => (
      <>
        <Button
          {...args}
          key={i}
          label={`${variant ?? ''}`}
          size={variant as ButtonSize}
        />
        <Typography variant="h6" gutterBottom>
          Some element under it
        </Typography>
      </>
    ))}
  </Card>
)

export const Size = SizeTemplate.bind({})
Size.args = {
  buttonVariant: ButtonVariant.contained,
  variants: [ButtonSize.small, ButtonSize.medium, ButtonSize.large]
}

const IconTemplate: Story<ButtonStoryProps> = ({ ...args }) => (
  <Card>
    <Button {...args} />
  </Card>
)

export const startIcon = IconTemplate.bind({})
startIcon.args = {
  label: 'Start Icon',
  buttonVariant: ButtonVariant.contained,
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
  buttonVariant: ButtonVariant.contained,
  endIcon: {
    __typename: 'Icon',
    name: IconName.CheckCircle,
    color: null,
    size: IconSize.md
  }
}

export default ButtonDemo as Meta
