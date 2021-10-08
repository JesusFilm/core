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

const Template: Story<ButtonStoryProps> = ({ ...args }) => (
  <StoryCard>
    <Button {...args} />
  </StoryCard>
)

export const Variant = Template.bind({})
Variant.args = {
  buttonVariant: ButtonVariant.contained,
  label: ButtonVariant.contained
}

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
  buttonVariant: ButtonVariant.contained,
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
  buttonVariant: ButtonVariant.contained,
  variants: [ButtonSize.small, ButtonSize.medium, ButtonSize.large]
}

const IconTemplate: Story<ButtonStoryProps> = ({ ...args }) => (
  <StoryCard>
    <Button {...args} />
    <Button
      {...args}
      label="End Icon"
      endIcon={args.startIcon}
      startIcon={null}
    />
  </StoryCard>
)

export const Icon = IconTemplate.bind({})
Icon.args = {
  label: 'Start Icon',
  buttonVariant: ButtonVariant.contained,
  startIcon: {
    __typename: 'Icon',
    name: IconName.CheckCircle,
    color: null,
    size: IconSize.md
  }
}

export default ButtonDemo as Meta
