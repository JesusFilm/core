import { Story, Meta } from '@storybook/react'
import { Button } from '.'
import {
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  IconName,
  IconSize
} from '../../../../__generated__/globalTypes'
import { journeysConfig, StoryCard } from '../../../libs/storybook'
import {
  ButtonFields,
  ButtonFields_startIcon as StartIcon,
  ButtonFields_endIcon as EndIcon
} from '../../../../__generated__/ButtonFields'
import { Typography } from '@mui/material'

const ButtonDemo = {
  ...journeysConfig,
  component: Button,
  title: 'Journeys/Blocks/Button'
}

interface ButtonStoryProps extends ButtonFields {
  variants: Array<string | null>
}

const Template: Story<ButtonStoryProps> = ({ ...args }) => (
  <StoryCard>
    <Button {...args} />
  </StoryCard>
)

export const Variant = Template.bind({})
Variant.args = { label: ButtonVariant.contained }

const ColorTemplate: Story<ButtonStoryProps> = ({ ...args }) => (
  <StoryCard>
    {args.variants.map((variant, i) => (
      <Button
        {...args}
        key={i}
        label={variant === null ? 'default' : `${variant}`}
        buttonColor={variant as ButtonColor}
      />
    ))}
  </StoryCard>
)

export const Color = ColorTemplate.bind({})
Color.args = {
  variants: [
    null,
    ButtonColor.primary,
    ButtonColor.secondary,
    ButtonColor.error
  ]
}

const SizeTemplate: Story<ButtonStoryProps> = ({ ...args }) => (
  <StoryCard>
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
  </StoryCard>
)

export const Size = SizeTemplate.bind({})
Size.args = {
  variants: [ButtonSize.small, ButtonSize.medium, ButtonSize.large]
}

const IconTemplate: Story<ButtonStoryProps> = ({ ...args }) => {
  const icon: StartIcon | EndIcon = {
    __typename: 'Icon',
    name: IconName.CheckCircle,
    color: null,
    size: IconSize.md
  }

  return (
    <StoryCard>
      {args.variants.map((variant: string, i) => (
        <Button
          {...args}
          key={i}
          label={`${variant} Icon`}
          startIcon={variant === 'Start' ? icon : null}
          endIcon={variant === 'End' ? icon : null}
        />
      ))}
    </StoryCard>
  )
}

export const Icon = IconTemplate.bind({})
Icon.args = { variants: ['Start', 'End'] }

export default ButtonDemo as Meta
