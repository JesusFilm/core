import { Story, Meta } from '@storybook/react'
import { journeyUiConfig, StoryCard, TreeBlock } from '../..'
import {
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  IconName,
  IconSize
} from '../../../__generated__/globalTypes'
import { ButtonFields } from './__generated__/ButtonFields'
import { Button } from '.'

const ButtonDemo = {
  ...journeyUiConfig,
  component: Button,
  title: 'Journeys-Ui/Button'
}

interface ButtonStoryProps extends TreeBlock<ButtonFields> {
  variants: string[]
}

const Template: Story<ButtonStoryProps> = ({ ...args }) => (
  <StoryCard>
    <Button {...args} id="id" />
  </StoryCard>
)

export const Variant = Template.bind({})
Variant.args = { label: ButtonVariant.contained, children: [] }

const ColorTemplate: Story<ButtonStoryProps> = ({ ...args }) => (
  <StoryCard>
    {args.variants.map((variant, i) => (
      <Button
        {...args}
        id="id"
        key={i}
        label={`${variant} ${variant === 'primary' ? '(Default)' : ''}`}
        buttonColor={variant as ButtonColor}
      />
    ))}
  </StoryCard>
)

export const Color = ColorTemplate.bind({})
Color.args = {
  variants: [ButtonColor.primary, ButtonColor.secondary, ButtonColor.error],
  children: []
}

const SizeTemplate: Story<ButtonStoryProps> = ({ ...args }) => (
  <StoryCard>
    <Typography variant="overline" gutterBottom>
      Some element above
    </Typography>
    {args.variants.map((variant, i) => (
      <Button
        {...args}
        id="id"
        key={i}
        label={`${variant ?? ''}`}
        size={variant as ButtonSize}
      />
    ))}
    <Typography variant="body1" gutterBottom>
      Some element below
    </Typography>
  </StoryCard>
)

export const Size = SizeTemplate.bind({})
Size.args = {
  variants: [ButtonSize.small, ButtonSize.medium, ButtonSize.large],
  children: []
}

const IconTemplate: Story<ButtonStoryProps> = ({ ...args }) => {
  return (
    <StoryCard>
      {args.variants.map((variant: string, i) => (
        <Button
          {...args}
          id="id"
          key={i}
          label={`${variant} Icon`}
          startIconId={'start'}
          endIconId={'end'}
          // eslint-disable-next-line react/no-children-prop
          children={
            variant === 'Start'
              ? [
                  {
                    id: 'start',
                    __typename: 'IconBlock',
                    parentBlockId: 'id',
                    parentOrder: 0,
                    iconName: IconName.CheckCircleRounded,
                    iconColor: null,
                    iconSize: IconSize.md,
                    children: []
                  }
                ]
              : [
                  {
                    id: 'end',
                    __typename: 'IconBlock',
                    parentBlockId: 'id',
                    parentOrder: 0,
                    iconName: IconName.CheckCircleRounded,
                    iconColor: null,
                    iconSize: IconSize.md,
                    children: []
                  }
                ]
          }
        />
      ))}
    </StoryCard>
  )
}

export const Icon = IconTemplate.bind({})
Icon.args = { variants: ['Start', 'End'] }

export default ButtonDemo as Meta
