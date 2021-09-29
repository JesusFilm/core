import { ReactElement, ReactNode } from 'react'
import { Story, Meta } from '@storybook/react'
import { Box } from '@mui/system'
import { Button, ButtonProps } from '.'
import {
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  IconName,
  IconSize
} from '../../../../__generated__/globalTypes'
import { journeysConfig } from '../../../libs/storybook/decorators'

const ButtonDemo = {
  ...journeysConfig,
  component: Button,
  title: 'Journeys/Blocks/Button'
}

interface ButtonStoryProps extends ButtonProps {
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
  variant: ButtonVariant.contained,
  label: ButtonVariant.contained
}

const ColorTemplate: Story<ButtonStoryProps> = ({ ...args }) => (
  <Card>
    {args.variants.map((variant, i) => (
      <Button
        {...args}
        key={i}
        label={variant === null ? 'Default' : `${variant}`}
        color={variant as ButtonColor}
      />
    ))}
  </Card>
)

export const Color = ColorTemplate.bind({})
Color.args = {
  variant: ButtonVariant.contained,
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
      <Button
        {...args}
        key={i}
        label={`${variant ?? ''}`}
        size={variant as ButtonSize}
      />
    ))}
  </Card>
)

export const Size = SizeTemplate.bind({})
Size.args = {
  variant: ButtonVariant.contained,
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
